import { SQS_QUEUE_NAMES } from "@constants";
import { CMS_CRUD_ACTIONS } from "@enums";
import { SQS } from "@n-oms/multi-tenant-shared";

export class CmsIntegration {
  private readonly sqs: SQS;
  constructor() {
    this.sqs = new SQS();
  }
  async triggerMigration({
    data,
    tenantId,
    isDataValidationRequired,
    action,
    targetCollection,
    filter,
    updateCmsUser,
    cmsUserUpdationInfo
  }: {
    tenantId: string;
    isDataValidationRequired?: boolean;
    data: Record<string, unknown>;
    action: CMS_CRUD_ACTIONS
    targetCollection: string;
    filter?: Record<string, unknown>;
    updateCmsUser?: boolean;
    cmsUserUpdationInfo?: Record<string, unknown>;
  }) {
    await this.sqs.sendMessagesToQueue({
      tenantId,
      msgBody: {
        data,
        isDataValidationRequired,
        tenantId,
        action,
        targetCollection,
        filter,
        updateCmsUser,
        cmsUserUpdationInfo
      },
      queueName: SQS_QUEUE_NAMES.CMS_QUEUE_NAME,
    });
  }

}
