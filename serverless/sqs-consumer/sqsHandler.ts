import { QUEUE_EVENTS } from "@constants";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { handleFinalStatus, handleTaskDeletion } from "./taskEventHandlers";
import { CacheStore, ClassUtil, DynamoDAL } from "@utilities";
import { invoiceEventHandler } from "./invoiceBillingEventHandlers";
import { handleInvoiceRequest, handleVendorGenericEvents } from "./vendorEventHandlers";
import { registerModels } from "../libs/utils/handler";

export class MultitenantSqsConsumerHandler {
  private readonly mongoDal: MongoDBClient;
  private readonly dynamoDAL: DynamoDAL;
  private readonly cacheStore: CacheStore

  constructor() {
    this.mongoDal = new MongoDBClient();
    this.dynamoDAL = new DynamoDAL();
    this.cacheStore = new CacheStore();
    ClassUtil.bindMethods(this);
    registerModels({ models: ["tenants", "genericTasks", "orgEntities", "ledgers", "vendors"] });
  }

  async handler(event: SQSEvent) {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const records = event.Records;

    if (!records || records.length === 0) {
      console.log("No records found in the event");
      return;
    }

    const recordPromises = records.map(
      async (record) => await this.processRecord(record)
    );

    await Promise.all(recordPromises);
    console.log("All records processed");

  }

  async processRecord(record: SQSRecord) {
    const body = typeof record.body === "string" ? JSON.parse(record.body) : record.body;

    console.log("Processing record:", JSON.stringify(body, null, 2));

    const eventId = body.eventId;

    if (!eventId) {
      console.log("No eventId found in the record");
      return;
    }

    switch (eventId) {
      case QUEUE_EVENTS.TASK_FINAL_STATUS:
        return await handleFinalStatus({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: body });
      case QUEUE_EVENTS.TASK_DELAYED:
        return await handleFinalStatus({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: body });
      case QUEUE_EVENTS.TASK_DELETED:
        return await handleTaskDeletion({ dynamoDAL: this.dynamoDAL, context: body });
      case QUEUE_EVENTS.RAISE_INVOICE_REQUEST:
        return await handleInvoiceRequest({ mongoDal: this.mongoDal, dynamoDAL: this.dynamoDAL, context: body as any, cacheStore: this.cacheStore });
      case QUEUE_EVENTS.BILLING_INVOICE_EVENT:
        return await invoiceEventHandler({ mongoDal: this.mongoDal, context: body as any });
      case QUEUE_EVENTS.VENDOR_GENERIC_EVENT:
        return await handleVendorGenericEvents({ mongoDal: this.mongoDal, context: body as any, cacheStore: this.cacheStore });
      default:
        return

    }

  }
}

export const sqsHandler = new MultitenantSqsConsumerHandler().handler;
