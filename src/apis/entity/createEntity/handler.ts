import {
  HTTP_RESOURCES,
  OPERATIONS,
  RESPOSE_CODES,
  Entity_Creation_Helper_Constants,
  MONGO_COLLECTION_NAMES,
  AUDIT_MESSAGES,
  QUEUE_EVENTS,
  EVENT_TYPES,
} from "@constants";
import {
  IBillingInvoiceEvent,
  IHandler,
  IReqInfo,
  IVendorCreateEvent,
  INewMessageEvent,
} from "@interfaces";
import { Context, OrgEntityTypes } from "@enums";
import {
  getUniqueId,
  AuditHelper,
  CacheStore,
  WebsocketUtility,
  createGlobalSearchKey,
  LeaveAndAttendanceUtilities,
} from "@utilities";
import { MongoDBClient, RedisClient, SQS } from "@n-oms/multi-tenant-shared";
import { zodSchemas } from "./zodSchemas/entitySchemas";
import axios from "axios";

export class CreateEntityHandler implements IHandler {
  websocketUtility: WebsocketUtility;
  operation: string;
  redisClient: RedisClient;
  mongoDal: MongoDBClient;
  operationId: string;
  resource: string;
  sqsClient: SQS;
  validations: any[];
  cacheStore: CacheStore;
  constructor() {
    this.cacheStore = new CacheStore();
    this.operation = OPERATIONS.CREATE;
    this.operationId = "";
    this.resource = HTTP_RESOURCES.NEW_ENTITY.relativepath;
    this.handler = this.handler.bind(this);
    this.sendSqsMessageIfNeeded = this.sendSqsMessageIfNeeded.bind(this);
    this.addPrefixCounterVariableIfNeeded =
      this.addPrefixCounterVariableIfNeeded.bind(this);
    this.initiateMandateIfNeeded = this.initiateMandateIfNeeded.bind(this);
    this.addOrgEntitiesIfNeeded = this.addOrgEntitiesIfNeeded.bind(this);
    this.validations = [zodSchemas];
    this.mongoDal = new MongoDBClient();
    this.redisClient = new RedisClient();
    this.sqsClient = new SQS();
    this.websocketUtility = new WebsocketUtility();
  }

