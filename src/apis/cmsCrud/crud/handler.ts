import {
  AUDIT_MESSAGES,
  HTTP_RESOURCES,
  MONGO_COLLECTION_NAMES,
  OPERATION_ID_LIST,
  OPERATIONS,
  CMS_ENTITIES
} from "@constants";
import { CMS_CRUD_ACTIONS, Context } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { AuditHelper, CacheStore, getUniqueId } from "@utilities";
import { Response } from "express";
import { CmsIntegration } from "src/integrations/cmsIntegration";
import { AuditService } from "src/shared/services/audits/main";
import { z } from "zod";
import { zodSchemas } from "./zodSchemas";

const cmsCrudZodSchema = zodSchemas.cmsCrudZodSchema;

export class CmsCrudHandler implements IHandler {
  operation: string;
  operationId: string;
  resource: string;
  validations: any[];
  cacheStore: CacheStore;
  mongoDal: MongoDBClient;
  cmsIntegration: CmsIntegration;
  constructor() {
    this.operation = OPERATIONS.INVOKE;
    this.operationId = OPERATION_ID_LIST.cmsCrud;
    this.resource = HTTP_RESOURCES.CMS.relativepath;
    this.validations = [zodSchemas.cmsCrudZodSchema];
    this.cacheStore = new CacheStore();
    this.mongoDal = new MongoDBClient();
    this.cmsIntegration = new CmsIntegration();
    this.handler = this.handler.bind(this);
    this.createEntity = this.createEntity.bind(this);
  }

