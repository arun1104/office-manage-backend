import { ExcelUtility, S3, SQS } from "@n-oms/multi-tenant-shared";
import { getUniqueId, CacheStore } from "@utilities";
import { QUEUE_EVENTS} from "@constants";
import { IApplicationsSyncEvent } from "@interfaces";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { addEntityAttributes } from "./addEntitySpecificAttributes";
export class ExcelIntegration {
    static async start({ integrationInfo, mongoDal,tenantId,userInfo }: { integrationInfo: any, mongoDal: MongoDBClient, tenantId:string,userInfo:any }) {
        const { action } = integrationInfo;
        const s3Client = new S3();
        const cacheStore = new CacheStore();
        try {
            const bufferRes = await s3Client.getObjectBuffer({
                bucket: integrationInfo.bucketName,
                key: integrationInfo.dataSourceFilePath
            });
            const jsonRes = ExcelUtility.getJSONFromExcelBuffer(bufferRes);
            const mapperJson = await s3Client.getJSONObject({
                bucket: integrationInfo.bucketName,
                key: integrationInfo.mapperFilePath
            });
            const outputJson = ExcelIntegration.mapExcelToOutputJson({ excelJson: jsonRes, config: mapperJson });
            if (integrationInfo.onlySendSQSEvent) { 
                const orgInfo = await cacheStore.getOrgInfo(tenantId);
                await ExcelIntegration.sendBatchOfRowsWithLimitToSQS({ input:outputJson,orgInfo, userInfo })
            } else {
                await ExcelIntegration.putBatchOfRowsWithLimit({
                    input: outputJson, mongoDal,
                    resource: mapperJson.dataHandlingOptions.entity
                });
            }
        } catch (err) {
            console.log(`Error in ${action}`, err);
        }
    }

    static async sendBatchOfRowsWithLimitToSQS({ input,orgInfo, userInfo }) {
        const inputArray = input;
        const maxRowsInOneBatch = 20;
        const batchSize = maxRowsInOneBatch;
        const sqsClient = new SQS();
        for (let i = 0; i < inputArray.length; i += batchSize) {
            const batch = inputArray.slice(i, i + batchSize);
            try {
                const queueName = orgInfo?.eventConfigurations ? orgInfo?.eventConfigurations["syncApplications"] : null;
                if (queueName) {
                    const msgBody:IApplicationsSyncEvent = {
                        eventId:QUEUE_EVENTS.SYNC_APPLICATIONS,
                        createdBy: userInfo.email,
                        createdByName: userInfo.name,
                        eventDetails: {
                            applicationList: batch
                        },
                    }
                    await sqsClient.sendMessagesToQueue({ tenantId:'', queueName, msgBody });
                }
            } catch (error) {
                console.log('error while putting data', error);
                console.log('input data', batch);
                console.log('continuing with next batch');
            }
        }
    }

    static async putBatchOfRowsWithLimit({ input, mongoDal, resource }: {
        input: Array<any>,
        mongoDal: MongoDBClient, resource: string
    }) {
        const inputArray = input;
        const maxRowsInOneBatch = 20;
        const batchSize = maxRowsInOneBatch;
        for (let i = 0; i < inputArray.length; i += batchSize) {
            const batch = inputArray.slice(i, i + batchSize);
            try {
                await mongoDal.mongoCreate.insertMany({ resource, data: batch });
            } catch (error) {
                console.log('error while putting data', error);
                console.log('input data', batch);
                console.log('continuing with next batch');
            }
        }
    }

    static addCommonAttributes({ mappedRow, config }) {
        mappedRow['entity'] = config.dataHandlingOptions.entity;
        mappedRow['createdByEmail'] = 'integration';
        mappedRow['createdByName'] = 'integration';
        mappedRow['createdOn'] = Date.now().toString();
        mappedRow['creationContext'] = 'Excel_Integration';
        mappedRow['tenantId'] = config.dataHandlingOptions.tenantInfo.tenantId;
        mappedRow['branchId'] = config.dataHandlingOptions.tenantInfo.branchId;
    }

    static isTruthy(input: string | undefined | null): boolean {
        if (input === undefined || input === null) {
            return false;
        }
        const truthyValues = ['yes', 'on', 'true'];
        return truthyValues.includes(input.trim().toLowerCase());
    }

    static mapExcelToOutputJson = ({ excelJson, config }) => {
        return excelJson.map((row) => {
            const mappedRow: { [key: string]: any } = {};
            for (const [excelKey, mapping] of Object.entries(config.excelAttributeMapper)) {
                const { field, type, valueToFillIfNotPresent } = mapping as any;
                let value = row[excelKey as keyof typeof row];
                if (value === undefined || value === null || value === '') {
                    value = valueToFillIfNotPresent;
                }
                switch (type) {
                    case 'string':
                        value = String(value);
                        break;
                    case 'boolean':
                        value = ExcelIntegration.isTruthy(value)
                        break;
                    case 'number':
                        value = Number(value);
                        break;
                }
                mappedRow[field] = value;
            }
            ExcelIntegration.addCommonAttributes({ mappedRow, config })
            addEntityAttributes({ mappedRow, entity: config.dataHandlingOptions.entity })

            if (config.dataHandlingOptions.primaryKey) {
                mappedRow[config.dataHandlingOptions.primaryKey] = `${config.dataHandlingOptions.tenantInfo.tenantId}-${getUniqueId()}`
            }
            return mappedRow;
        });
    };
}