  async handler(req: IReqInfo, res: any) {
    const tenantId = req.authorizationInfo.orgId;
    this.operationId = req.accessInfo.operationId;
    const originalReqBody = JSON.parse(JSON.stringify(req.body));
    const orgInfo = await this.cacheStore.getOrgInfo(tenantId);
    const { audits, baseAudit } = this.initiateAuditing({
      userId: req.userInfo.email,
      userName: req.userInfo.name,
      creationContext: Context.API,
      tenantId,
      operationId: this.operationId,
      reqBody: originalReqBody,
    });
    try {
      const reqBody = this.addContextualAttributesToBody(req, tenantId);
      const rules = JSON.parse(
        JSON.stringify(
          HTTP_RESOURCES.NEW_ENTITY.entityList[req.body.entity].rules
        )
      );
      this.addPrimaryKeyIfNeeded({ reqBody, rules });
      this.addGlobalSearchKeyIfNeeded({ reqBody, rules });
      const { parentQueryObj } = await this.attachParentIfNeeded({
        rules,
        reqBody,
        tenantId,
      });
      this.addAttributesForUniquenessInMongoIfNeeded({ reqBody, rules });

      const { newEntity } = await this.createEntityInMongo({
        reqBody,
        tenantId,
      });

      await this.sendSqsMessageIfNeeded({ reqBody });

      await this.addPrefixCounterVariableIfNeeded({
        rules,
        reqBody,
        tenantId,
        newEntity,
        orgInfo,
      });

      await this.triggerEventIfNeeded({
        rules,
        tenantId,
        req,
        reqBody,
        orgInfo,
      });
      await this.pushChildrenToParentIfNeeded({
        rules,
        newEntity,
        parentQueryObj,
        reqBody,
      });
      await this.addOrgEntitiesIfNeeded({
        reqBody,
        tenantId,
        branchId: reqBody.branchId,
        userInfo: { email: req.userInfo.email, name: req.userInfo.name },
        entityId: reqBody[rules.primaryKey],
      });
      await this.initiateMandateIfNeeded({ reqBody });
      this.sendMessageUsingWebsocketIfNeeded({ reqBody, rules });
      this.addAuditEntries({ audits, baseAudit, newEntity, reqBody, rules });
      res.status(RESPOSE_CODES.CREATE).send(newEntity);
    } catch (err) {
      console.log(`Error in creating entity:${req.body.entity}`, err);
      AuditHelper.createReadOnlyEntries({
        input: [
          AuditHelper.getEntityFatalErrorAudit({
            ...baseAudit,
            reqBody: JSON.stringify(req.body),
            message: AUDIT_MESSAGES.ENTITY.create_failed,
            extraDetails: err,
          }),
        ],
        mongoDal: this.mongoDal,
      });
      res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
        message: `Unable to create entity: ${req.body.entity}`,
      });
    }
  }

  
    private getPlanName(recurrenceType: string): string {
      switch(recurrenceType) {
        case 'DAY':
          return 'Periodic Daily Plan';
        case 'WEEK':
          return 'Periodic Weekly Plan';
        case 'BI WEEK':
          return 'Periodic Bi-Weekly Plan';
        case 'MONTH':
          return 'Periodic Monthly Plan';
        default:
          return 'Periodic Plan';
      }
    }


  async initiateMandateIfNeeded({ reqBody }: { reqBody: Record<string, any> }) {
    if (
      reqBody.entityType === OrgEntityTypes.OFFICE_EVENTS &&
      reqBody.name === "bankMandates"
    ) {
      try {
        const payload = {
          subscriptionId: reqBody.subscriptionId,
          customerName: reqBody.borrowerName,
          customerEmail: reqBody.borrowerEmail,
          customerPhone: reqBody.borrowerPhone,
          returnUrl: "https://aqivhlzrd4.execute-api.us-east-1.amazonaws.com/cashfree-callback",
          authAmount: 1,
          planInfo: {
            type: "PERIODIC",
            planName: this.getPlanName(reqBody.recurrenceType),
            maxCycles: reqBody.maxCycles || 10,
            recurringAmount: parseInt(reqBody.amountPerMonth, 10),
            mandateAmount: reqBody.amount,
            intervalType: reqBody.recurrenceType,
            interval: 1
          },
          firstChargeDate: reqBody.startDate,
          linkExpiry: 5,
          notificationChannels: ["EMAIL", "SMS"]
        };
        console.log('cashfree payload', payload);
        const response = await axios.post(
          `https://sandbox.cashfree.com/api/v2/subscriptions/nonSeamless/subscription`,
          payload,
          {
            headers: {
              "X-Client-Id": process.env.CASH_FREE_APP_ID,
              "X-Client-Secret":process.env.CASH_FREE_SECRET_KEY,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.log("Error in creating mandate", error);
      }
    }
  }

  async addOrgEntitiesIfNeeded({
    reqBody,
    tenantId,
    branchId,
    userInfo,
    entityId,
  }) {
    switch (reqBody.entity) {
      case HTTP_RESOURCES.NEW_ENTITY.entityList.leaveRecords.name:
        await LeaveAndAttendanceUtilities.createLeaveRecords({
          leaveData: reqBody,
          mongoDal: this.mongoDal,
          orgId: tenantId,
          branchId,
          userInfo,
          leaveApplicationId: entityId,
        });
        break;

      default:
        break;
    }
  }
  async addAuditEntries({ audits, baseAudit, newEntity, reqBody, rules }) {
    audits.push(
      AuditHelper.getEntityCreateAudit(
        {
          ...baseAudit,
          newValue: JSON.stringify(newEntity),
        },
        reqBody[rules.primaryKey]
      )
    );
    AuditHelper.createReadOnlyEntries({
      input: audits,
      mongoDal: this.mongoDal,
    });
  }

  async sendSqsMessageIfNeeded({ reqBody }: { reqBody: Record<string, any> }) {
    if (
      reqBody.entity === "messages" &&
      reqBody.messageEntityType === "Primary Task"
    ) {
      await this.sqsClient.sendMessagesToQueue({
        msgBody: reqBody,
        tenantId: reqBody.tenantId,
        queueName: "taskMessageCount",
      });
    }
  }

  async addPrefixCounterIdForProjectIssue({ newEntity }) {
    let issueCode, sno;

    const model = await this.mongoDal.mongoRead.getModel(
      MONGO_COLLECTION_NAMES.project_entities
    );

    const lastIssue = await model
      .find({
        projectCode: newEntity.projectCode,
        entityType: "issue",
        entityId: { $ne: newEntity.entityId },
      })
      .sort({ sno: -1 })
      .limit(1);

    if (!lastIssue || lastIssue.length === 0) {
      sno = 1;
      issueCode = `${newEntity.projectCode}-${sno}`;
    } else {
      sno = lastIssue[0].sno + 1;
      issueCode = `${newEntity.projectCode}-${sno}`;
    }

    return await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.project_entities,
      filters: [{ entityId: newEntity.entityId }],
      attributesToUpdate: { issueCode, sno },
    });
  }

  async addPrefixCounterVariableIfNeeded({
    rules,
    reqBody,
    tenantId,
    newEntity,
    orgInfo,
  }) {
    if (rules.prefixAndCounterAttribute) {
      {
        switch (reqBody.entity) {
          case MONGO_COLLECTION_NAMES.vendors:
            await this.addCounterValueForVendor({
              tenantId,
              rules,
              newEntity,
              reqBody,
              orgInfo,
            });
            break;
          case MONGO_COLLECTION_NAMES.invoices:
            await this.addCounterValueForInvoice({
              tenantId,
              rules,
              newEntity,
              reqBody,
              orgInfo,
            });
            break;
          case MONGO_COLLECTION_NAMES.clients:
            await this.addCounterValueForClients({
              tenantId,
              rules,
              newEntity,
              reqBody,
              orgInfo,
            });
            break;
          case MONGO_COLLECTION_NAMES.project_entities: {
            if (reqBody.entityType === "issue") {
              await this.addPrefixCounterIdForProjectIssue({
                newEntity: { ...newEntity, projectCode: reqBody.projectCode },
              });
            }
            break;
          }
          default:
            break;
        }
      }
    }
    if (reqBody.entity===MONGO_COLLECTION_NAMES.orgEntities) {
        await this.addCounterValueForPetrolPump({ tenantId, newEntity, reqBody, orgInfo, rules }) 
    }
  }

  async addCounterValueForClients({
    tenantId,
    rules,
    newEntity,
    reqBody,
    orgInfo,
  }) {
    const currentCount = await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.tenants,
      filters: [{ tenantId: tenantId }],
      attributesToUpdate: { $inc: { clientCounter: 1 } },
    });
    const clientIdWithPrefix = `${orgInfo.clientConfiguration.clientIdPrefix}-${currentCount.clientCounter}`;
    const toUpdate = {
      globalSearchKey: `${
        reqBody.globalSearchKey
      }-${clientIdWithPrefix.toLowerCase()}`,
    };
    toUpdate[rules.prefixAndCounterAttribute] = clientIdWithPrefix;
    newEntity[rules.prefixAndCounterAttribute] = clientIdWithPrefix;
    await this.mongoDal.mongoUpdate.patchItem({
      resource: reqBody.entity,
      filters: [{ clientId: reqBody.clientId }],
      attributesToUpdate: toUpdate,
    });
    reqBody[rules.prefixAndCounterAttribute] = clientIdWithPrefix;
  }

  async addCounterValueForInvoice({
    tenantId,
    rules,
    newEntity,
    reqBody,
    orgInfo,
  }) {
    const currentCount = await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.tenants,
      filters: [{ tenantId: tenantId }],
      attributesToUpdate: { $inc: { invoiceCounter: 1 } },
    });

    const invoiceIdWithPrefix = `${orgInfo.invoiceConfiguration.orgPrefix}-${orgInfo.invoiceConfiguration.currentFY}-${currentCount.invoiceCounter}`;
    const toUpdate = {
      globalSearchKey: `${reqBody.invoiceInfo.clientData.globalSearchKey}-${invoiceIdWithPrefix}`,
    };
    toUpdate[rules.prefixAndCounterAttribute] = invoiceIdWithPrefix;
    newEntity[rules.prefixAndCounterAttribute] = invoiceIdWithPrefix;
    await this.mongoDal.mongoUpdate.patchItem({
      resource: reqBody.entity,
      filters: [{ invoiceId: reqBody.invoiceId, clientId: reqBody.clientId }],
      attributesToUpdate: toUpdate,
    });
    reqBody[rules.prefixAndCounterAttribute] = invoiceIdWithPrefix;
  }

  async addCounterValueForVendor({
    tenantId,
    rules,
    newEntity,
    reqBody,
    orgInfo,
  }) {
    const currentCount = await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.tenants,
      filters: [{ tenantId: tenantId }],
      attributesToUpdate: { $inc: { vendorCounter: 1 } },
    });
    const vendorIdWithPrefix = `${orgInfo.vendorConfiguration.vendorIdPrefix}-${currentCount.vendorCounter}-${reqBody.pincode}`;
    const toUpdate = {
      globalSearchKey: `${
        reqBody.globalSearchKey
      }-${vendorIdWithPrefix.toLowerCase()}`,
    };
    toUpdate[rules.prefixAndCounterAttribute] = vendorIdWithPrefix;
    newEntity[rules.prefixAndCounterAttribute] = vendorIdWithPrefix;
    await this.mongoDal.mongoUpdate.patchItem({
      resource: reqBody.entity,
      filters: [{ vendorId: reqBody.vendorId }],
      attributesToUpdate: toUpdate,
    });
    reqBody[rules.prefixAndCounterAttribute] = vendorIdWithPrefix;
  }

  async addCounterValueForPetrolPump({ tenantId, newEntity, reqBody, orgInfo, rules }) {
    if (reqBody.itemName === rules.entitiesMapForCountPrefix.petrolPumpCustomers) {
      const currentCustomerCount = await this.mongoDal.mongoUpdate.patchItem({
        resource: MONGO_COLLECTION_NAMES.tenants,
        filters: [{ tenantId: tenantId }],
        attributesToUpdate: { $inc: { petrolPumpCustomerCount: 1 } },
      });
  
      const customerSeqNoWithPrefix = `${orgInfo.clientConfiguration.pumpCustomerPrefix}-${currentCustomerCount.petrolPumpCustomerCount}`;
  
      const toUpdateCustomer = {
        globalSearchKey: `${reqBody.globalSearchKey}-${customerSeqNoWithPrefix.toLowerCase()}`,
        customerSeqNo: customerSeqNoWithPrefix,
      };
  
      newEntity.customerSeqNo = customerSeqNoWithPrefix;
      await this.mongoDal.mongoUpdate.patchItem({
        resource: reqBody.entity,
        filters: [{ tenantId,entityId: newEntity.entityId,itemName: reqBody.itemName }],
        attributesToUpdate: toUpdateCustomer,
      });
      reqBody.customerSeqNo = customerSeqNoWithPrefix;
    }
  
    if (reqBody.itemName === rules.entitiesMapForCountPrefix.petrolPumpBills) {
      const currentBillCount = await this.mongoDal.mongoUpdate.patchItem({
        resource: MONGO_COLLECTION_NAMES.tenants,
        filters: [{ tenantId: tenantId }],
        attributesToUpdate: { $inc: { customerBillCount: 1 } },
      });
      const billSeqNoWithPrefix = `${orgInfo.clientConfiguration.pumpBillNoPrefix}-${currentBillCount.customerBillCount}`;
      const toUpdateBill = {
        globalSearchKey: `${reqBody.globalSearchKey}-${billSeqNoWithPrefix.toLowerCase()}`,
        billSeqNo: billSeqNoWithPrefix,
      };
      newEntity.billSeqNo = billSeqNoWithPrefix;
      await this.mongoDal.mongoUpdate.patchItem({
        resource: reqBody.entity,
        filters: [{ tenantId,entityId: newEntity.entityId,itemName: reqBody.itemName }],
        attributesToUpdate: toUpdateBill,
      });
      reqBody.billSeqNo = billSeqNoWithPrefix;
    }
  }
  
  async triggerEventIfNeeded({ rules, req, reqBody, orgInfo, tenantId }) {
    if (rules.triggerEvent) {
      const queueName = orgInfo?.eventConfigurations
        ? orgInfo?.eventConfigurations[this.operationId]
        : null;
      if (queueName) {
        switch (reqBody.entity) {
          case MONGO_COLLECTION_NAMES.vendors:
            await this.triggerVendorCreatedEvent({ queueName, req, reqBody });
            break;
          case MONGO_COLLECTION_NAMES.invoices:
            await this.triggerInvoiceCreatedEvent({
              queueName: `${queueName}-${process.env.ORG_NAME}`,
              req,
              reqBody,
              tenantId,
            });
            break;
          case MONGO_COLLECTION_NAMES.orgEntities:
            await this.triggerNewMessageEvent({
              queueName: `${queueName}`,
              req,
              reqBody,
              tenantId,
            });
            break;
          default:
            break;
        }
      }
    }
  }

  async triggerInvoiceCreatedEvent({ queueName, req, reqBody, tenantId }) {
    const taskAssociationIdList = reqBody.invoiceInfo.taskDetails.map(
      (e) => e.taskAssociationId
    );
    const msgBody: IBillingInvoiceEvent = {
      eventId: QUEUE_EVENTS.BILLING_INVOICE_EVENT,
      tenantId,
      createdBy: req.userInfo.email,
      createdByName: req.userInfo.name,
      eventDetails: {
        invoiceNo: reqBody.invoiceNo,
        taskAssociationIdList,
        invoiceId: reqBody.invoiceId,
        clientId: reqBody.clientId,
        invoiceStatus: reqBody.status,
        invoiceStatusId: reqBody.statusId,
      },
    };
    console.log("sqs event payload", msgBody);
    await this.sqsClient.sendMessagesToQueue({
      tenantId,
      queueName,
      msgBody,
    });
  }

  async triggerNewMessageEvent({ queueName, req, reqBody, tenantId }) {
    if (reqBody.entityType === EVENT_TYPES.RealTimeMessage) {
      const msgBody: INewMessageEvent = {
        eventId: QUEUE_EVENTS.NEW_MESSAGE_EVENT,
        tenantId,
        createdBy: req.userInfo.email,
        createdByName: req.userInfo.name,
        eventDetails: {
          userId: reqBody.userId,
          message: reqBody.message,
          vendorId: reqBody.vendorId,
        },
      };
      console.log("sqs event payload", msgBody);
      await this.sqsClient.sendMessagesToQueue({
        tenantId,
        queueName,
        msgBody,
      });
    }
  }

  async triggerVendorCreatedEvent({ queueName, req, reqBody }) {
    const msgBody: IVendorCreateEvent = {
      eventId: QUEUE_EVENTS.VENDOR_CREATED,
      createdBy: req.userInfo.email,
      createdByName: req.userInfo.name,
      eventDetails: {
        fullName: reqBody.vendorName,
        vendorId: reqBody.vendorId,
        phoneNumber: reqBody.phoneNumber,
      },
    };
    console.log("sqs event payload", msgBody);
    await this.sqsClient.sendMessagesToQueue({
      tenantId: "",
      queueName,
      msgBody,
    });
  }

  async pushChildrenToParentIfNeeded({
    rules,
    newEntity,
    parentQueryObj,
    reqBody,
  }) {
    if (rules.pushChildrenToParent) {
      await this.pushChildToParent({
        rules,
        newEntity,
        parentQueryObj,
        reqBody,
      });
    }
  }

  async createEntityInMongo({ reqBody, tenantId }) {
    let newEntity;
    if (reqBody.entity != MONGO_COLLECTION_NAMES.tags) {
      newEntity = await this.mongoDal.mongoCreate.createItem({
        resource: reqBody.entity,
        data: reqBody,
      });
    } else {
      newEntity = await this.mongoDal.mongoUpdate.updateArrayAttributeOfItem({
        resource: reqBody.entity,
        action: reqBody.action,
        arrayAttribute: reqBody.arrayAttribute,
        filter: {
          tagIdUnique: reqBody.tagIdUnique,
          tagId: reqBody.tagId,
          tenantId,
          entity: reqBody.entity,
        },
        item: reqBody.item,
        upsert:true
      });
    }
    return { newEntity };
  }

  addAttributesForUniquenessInMongoIfNeeded({ reqBody, rules }) {
    if (rules.uniqueAttributes) {
      this.createUniqueKeysForMongoUniqueness({ reqBody, rules });
    }
  }

  async attachParentIfNeeded({ rules, reqBody, tenantId }) {
    let parentQueryObj;
    if (rules.attachParent) {
      parentQueryObj = await this.attachParentId({ rules, reqBody, tenantId });
    }
    return { parentQueryObj };
  }

  addPrimaryKeyIfNeeded({ reqBody, rules }) {
    if (rules.primaryKeyFormat) {
      const uniqueId = this.createPrimaryKey({ reqBody, rules });
      reqBody[rules.primaryKey] = uniqueId;
    }
  }

  addGlobalSearchKeyIfNeeded({ reqBody, rules }) {
    if (rules.globalSearchKeys) {
      reqBody.globalSearchKey = createGlobalSearchKey(
        reqBody,
        rules.globalSearchKeys
      );
      reqBody.globalSearchKey = reqBody.globalSearchKey.replace(/ /g, "-");
    }
  }

  addContextualAttributesToBody(req, tenantId) {
    return {
      ...req.body,
      tenantId,
      isActive: true,
      isDeleted: false,
      createdByEmail: req.userInfo.email,
      createdByName: req.userInfo.name,
      createdOn: Date.now().toString(),
      creationContext: Context.API,
    };
  }

  async attachParentId({ rules, reqBody, tenantId }) {
    const parentQueryObj = { tenantId };
    switch (rules.parent) {
      case Entity_Creation_Helper_Constants.DYNAMIC_PARENT:
        rules.parent = reqBody.parent;
        break;
    }
    if (rules.haveSubEntity) {
      if (rules.topSubEntity === reqBody.entityType) {
        rules.parentQueryAttributeName = "tenantId";
      } else {
        rules.parent = reqBody.entity;
      }
    }
    if (reqBody.parentId) {
      parentQueryObj[
        rules.parentQueryAttributeName || reqBody.parentQueryAttributeName
      ] = reqBody.parentId;
    }
    const parentEntity = await this.getParentFromMongoDB({
      queryObj: parentQueryObj,
      resource: rules.parent,
    });
    const parentDocId = parentEntity["_id"];
    reqBody[rules.newAttributeNameForParentReference] = parentDocId;
    return parentQueryObj;
  }

  async pushChildToParent({ rules, newEntity, parentQueryObj, reqBody }) {
    const attributesToUpdate = {
      $push: { [reqBody.entity]: newEntity["_id"] },
    };
    await this.updateParentInMongoDB({
      queryObj: parentQueryObj,
      resource: rules.parent,
      attributesToUpdate,
    });
  }

  createPrimaryKey({ reqBody, rules }) {
    const attributeList = rules.primaryKeyFormat;
    if (!rules.isTenantIdAlreadyPartOfPrimaryKey) {
      attributeList.unshift("tenantId"); // Always add tenantId to the primary key to preserve uniqueness with in a tenant
    }

    if (attributeList.includes("uid")) {
      reqBody.uid = getUniqueId();
    }
    if (attributeList.includes("parentId")) {
      reqBody.parentId = reqBody.parentId || reqBody.tenantId;
    }
    const uniqueId = attributeList
      .map((attribute) =>
        reqBody[attribute]
          ?.trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9 ]/g, "")
      )
      .join("-");
    return uniqueId;
  }

  createUniqueKeysForMongoUniqueness({ reqBody, rules }) {
    const attributeList = rules.uniqueAttributes;
    let uniqueAttributesContext;
    if (rules.uniqueAttributesContext) {
      uniqueAttributesContext = rules.uniqueAttributesContext;
      uniqueAttributesContext.unshift("tenantId");
    } else {
      uniqueAttributesContext = ["tenantId"];
    }
    const contextPrependValue = uniqueAttributesContext
      .map((attribute) =>
        reqBody[attribute]?.trim().toLowerCase().replace(/\s+/g, "-")
      )
      .join("-");
    for (const uniqueAttribute of attributeList) {
      const uniqueAttributeName = `${uniqueAttribute}Unique`;
      reqBody[
        uniqueAttributeName
      ] = `${contextPrependValue}-${reqBody[uniqueAttribute]}`;
    }
  }

  async getParentFromMongoDB({ queryObj, resource }) {
    let userInfo = null;
    userInfo = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
      resource,
      filters: [queryObj],
    });
    return userInfo;
  }

  async updateParentInMongoDB({ queryObj, resource, attributesToUpdate }) {
    let userInfo = null;
    userInfo = await this.mongoDal.mongoUpdate.patchItem({
      resource,
      filters: [queryObj],
      attributesToUpdate,
    });
    return userInfo;
  }

  initiateAuditing({
    userId,
    userName,
    creationContext,
    tenantId,
    operationId,
    reqBody,
  }) {
    const audits = [];
    const baseAudit = AuditHelper.getEntityBaseAudit({
      userId,
      userName,
      creationContext,
      tenantId,
      operationId,
      entity: reqBody.entity,
    });
    audits.push(
      AuditHelper.getEntityCreateInitiateAudit({
        baseAudit,
        reqBody: JSON.stringify(reqBody),
      })
    );
    return { audits, baseAudit };
  }

  async sendMessageUsingWebsocketIfNeeded({ reqBody, rules }) {
    if (
      rules.sendWebsocketMessage &&
      Array.isArray(reqBody.receivers) &&
      reqBody.receivers.length
    ) {
      const messageToSend = {
        type: "notification",
        message: "New message",
        resourceId: reqBody.entityId,
        resource: reqBody.entity,
        urgency: "normal",
      };
      this.websocketUtility
        .sendMessagesToUsers(reqBody.receivers, messageToSend)
        .catch((err) => {
          console.log(err);
        });
    }
  }
}