  async processCmsEntityCounter({ reqBody, tenantId, orgInfo, mongoDal }) {
    switch (reqBody.metaData.cmsEntityName) {
      case CMS_ENTITIES.AGENTSCOUT.AGENTS: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { agentsCounter: 1 } },
        });
  
        const agentIdWithPrefix = `${orgInfo.clientConfiguration.agentPrefix}-${currentCount.agentsCounter}-${reqBody.fieldData.firstName}`;
        reqBody.fieldData.agentId = agentIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.BUILDINGS: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { buildingCounter: 1 } },
        });
  
        const buildingIdWithPrefix = `${orgInfo.clientConfiguration.buildingPrefix}-${currentCount.buildingCounter}`;
        reqBody.fieldData.buildingId = buildingIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.BUILDING_UNITS: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { buildingUnitCounter: 1 } },
        });
  
        const buildingUnitIdWithPrefix = `${orgInfo.clientConfiguration.buildingUnitPrefix}-${currentCount.buildingUnitCounter}`;
        reqBody.fieldData.buildingUnitId = buildingUnitIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.PROPERTY_LISTINGS: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { propertyListingCounter: 1 } },
        });
  
        const propertyListingIdWithPrefix = `${orgInfo.clientConfiguration.propertyListingPrefix}-${currentCount.propertyListingCounter}`;
        reqBody.fieldData.propertyListingId = propertyListingIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.PLOTS: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { plotCounter: 1 } },
        });
  
        const plotIdWithPrefix = `${orgInfo.clientConfiguration.plotPrefix}-${currentCount.plotCounter}`;
        reqBody.fieldData.plotId = plotIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.VEHICLES: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { vehicleCounter: 1 } },
        });
  
        const vehicleIdWithPrefix = `${orgInfo.clientConfiguration.vehiclePrefix}-${currentCount.vehicleCounter}`;
        reqBody.fieldData.vehicleId = vehicleIdWithPrefix.toLowerCase();
        break;
      }
      case CMS_ENTITIES.AGENTSCOUT.HEALTH_INSURANCE_POLICIES: {
        const currentCount = await mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId }],
          attributesToUpdate: { $inc: { healthPolicyCounter: 1 } },
        });
  
        const healthPolicyIdWithPrefix = `${orgInfo.clientConfiguration.healthPolicyPrefix}-${currentCount.healthPolicyCounter}`;
        reqBody.fieldData.healthPolicyId = healthPolicyIdWithPrefix.toLowerCase();
        break;
      }
      
      case CMS_ENTITIES.TWINS_GENERATION.TWINS_GENERATION_PRODUCTS: {
        const currentItemsCount = await this.mongoDal.mongoUpdate.patchItem({
          resource: MONGO_COLLECTION_NAMES.tenants,
          filters: [{ tenantId: tenantId }],
          attributesToUpdate: { $inc: { itemsCounter: 1 } },
        });
        const productIdWithPrefix = `${orgInfo.clientConfiguration.productSerialNoPrefix}-${currentItemsCount.itemsCounter}`;
        reqBody.fieldData.itemSeqNo = productIdWithPrefix.toLowerCase();
        break;
      }
      default:
        // Handle other cases if needed
        break;
    }
  }
  

  async handler(req: IReqInfo, res: Response) {
    const tenantId = req.authorizationInfo.orgId;
    const orgInfo = await this.cacheStore?.getOrgInfo(tenantId);

    const { audits, baseAudit } = AuditService.initiateAuditing({
      userId: req.userInfo.email,
      userName: req.userInfo.name,
      creationContext: Context.API,
      tenantId,
      operationId: this.operationId,
      reqBody: req.body,
    });
    try {
      const reqBody = req.body as z.infer<typeof cmsCrudZodSchema>;
      const metaData = reqBody.metaData;
      const fieldData = reqBody.fieldData;
      let result;
      let migrationData;
      switch (reqBody.action) {
        case CMS_CRUD_ACTIONS.CREATE: {
          fieldData.entityId = getUniqueId();
          await this.processCmsEntityCounter({ reqBody, tenantId, orgInfo, mongoDal: this.mongoDal });
          result = await this.createEntity({
            resource: metaData.entity,
            data: {
              ...metaData,
              ...fieldData,
              tenantId,
              entityId: fieldData.entityId,
            },
          });
          migrationData = fieldData;
          break;
        }
        case CMS_CRUD_ACTIONS.UPDATE: {
          result = await this.mongoDal.mongoUpdate.patchItem({
            filters: [reqBody.filter],
            resource: metaData.entity,
            attributesToUpdate: { ...fieldData },
          });
          migrationData = this.prepareMigrationData({ fieldData });
          break;
        }
        case CMS_CRUD_ACTIONS.DELETE: {
          result = await this.mongoDal.mongoDelete.deleteItem({
            resource: metaData.entity,
            filters: [reqBody.filter],
          })
          break;
        }
        default: {
          throw new Error("Invalid action");
        }
      }

      await this.cmsIntegration.triggerMigration({
        tenantId,
        data: migrationData,
        action: reqBody.action,
        targetCollection: metaData.cmsEntityName as string,
        filter: reqBody.filter,
        updateCmsUser: reqBody.updateCmsUser,
        cmsUserUpdationInfo: reqBody.cmsUserUpdationInfo
      });

      await AuditService.addAuditEntries({
        audits,
        baseAudit,
        mongoDal: this.mongoDal,
        newEntity: result,
        reqBody,
        rules: [],
      });

      return res.status(200).send(result);

    } catch (error) {
      AuditHelper.createReadOnlyEntries({
        input: [
          AuditHelper.getEntityFatalErrorAudit({
            ...baseAudit,
            reqBody: JSON.stringify(req.body),
            message: AUDIT_MESSAGES.CMS[req.body.action],
            extraDetails: error,
          }),
        ],
        mongoDal: this.mongoDal,
      });
      res
        .status(500)
        .send({ message: error.message || "Something went wrong" });
    }
  }

  async createEntity({ resource, data }: { resource: string; data: unknown }) {
    const result = await this.mongoDal.mongoCreate.createItem({
      resource,
      data,
    });
    return result;
  }

  private prepareMigrationData({
    fieldData,
  }: {
    fieldData: Record<string, any>;
  }) {
    delete fieldData.entityId;
    delete fieldData.tenantId;
    delete fieldData.createdAt;
    delete fieldData.updatedAt;
    delete fieldData.createdByName;
    delete fieldData.createdByEmail;
    delete fieldData._id
    delete fieldData.updatedByName;
    delete fieldData.updatedByEmail
    delete fieldData.cmsEntityName
    delete fieldData.entity
    delete fieldData.entityType
    delete fieldData.entityId
    delete fieldData.collectionId
    delete fieldData.hierarchy
    delete fieldData.__v
    return fieldData;
  }
}
