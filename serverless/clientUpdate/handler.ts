import { TaskUtilities, DynamoDAL,createGlobalSearchKey } from "@utilities";
import { IClientUpdateEvent } from "@interfaces";
import mongoose from 'mongoose';
import { MONGO_COLLECTION_NAMES, HTTP_RESOURCES } from "@constants";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import {  TaskFilters } from "@enums";

export class ClientUpdateLamdaHandler {
  dynamoDAL: DynamoDAL;
  mongoDal: MongoDBClient;
  constructor() {
    this.dynamoDAL = new DynamoDAL();
    this.mongoDal = new MongoDBClient();
    this.handler = this.handler.bind(this);
  }

  registerModels() {
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.clients, new mongoose.Schema({},
        { timestamps: true, strict: false },
      ));
      } catch (err) {
        console.log(err)
      }
      try {
        mongoose.model(MONGO_COLLECTION_NAMES.genericTasks, new mongoose.Schema({},
          { timestamps: true, strict: false },
        ));
        } catch (err) {
          console.log(err)
    }
    try {
      mongoose.model(MONGO_COLLECTION_NAMES.invoices, new mongoose.Schema({},
        { timestamps: true, strict: false },
      ));
      } catch (err) {
        console.log(err)
      }
  }
  
  async handler(event) {
    this.registerModels();
    for (const record of event.Records) { 
      try {
        const message: IClientUpdateEvent = JSON.parse(record.body);
        console.log('message', message);
        const clientId = message.eventDetails.clientId;
        const tenantId = message.tenantId;
        const clientInfo = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
          resource: MONGO_COLLECTION_NAMES.clients, filters: [{
            tenantId,
            clientId
          }]
        });
        const branchId = clientInfo.branchId;
        console.log('clientInfo', clientInfo);
        const globalSearchKeys = HTTP_RESOURCES.UPDATE_ENTITY.entityList[MONGO_COLLECTION_NAMES.clients].rules.globalSearchKeys;
        const oldGlobalSearchKey = clientInfo.globalSearchKey;
        let newGlobalSearchKey = createGlobalSearchKey(clientInfo, globalSearchKeys);
        newGlobalSearchKey = newGlobalSearchKey.replace(/ /g, '-');
        console.log('newGlobalSearchKey', newGlobalSearchKey,'oldGlobalSearchKey',oldGlobalSearchKey);
        if (oldGlobalSearchKey !== newGlobalSearchKey) {
          await this.mongoDal.mongoUpdate.patchItem({
            resource: MONGO_COLLECTION_NAMES.clients, filters: [{
              tenantId,
              clientId
            }], attributesToUpdate: {
              globalSearchKey: newGlobalSearchKey
            }
          });
          
          await this.updateAllPrimaryTasksOfClient({ clientId, newGlobalSearchKey, oldGlobalSearchKey, orgId: tenantId, branchId });
          await this.updateAllCompletedTasksOfClient({ clientId, tenantId, oldGlobalSearchKey, newGlobalSearchKey });
          await this.updateAllInvoicesOfClient({ clientId, tenantId,oldGlobalSearchKey,newGlobalSearchKey })
        } else {
          console.log('no change in global search key.Hence aborting the update')
        }
      } catch (error) {
        console.log(error);
      }
    }
  
  }

  async updateAllPrimaryTasksOfClient({ clientId, newGlobalSearchKey, oldGlobalSearchKey, orgId, branchId }) {
    const pk = `org#${orgId}#branch#${branchId}#primaryTasks`;
    const primaryTasksOfClientParams = await TaskUtilities.getFilterDynamoParamsForAllTasks({
      pk,
      subString:clientId,
      paramName: TaskFilters.ClientId,
      orgId: null,
      branchId: null,
      from:null,
      to: null
    });
    const primaryTasksOfClient = await this.dynamoDAL.getRowsWithFilterFromDynamoDB(primaryTasksOfClientParams);
    console.log('primaryTasksOfClient',primaryTasksOfClient.items);
    if (primaryTasksOfClient.totalCount) {
      primaryTasksOfClient.items = primaryTasksOfClient.items.map((item:any) => ({
        ...item,
        globalSearchKey: item.globalSearchKey.replace(new RegExp(oldGlobalSearchKey, 'gi'), newGlobalSearchKey),
      }));
    }
    await this.dynamoDAL.updateBatchOfRowsWithLimit(primaryTasksOfClient.items);
  }

  async updateAllCompletedTasksOfClient({ clientId, tenantId,oldGlobalSearchKey,newGlobalSearchKey }) {
    const completedTasksOfClient = await this.mongoDal.mongoRead.getItemList({ resource: MONGO_COLLECTION_NAMES.genericTasks, queryObj: { clientId, tenantId } });
    if (completedTasksOfClient.totalCount) {
      for (const item of completedTasksOfClient.results) { 
        const completedTask: any = item;
        try {
          await this.mongoDal.mongoUpdate.patchItem({
            resource: MONGO_COLLECTION_NAMES.genericTasks, filters: [{
              tenantId: tenantId,
              sk: completedTask.sk
            }], attributesToUpdate: {
              globalSearchKey: completedTask.globalSearchKey.replace(new RegExp(oldGlobalSearchKey, 'gi'), newGlobalSearchKey)
            }
          });
        } catch (error) {
          console.log('error while updating completed task global search key')
        }
      }
    }
  }

  async updateAllInvoicesOfClient({ clientId, tenantId,oldGlobalSearchKey,newGlobalSearchKey }) {
    const invoiceListOfClient = await this.mongoDal.mongoRead.getItemList({ resource: MONGO_COLLECTION_NAMES.invoices, queryObj: { clientId, tenantId } });
    if (invoiceListOfClient.totalCount) {
      for (const item of invoiceListOfClient.results) { 
        const invoiceOfClient: any = item;
        try {
          await this.mongoDal.mongoUpdate.patchItem({
            resource: MONGO_COLLECTION_NAMES.invoices, filters: [{
              tenantId: tenantId,
              invoiceId: invoiceOfClient.invoiceId
            }], attributesToUpdate: {
              globalSearchKey: invoiceOfClient.globalSearchKey.replace(new RegExp(oldGlobalSearchKey, 'gi'), newGlobalSearchKey)
            }
          });
        } catch (error) {
          console.log('error while updating invoice global search key')
        }
      }
    }
  }
}

const clientUpdateLamdaHandler = new ClientUpdateLamdaHandler();
module.exports.sqsHandler = clientUpdateLamdaHandler.handler;
