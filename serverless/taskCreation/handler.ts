import { AuditHelper, getUniqueId } from "@utilities";
import {  IScheduledEvent } from "@interfaces";
import { MONGO_COLLECTION_NAMES, QUEUE_EVENTS, EVENT_SOURCE } from "@constants";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { TaskOperations, Context } from "@enums";
import { TaskAssignmentWorkflow } from "@workflows";
import mongoose from 'mongoose';
export class CreateTaskLamdaHandler {
  taskAssignmentWorkflow: TaskAssignmentWorkflow
  mongoDal: MongoDBClient;
  constructor() {
    this.taskAssignmentWorkflow = new TaskAssignmentWorkflow();
    this.handler = this.handler.bind(this);
    this.mongoDal = new MongoDBClient();
  }

  registerModels() {
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.audits, {} as any);
      } catch (err) {
        console.log(err)
      }
      try {
        mongoose.model(MONGO_COLLECTION_NAMES.memberships, {} as any);
        } catch (err) {
          console.log(err)
    }
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.genericTasks, {} as any);
      } catch (err) {
        console.log(err)
  }
    try {
      const tenantSchema = new mongoose.Schema({
        tenantId: { type: String, required: true },
        financialTaskCounter: { type: Number }
      });
   mongoose.model(MONGO_COLLECTION_NAMES.tenants, tenantSchema);
      } catch (err) {
        console.log(err)
    }
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.clients, {} as any);
      } catch (err) {
        console.log(err)
  }
  }

  async handler(event) {
    this.registerModels();
    for (const record of event.Records) {
      const message: IScheduledEvent = JSON.parse(record.body);
      console.log('Processing message', record.body, message);
      switch (message.eventId) {
        case QUEUE_EVENTS.UNSNOOZE_TASK:
          console.log('Unsnooze');
          await this.moveTaskFromSnoozedToPrimary(message)
          break;

        case QUEUE_EVENTS.NEW_AUTOMATED_FINANCIAL_TASK_CREATION_EVENT:
          console.log('NEW_AUTOMATED_FINANCIAL_TASK_CREATION_EVENT');
          await this.createFinancialTaskForClients(message);
          break;
      }
    }
  }

  reqBodyMapper(msg, clientDetails, clientRegistered) {
    return {
      action: TaskOperations.TASK_CREATE,
      branchId: msg.eventDetails.branchId,
      tenantId: msg.tenantId,
      taskInput: {
        globalSearchKey: `${clientDetails.globalSearchKey}-${msg.eventDetails.taskId}-${msg.eventDetails.financialYear.toLowerCase()}-${msg.eventDetails.periodRange.toLowerCase()}`,
        branchId: msg.eventDetails.branchId,
        taskId: msg.eventDetails.taskId,
        taskName: msg.eventDetails.taskName,
        clientId: clientDetails.clientId,
        financialYear: msg.eventDetails.financialYear,
        periodString: msg.eventDetails.periodString,
        periodRange: msg.eventDetails.periodRange,
        canBeDuplicated: msg.eventDetails.canBeDuplicated ? true:false,
        dueDate: msg.eventDetails.dueDateInNumber,
        internalDueDate: msg.eventDetails.internalDueDateInNumber,
        status: clientRegistered.status || 'created',
        statusId: clientRegistered.statusId || 'created',
        clientDetails: {
          clientId: clientDetails.clientId,
          name: clientDetails.name
        },
        assignees: clientRegistered.assignees,
        reviewers: clientRegistered.reviewers
      }
    };
  }
  
  async createFinancialTaskForClients(message:IScheduledEvent) {
    const clientsRegistered = await this.getClientsRegistered(message);
    for (let index = 0; index < clientsRegistered.length; index++) {
      const client: any = clientsRegistered[index];
      const filter = {
        clientId: client.clientId,
        tenantId: message.tenantId
      };
      console.log('filter', filter);
      const clientDetails = await this.getClientDetails(filter);
      console.log('clientDetails', clientDetails);
      const reqBody = this.reqBodyMapper(message, clientDetails, client);
      console.log('reqBody', reqBody);
      await this.createNewFinancialTask(reqBody);
    }
  }

  snoozedReqBodyMapper(completedTask) {
    return {
      action: TaskOperations.TASK_CREATE,
      branchId: completedTask.branchId,
      tenantId: completedTask.tenantId,
      taskInput: {
        globalSearchKey: completedTask.globalSearchKey,
        branchId: completedTask.branchId,
        taskId: completedTask.taskId,
        taskName: completedTask.taskName,
        taskSeqNumber: completedTask.taskSeqNumber,
        clientId: completedTask.clientDetails.clientId,
        financialYear: completedTask.financialYear,
        periodString: completedTask.periodString,
        periodRange: completedTask.periodRange,
        canBeDuplicated: completedTask.canBeDuplicated ? true : false,
        dueDate: completedTask.dueDate,
        internalDueDate: completedTask.internalDueDate,
        status: completedTask.status || 'created',
        statusId: completedTask.statusId || 'created',
        clientDetails: {
          clientId: completedTask.clientDetails.clientId,
          name: completedTask.clientDetails.name
        },
        assignees: completedTask.assignees,
        reviewers: completedTask.reviewers
      }
    };
  }

  async createNewFinancialTask(reqBody) {
    try {
      const tenantId = reqBody.tenantId
      const workflow = TaskOperations.TASK_CREATE
      const workflowId = `${getUniqueId()}-${workflow}`;
      const workflowArgs = {
        creationContext: {
          createdByEmail: EVENT_SOURCE.Automation,
          createdByName: EVENT_SOURCE.Automation,
          creationContext: Context.LAMBDA
        },
        reqBody,
        tenantId,
        workflowId,
        workflow
      }
      console.log('workflowArgs',workflowArgs);
      const workflowResp = await this.taskAssignmentWorkflow.workflowHandler(workflowArgs);
      AuditHelper.createReadOnlyEntries({ input: workflowResp.audits, mongoDal: this.mongoDal })
    } catch (err) {
      console.log(err);
    }
  }

  async getClientsRegistered(message: IScheduledEvent) {
    const filter = {
      tenantId: message.tenantId,
      taskId: message.eventDetails.taskId,
      isActive: true
    }
    console.log('filter', filter);
    const clientsRegistered = await this.mongoDal.mongoRead.getItemList({
      resource: MONGO_COLLECTION_NAMES.memberships, queryObj: filter
    });
    console.log('getClientsRegistered', clientsRegistered);
    return clientsRegistered.results;
  }

  async getClientDetails({ clientId,tenantId }) {
    const filter = { tenantId, clientId };
    const clients = await this.mongoDal.mongoRead.getItemList({
      resource: MONGO_COLLECTION_NAMES.clients, queryObj: filter
    });
    return clients.results[0];
  }

  async moveTaskFromSnoozedToPrimary(message) {
    const reqBody = this.snoozedReqBodyMapper(message.eventDetails);
    await this.createNewFinancialTask(reqBody);
    await this.mongoDal.mongoDelete.deleteItem({resource:MONGO_COLLECTION_NAMES.genericTasks, filters:[{sk:message.eventDetails.sk}]})
  }

}
const createTaskLamdaHandler = new CreateTaskLamdaHandler();
module.exports.sqsHandler = createTaskLamdaHandler.handler;
