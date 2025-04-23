import { HTTP_RESOURCES } from "@constants";
import { IHandler, IReqInfo, IConfig } from "@interfaces";
import { getConfiguration, getBranchConfiguration } from "@utilities";
import { S3, RedisClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class GetConfigurationHandler implements IHandler {
    operation: string;
    redisClient: RedisClient;
    s3Client: S3;
    operationId: string;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.CONFIGURATION.operationIdList.getConfiguration.operationType;
        this.operationId = HTTP_RESOURCES.CONFIGURATION.operationIdList.getConfiguration.name;
        this.resource = HTTP_RESOURCES.CONFIGURATION.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            configId: z.string().max(30),
            branchId: z.string().optional()
        })];
        this.s3Client = new S3();
        this.redisClient = new RedisClient();
    }

    async handler(req: IReqInfo, res: any) {
        const { configId, branchId } = req.query;
        try {
            let result:IConfig;
            if (branchId) {
                result = await getBranchConfiguration({
                    branchId,
                    orgId: req.authorizationInfo.orgId,
                    configId, s3Client: this.s3Client,
                    redisClient:this.redisClient
                })
            } else {
                result = await getConfiguration({
                    orgId: req.authorizationInfo.orgId,
                    configId, s3Client: this.s3Client,
                    redisClient:this.redisClient
                });
            }
            
            res.status(HTTP_RESOURCES.CONFIGURATION.operationIdList.getConfiguration.outcomes.configurationRetrievedSuccessfully.statusCode).send(result);
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(HTTP_RESOURCES.CONFIGURATION.operationIdList.getConfiguration.outcomes.configurationError.statusCode).send({
                message: HTTP_RESOURCES.CONFIGURATION.operationIdList.getConfiguration.outcomes.configurationError.message
            });
        }
    }
}