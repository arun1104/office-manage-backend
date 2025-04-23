import { HTTP_RESOURCES,BAD_REQUEST } from "@constants";
import { RedisFlush } from "@enums";
import { IHandler,IReqInfo } from "@interfaces";
import { RedisClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class FlushRedisHandler implements IHandler {
    operation: string;
    redisClient: RedisClient;
    operationId: string;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.operationType;
        this.operationId = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.name;
        this.resource = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            action: z.enum([RedisFlush.FLUSH_ALL,RedisFlush.FLUSH_ONLY_TENANT])
        })];
        this.redisClient = new RedisClient();
    }

    async handler(req: IReqInfo, res: any) {
        const { action } = req.body;
        try {
            switch (action) {
                case RedisFlush.FLUSH_ALL:
                    await this.redisClient.flush();
                    res.status(HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushedForAllTenantsSuccessfully.statusCode).send(
                        { message: HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushedForAllTenantsSuccessfully.message }
                    );
                    return;
            
                case RedisFlush.FLUSH_ONLY_TENANT:
                    await this.redisClient.flushKeysOfTenant(req.authorizationInfo.orgId);
                    res.status(HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushedForTenantSuccessfully.statusCode).send(
                        { message: HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushedForTenantSuccessfully.message }
                    );
                    return;
                default:
                    res.status(BAD_REQUEST.invalidReqPayload.statusCode).send(
                        { message: BAD_REQUEST.invalidReqPayload.message }
                    );
            }
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushError.statusCode).send({
                message: HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache.outcomes.flushError.message
            });
        }
    }
}