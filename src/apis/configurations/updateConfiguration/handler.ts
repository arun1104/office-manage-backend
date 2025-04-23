import { HTTP_RESOURCES, S3_FILE_PATHS } from "@constants";
import { IHandler, IReqInfo } from "@interfaces";
import { RedisClient, S3, MongoDBClient } from "@n-oms/multi-tenant-shared";
import { AuditHelper } from "@utilities";
import { Context } from "@enums";
import { z } from "zod";

export class UpdateConfigurationHandler implements IHandler {
    operation: string;
    s3BucketName: string;
    redisClient: RedisClient;
    s3Client: S3;
    mongoDal: MongoDBClient;
    operationId: string;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.CONFIGURATION.operationIdList.replaceConfiguration.operationType;
        this.operationId = HTTP_RESOURCES.CONFIGURATION.operationIdList.replaceConfiguration.name;
        this.resource = HTTP_RESOURCES.CONFIGURATION.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            branchId: z.string().max(100).optional(),
            configId: z.string().max(100),
            configuration: z.object({})
          })];
        this.s3Client = new S3();
        this.redisClient = new RedisClient();
        this.mongoDal = new MongoDBClient();
        this.handler = this.handler.bind(this);
        this.getS3FileThatStoresS3KeysOfConfigFiles = this.getS3FileThatStoresS3KeysOfConfigFiles.bind(this);
        this.updateConfiguration = this.updateConfiguration.bind(this);
        this.getFileFromS3 = this.getFileFromS3.bind(this);
        this.updateS3File = this.updateS3File.bind(this);
    }

    IsForbiddenConfigId(configId) {
        if (configId === 'apps') {
            return true;
        }
    }

    initiateAuditing({ userId, userName, creationContext, tenantId, reqBody }) {
        const audits = [];
        const baseAudit = AuditHelper.getEntityBaseAudit({
            userId, userName,
            creationContext,
            tenantId,
            operationId: this.operationId,
            resourceId: reqBody.configId,
            entity: 'Configurations',
        });
        audits.push(AuditHelper.getEntityCreateInitiateAudit({
            baseAudit,
            reqBody: JSON.stringify(reqBody),
        }));
        return { audits, baseAudit };
    }

    async handler(req: IReqInfo, res: any) {
        const { configId, configuration, branchId } = req.body;
        const tenantId = req.authorizationInfo.orgId;
        try {
            const { audits } = this.initiateAuditing({
                userId: req.userInfo.email,
                userName: req.userInfo.name,
                creationContext: Context.API,
                tenantId, reqBody: req.body
            });
            // To be uncommented: Allowing for dev purpose
            // const isForbidden = this.IsForbiddenConfigId(configId);
            // if (isForbidden) {
            //     res.status(400).send({ messgae: 'Bad request' }); 
            //     return;
            // }
            await this.updateConfiguration({ orgId: req.authorizationInfo.orgId, configId, configuration, branchId });
            AuditHelper.createReadOnlyEntries({ input: audits, mongoDal: this.mongoDal });
            res.status(HTTP_RESOURCES.CONFIGURATION.operationIdList.replaceConfiguration.outcomes.replacedConfigurationSuccessfully.statusCode).send();
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(HTTP_RESOURCES.CONFIGURATION.operationIdList.replaceConfiguration.outcomes.configurationUpdateError.statusCode).send({
                message: HTTP_RESOURCES.CONFIGURATION.operationIdList.replaceConfiguration.outcomes.configurationUpdateError.message
            });
        }
    }

    async updateConfiguration({ orgId, configId, configuration, branchId }) {
        const s3ConfigleFile = await this.getS3FileThatStoresS3KeysOfConfigFiles({ orgId, filePath: S3_FILE_PATHS.TENANT_CONFIG_KEYS });
        let s3Key = s3ConfigleFile[configId];
        if (branchId) {
            s3Key = `${branchId}/${s3Key}`;
        }
        const result = await this.updateS3File( { orgId, filePath: s3Key }, configuration);
        await this.redisClient.flushKeysOfTenant(orgId);
        return result;
    }

    async updateS3File(reqContext: { orgId: string, filePath: string },body) {
        const bucket = process.env.All_Tenants_S3_Bucket;
        const key = `${reqContext.orgId}/${reqContext.filePath}`;
        const result = await this.s3Client.putItem({ bucket, key, body });
        return result
    }

    async getFileFromS3(reqContext: { orgId: string, filePath: string }) {
        try {
            const bucket = process.env.All_Tenants_S3_Bucket;
            const key = `${reqContext.orgId}/${reqContext.filePath}`;
            const response: object = await this.s3Client.getJSONObject({ bucket, key });
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getS3FileThatStoresS3KeysOfConfigFiles({ orgId, filePath }) {
        try {
            const s3fileKeys = await this.getFileFromS3({ orgId, filePath });
            return s3fileKeys;
        } catch (error) {
            console.log('configKeys json not present in Tenant Folder. Please upload it', error);
            throw error;
        }
    }
}