import { HTTP_RESOURCES,RESPOSE_CODES, COMMON_ERROR_MESSAGES } from "@constants";
import { IHandler,IReqInfo } from "@interfaces";
import { S3 } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class S3FileFolderCheckerHandler implements IHandler {
    operation: string;
    s3Client: S3;
    operationId: string;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.FILES.operationIdList.manageFiles.operationType;
        this.operationId = HTTP_RESOURCES.FILES.operationIdList.manageFiles.name;
        this.resource = HTTP_RESOURCES.FILES.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            key: z.string(),
            operation: z.string(),
            expiryInSecs: z.number().min(20),
            contentType:z.string()
        })];
        this.s3Client = new S3();
    }

    async handler(req: IReqInfo, res: any) {
        try {
            const tenantId = req.authorizationInfo.orgId;
            const url = await this.s3Client.getPresignedUrl({
                key: `${tenantId}/${req.body.key}`,
                expiresInSec: req.body.expiryInSecs,
                bucket: process.env.tenant_s3Bucket,
                operation: req.body.operation,
                contentType:req.body.contentType
            });
            res.status(RESPOSE_CODES.CREATE).send({ presignedUrl:url });
            return;
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            });
        }
    }
}