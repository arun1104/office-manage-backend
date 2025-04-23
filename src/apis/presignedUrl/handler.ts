import {
  HTTP_RESOURCES,
  OPERATION_ID_LIST,
  OPERATIONS,
  S3_FILE_PATHS,
} from "@constants";
import { IHandler, IReqInfo } from "@interfaces";
import { File_Operation, RedisClient, S3 } from "@n-oms/multi-tenant-shared";
import { Response } from "express";
import {
  PRESIGNED_URL_ACTIONS,
  PresignedUrlInput,
  presignedUrlZodSchema,
} from "./zodSchema";

export class PresignedUrlHandler implements IHandler {
  operation: string;
  operationId: string;
  resource: string;
  validations: any[];
  s3Client: S3;
  redisClient: RedisClient;

  constructor() {
    this.operation = OPERATIONS.INVOKE;
    this.operationId = OPERATION_ID_LIST.presignedUrl;
    this.resource = HTTP_RESOURCES.PRESIGNED_URL.relativePath;
    this.validations = [presignedUrlZodSchema];
    this.handler = this.handler.bind(this);
    this.getOrgEnvVariables = this.getOrgEnvVariables.bind(this);
    this.s3Client = new S3();
    this.redisClient = new RedisClient();
  }

  async handler(req: IReqInfo, res: Response) {
    try {
      const body = req.body as PresignedUrlInput;
      let result;
      switch (body.action) {
        case PRESIGNED_URL_ACTIONS.GET_PRESIGNED_URL: {
          result = await this.s3Client.getPresignedUrl({
            bucket: process.env.WEBSITE_USER_UPLOADS_BUCKET || "n-oms-users",
            key: body.key,
            operation: File_Operation.PUT,
            expiresInSec: 60,
            accessControl: "public-read",
          });
          break;
        }
        case PRESIGNED_URL_ACTIONS.GET_PRESIGNED_URL_FROM_REGION: {
          const domainConfig = await this.getOrgEnvVariables(body.domainName);
          result = await this.s3Client.getPresignedUrlFromRegion({
            bucket: domainConfig.S3_BUCKET_NAME || "n-oms-organization-config",
            key: body.key,
            operation: File_Operation.PUT,
            expiresInSec: 60,
            accessControl: "public-read",
            region: body.region,
          });
          break;
        }
      }
      return res.status(200).send(result);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  async getOrgEnvVariables(domainName: string) {
    try {
      let envVariables;
      const key = `env-variables/${domainName}/${S3_FILE_PATHS.ENV_CONFIGURATION_FILE_PER_DOMAIN}`;
      envVariables = await this.redisClient.get({
        tenantId: undefined,
        key,
        isJSON: true,
      });
      if (!envVariables) {
        envVariables = await this.s3Client.getJSONObject({
          bucket: process.env.All_Tenants_S3_Bucket,
          key,
        });
        await this.redisClient.set({
          tenantId: undefined,
          key,
          value: envVariables,
          isJSON: true,
        });
      }
      return envVariables;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
