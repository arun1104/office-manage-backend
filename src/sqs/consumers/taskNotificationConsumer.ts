import { SQSConsumer } from './../sqsConsumer';
import { handleFinalStatus, handleTaskDeletion } from './../consumers/taskEventHandlers';
import { handleInvoiceRequest } from './../consumers/vendorEventHandlers';
import { invoiceEventHandler } from './../consumers/invoiceBillingEventHandlers';
import { handleVendorGenericEvents } from './../consumers/vendorEventHandlers';
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { QUEUE_EVENTS } from "@constants";
import { ITaskNotificationEvent } from "@interfaces";
import { DynamoDAL, CacheStore } from "@utilities";
export class TaskConsumer extends SQSConsumer {
    mongoDal: MongoDBClient;
    dynamoDAL: DynamoDAL;
    cacheStore: CacheStore
    constructor(queueUrl: string, region: string) {
        super(queueUrl, region);
        this.mongoDal = new MongoDBClient();
        this.dynamoDAL = new DynamoDAL();
        this.cacheStore = new CacheStore();
    }

    async handleMessage(message: ITaskNotificationEvent): Promise<void> {
        console.log("Processing task:", message);
        switch (message.eventId) {
            case QUEUE_EVENTS.TASK_FINAL_STATUS:
                await handleFinalStatus({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: message });
                break;
            case QUEUE_EVENTS.TASK_DELAYED:
                await handleFinalStatus({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: message });
                break;
            case QUEUE_EVENTS.TASK_DELETED:
                await handleTaskDeletion({ dynamoDAL: this.dynamoDAL, context: message });
                break;
            case QUEUE_EVENTS.RAISE_INVOICE_REQUEST:
                await handleInvoiceRequest({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: message as any, cacheStore: this.cacheStore });
                break;
            case QUEUE_EVENTS.BILLING_INVOICE_EVENT:
                await invoiceEventHandler({ mongoDal: this.mongoDal, context: message as any});
                break;
            case QUEUE_EVENTS.VENDOR_GENERIC_EVENT:
                await handleVendorGenericEvents({ mongoDal: this.mongoDal, context: message as any, cacheStore: this.cacheStore});
                break;
        }
    }
}