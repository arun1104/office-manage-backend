import { TaskUtilities, DynamoDAL, PeriodUtilities } from "@utilities";
import { IScheduledEvent } from "@interfaces";
import mongoose from 'mongoose';
import { MONGO_COLLECTION_NAMES, QUEUE_EVENTS, EVENT_SOURCE } from "@constants";
import { MongoDBClient, SQS } from "@n-oms/multi-tenant-shared";
const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const snoozedStatus = 'snoozed';
export class DateScheduleCheckerLamdaHandler {
  dynamoDAL: DynamoDAL;
  mongoDal: MongoDBClient;
  periodUtilities: PeriodUtilities;
  sqsClient: SQS;
  constructor() {
    this.dynamoDAL = new DynamoDAL();
    this.mongoDal = new MongoDBClient();
    this.periodUtilities = new PeriodUtilities();
    this.handler = this.handler.bind(this);
    this.sqsClient = new SQS();
  }

  registerModels() {
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.tenants, {} as any);
      } catch (err) {
        console.log(err)
      }
      try {
        mongoose.model(MONGO_COLLECTION_NAMES.genericTasks, {} as any);
        } catch (err) {
          console.log(err)
        }
  }
  
  async handler() {
    this.registerModels();
    const tenants = await this.mongoDal.mongoRead.getItemList({
      resource: MONGO_COLLECTION_NAMES.tenants, queryObj: { isTaskAutomationEnabled: true }
    });
    try {
      await this.handleFinancialTaskCreation(tenants);
    } catch (error) {
      console.log(error);
    }
    try {
      await this.handleTask_UnSnoozing(tenants);
    } catch (error) { 
      console.log(error);
    }
  }

  async handleFinancialTaskCreation(tenants) {
    for (let index = 0; index < tenants.results.length; index++) {
      const msgs: any = [];
      const tenant: any = tenants.results[index];
      const timezone = tenant.taskAutomationConfiguration.timezone || DEFAULT_TIMEZONE;
      const todaysDate = this.periodUtilities.get_TodayS_DateStringIn_YYYYMMDD_format(timezone);
      const financialTasksParams = await TaskUtilities.getTasksToBeCreatedParams({ orgId: tenant.tenantId, dateInNumber: todaysDate });
      const financialTasks = await this.dynamoDAL.getRowsFromDynamoDB(financialTasksParams);
      console.log('financialTasks', financialTasks);
      for (const task of financialTasks.items) {
        console.log('task', task);
        const msgBody: IScheduledEvent = {
          eventId: QUEUE_EVENTS.NEW_AUTOMATED_FINANCIAL_TASK_CREATION_EVENT,
          tenantId: tenant.tenantId,
          createdBy: EVENT_SOURCE.Automation,
          createdByName: EVENT_SOURCE.Automation,
          eventDetails: task,
        };
        msgs.push(JSON.stringify(msgBody));
      }
      if (msgs.length) {
      await this.sqsClient.sendBatchMessages({  queueName: tenant.taskAutomationConfiguration.queueName, msgs });
      }
    }
  }

  async handleTask_UnSnoozing(tenants) {
    const msgs: any = [];
    for (let index = 0; index < tenants.results.length; index++) {
      const tenant: any = tenants.results[index];
      const timezone = tenant.taskAutomationConfiguration.timezone || DEFAULT_TIMEZONE;
      const todaysDate = this.periodUtilities.get_TodayS_DateStringIn_YYYYMMDD_format(timezone);
      const snoozedTasksForToday = await this.mongoDal.mongoRead.getItemList({
        resource: MONGO_COLLECTION_NAMES.genericTasks, queryObj: { snoozeUntil: { $lte: todaysDate }, statusId: snoozedStatus }
      });
      for (const task of snoozedTasksForToday.results) {
        console.log('task', task);
        const msgBody: IScheduledEvent = {
          eventId: QUEUE_EVENTS.UNSNOOZE_TASK,
          tenantId: tenant.tenantId,
          createdBy: EVENT_SOURCE.Automation,
          createdByName: EVENT_SOURCE.Automation,
          eventDetails: task,
        };
        msgs.push(JSON.stringify(msgBody));
      }
      if (msgs.length) { 
        await this.sqsClient.sendBatchMessages({ queueName: tenant.taskAutomationConfiguration.queueName, msgs });
      }
    }

  }

}

const automateTaskLamdaHandler = new DateScheduleCheckerLamdaHandler();
module.exports.cronHandler = automateTaskLamdaHandler.handler;
