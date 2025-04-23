import {
    HTTP_RESOURCES, OPERATIONS,
    RESPOSE_CODES, MONGO_COLLECTION_NAMES, AUDIT_MESSAGES, QUEUE_EVENTS
} from "@constants";
import { IHandler, IUpdateEntityReqInfo, IVendorInvoiceReqUpdateEvent, IBillingInvoiceEvent, IClientUpdateEvent } from "@interfaces";
import { Context, Integrations } from "@enums";
import { MongoDBClient, RedisClient, SQS } from "@n-oms/multi-tenant-shared";
import { zodSchemas } from "./zodSchemas/entitySchemas";
import { IntegrationsRegister } from "@integrations";
import { AuditHelper, CacheStore, EventTrailingUtilities, createGlobalSearchKey } from "@utilities";

export class UpdateEntityHandler implements IHandler {
    operation: string;
    redisClient: RedisClient;
    mongoDal: MongoDBClient;
    sqsClient: SQS;
    operationId: string;
    resource: string;
    cacheStore: CacheStore
    validations: any[];
    eventTrailingUtilities: EventTrailingUtilities;
    constructor() {
        this.cacheStore = new CacheStore();
        this.operation = OPERATIONS.UPDATE;
        this.operationId = ''
        this.resource = HTTP_RESOURCES.UPDATE_ENTITY.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [zodSchemas];
        this.mongoDal = new MongoDBClient();
        this.redisClient = new RedisClient();
        this.sqsClient = new SQS();
        this.eventTrailingUtilities = new EventTrailingUtilities();
    }

    async handler(req: IUpdateEntityReqInfo, res: any) {
        const tenantId = req.authorizationInfo.orgId;
        this.operationId = req.accessInfo.operationId;
        const originalReqBody = JSON.parse(JSON.stringify(req.body));
        const orgInfo = await this.cacheStore.getOrgInfo(tenantId);
        try {
            if (req.body.entity === MONGO_COLLECTION_NAMES.vendors &&
                req.body.attributesToUpdate.operation === 'BULK_UPDATE') {
                await this.handleVendorBulkUpdate(req.body, tenantId, req.userInfo);
                res.status(RESPOSE_CODES.UPDATE_SUCCESS).send({ message: 'Updated Successfully' });
                return;
            }
            if (req.body.entity === MONGO_COLLECTION_NAMES.notifications) {
                await this.markNotificationAsRead(req.body.attributesToUpdate.pkSkList, req.body.clearAll,{ userId:req.userInfo.email, orgId:tenantId, branchId:req.body.branchId });
                res.status(RESPOSE_CODES.UPDATE_SUCCESS).send({ acknowledged: req.body.attributesToUpdate.pkSkList.length });
                return;
            }
            if (req.body.entity === MONGO_COLLECTION_NAMES.counts) {
                const updatedEntity = await this.mongoDal.mongoUpdate.incrementAttribute({
                    resource: MONGO_COLLECTION_NAMES.counts,
                    filter: { tenantId, ...req.body.filter },
                    attributeToIncrement: req.body.attributeToUpdate || 'count',
                    incrementBy: req.body.incrementBy || 1
                });
                res.status(RESPOSE_CODES.UPDATE_SUCCESS).send(updatedEntity);
                return;
            }
            const { audits, baseAudit } = this.initiateAuditing({
                userId: req.userInfo.email,
                userName: req.userInfo.name,
                creationContext: Context.API,
                tenantId, operationId: this.operationId, reqBody: req.body
            });

            let reqBodyToUpdate = {
                ...req.body.attributesToUpdate
            };

            const filter = { tenantId, ...req.body.filter };
            const rules = JSON.parse(JSON.stringify(HTTP_RESOURCES.UPDATE_ENTITY.entityList[req.body.entity].rules));
            this.restrictUpdateOnSomeAttributes({ rules, reqBodyToUpdate })
            if (Object.entries(reqBodyToUpdate).length > 0) {
                reqBodyToUpdate = {
                    ...reqBodyToUpdate,
                    updatedByEmail: req.userInfo.email,
                    updatedByByName: req.userInfo.name,
                    updatedOn: Date.now().toString(),
                    updateContext: Context.API
                }
                const existingEntity = await this.mongoDal.mongoRead.getItemThatMatchesAnyFilter({ resource: req.body.entity, filters: [filter] });
                this.updateGlobalSearchKeyIfNeeded({ existingEntity, reqBodyToUpdate, rules, entity: req.body.entity })
                const updatedEntity = await this.mongoDal.mongoUpdate.patchItem({ resource: req.body.entity, filters: [filter], attributesToUpdate: reqBodyToUpdate });
                const changes = this.getChangesOnly(originalReqBody.attributesToUpdate, existingEntity);
                const primaryKey = this.getPrimaryKeyForAuditing(req.body.entity, filter);
                audits.push(AuditHelper.getEntityUpdateAudit({
                    resourceId: primaryKey,
                    baseAudit, oldValue: JSON.stringify(changes.oldValues),
                    newValue: JSON.stringify(changes.newValues), filter
                }))
                if (req.body.entity === MONGO_COLLECTION_NAMES.integrations &&
                    reqBodyToUpdate.action === Integrations.MANUAL_TRIGGER) {
                    IntegrationsRegister.triggerIntegration({
                        integrationInfo: existingEntity,
                        mongoDal: this.mongoDal,
                        tenantId,
                        userInfo: { email: req.userInfo.email, name: req.userInfo.name }
                    })
                }
                if (req.body.entity === MONGO_COLLECTION_NAMES.ledgers) {
                    const orgInfo = await this.cacheStore.getOrgInfo(tenantId);
                    if (orgInfo.eventConfigurations.syncInvoiceStatus) {
                        const msgBody: IVendorInvoiceReqUpdateEvent = {
                            eventId: QUEUE_EVENTS.STATUS_UPDATE_INVOICE_REQUEST,
                            eventDetails: {
                            status: req.body.attributesToUpdate.status,
                            amountPaid: req.body.attributesToUpdate.amountPaid,
                            message: req.body.attributesToUpdate.message,
                            createdBy: req.userInfo.email,
                            createdByName: req.userInfo.name,
                            invoiceReqId: req.body.filter.invoiceReqId,
                            vendorId: req.body.filter.vendorId,
                            }
                        }
                        await this.sqsClient.sendMessagesToQueue({ tenantId: '', queueName: orgInfo.eventConfigurations.syncInvoiceStatus, msgBody });
                    }
                }
                await this.triggerEventIfNeeded({
                    rules, req, reqBody: {
                        entity: req.body.entity,
                        ...req.body.attributesToUpdate,
                        ...req.body.filter
                    }, orgInfo, tenantId, existingEntity
                })
                AuditHelper.createReadOnlyEntries({ input: audits, mongoDal: this.mongoDal });
                res.status(RESPOSE_CODES.UPDATE_SUCCESS).send(updatedEntity);
                return;
            } else {
                res.status(RESPOSE_CODES.BAD_INPUT).send({ message: 'Please check the input' });
                return;
            }
        } catch (err) {
            console.log(`Error in updating entity:${req.body.entity}`, err)
            const errorAudit: any = this.getFatalErrorAudit({ req, tenantId, operationId: this.operationId });
            errorAudit.extraDetails = err;
            AuditHelper.createReadOnlyEntries({
                input: [AuditHelper.getEntityFatalErrorAudit(errorAudit)],
                mongoDal: this.mongoDal
            })
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: `Unable to update entity: ${req.body.entity}`
            });
        }
    }

    updateGlobalSearchKeyIfNeeded({ existingEntity, reqBodyToUpdate, rules, entity }) {
        switch (entity) {
            case MONGO_COLLECTION_NAMES.vendors:
                this.updateGlobalSearchKey({ existingEntity, reqBodyToUpdate, rules })
                break;

            default:
                break;
        }
    }

    updateGlobalSearchKey({ existingEntity, reqBodyToUpdate, rules }) {
        const hasMatchingKey = rules.globalSearchKeys.some(key => key in reqBodyToUpdate);
        if (hasMatchingKey) {
            reqBodyToUpdate.globalSearchKey = createGlobalSearchKey({ ...existingEntity, ...reqBodyToUpdate }, rules.globalSearchKeys);
            reqBodyToUpdate.globalSearchKey = reqBodyToUpdate.globalSearchKey.replace(/ /g, '-');
        }
    }

    async checkIfGlobalSearchKeyUpdateNeededForClient({ body, globalSearchKeys, tenantId, queueName, req }) {
        const hasMatchingKey = globalSearchKeys.some(key => key in body);
        if (hasMatchingKey) {
            await this.publishClientEventIfNeeded({ body, tenantId, queueName, req })
        }
    }

    async publishClientEventIfNeeded({ body, tenantId, queueName, req }) {
        body.operationId = this.operationId;
        const msgBody: IClientUpdateEvent = {
            eventId: QUEUE_EVENTS.CLIENT_UPDATE_EVENT,
            tenantId,
            createdBy: req.userInfo.email,
            createdByName: req.userInfo.name,
            eventDetails: body,
        };
        console.log("published client update event", msgBody);
        await this.sqsClient.sendMessagesToQueue({
            tenantId,
            queueName,
            msgBody,
        });
    }

    getPrimaryKeyForAuditing(entity, filter) {
        if (HTTP_RESOURCES.NEW_ENTITY.entityList[entity]) {
            const rules = JSON.parse(JSON.stringify(HTTP_RESOURCES.NEW_ENTITY.entityList[entity].rules));
            return filter[rules.primaryKey]
        } else {
            const rules = JSON.parse(JSON.stringify(HTTP_RESOURCES.UPDATE_ENTITY.entityList[entity].rules));
            return filter[rules.primaryKey]
        }

    }

    async handleVendorBulkUpdate(body, tenantId, userInfo) {
        const attributesToUpdate = {
            crmUpdatedBy: userInfo.email,
            ...body.attributesToUpdate
        };
        const result = await this.mongoDal.mongoUpdate.paginateAndUpdateEntitiesBulk({
            resource: MONGO_COLLECTION_NAMES.vendors, filter: { tenantId },
            attributesToUpdate, skip: body.attributesToUpdate.skip, limit: body.attributesToUpdate.limit
        })
        return result;
    }

    async markNotificationAsRead(skList, clearAll,{ userId, orgId, branchId }) {
        if (clearAll) {
            await this.eventTrailingUtilities.markAllUserNotificationsToRead({ userId, orgId, branchId })
        } else {
            await this.eventTrailingUtilities.markUserNotificationsToReadUsingPKSkList(skList)
        }
    }

    async triggerEventIfNeeded({ rules, req, reqBody, orgInfo, tenantId, existingEntity }) {
        if (rules.triggerEvent) {
            const queueName = orgInfo?.eventConfigurations
                ? orgInfo?.eventConfigurations[this.operationId]
                : null;
            if (queueName) {
                switch (reqBody.entity) {
                    case MONGO_COLLECTION_NAMES.clients:
                        await this.checkIfGlobalSearchKeyUpdateNeededForClient({
                            body: reqBody,
                            globalSearchKeys: rules.globalSearchKeys,
                            tenantId, queueName, req
                        });
                        break;
                    case MONGO_COLLECTION_NAMES.vendors:
                        //trigger vendor related event
                        break;
                    case MONGO_COLLECTION_NAMES.invoices:
                        await this.triggerInvoiceUpdatedEvent({
                            queueName: `${queueName}-${process.env.ORG_NAME}`, req, reqBody, tenantId, existingEntity
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }

    async triggerInvoiceUpdatedEvent({ queueName, req, reqBody, tenantId, existingEntity }) {
        const taskAssociationIdList = existingEntity.invoiceInfo.taskDetails.map(e => e.taskAssociationId);
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

    initiateAuditing({ userId, userName, creationContext, tenantId, operationId, reqBody }) {
        const audits = [];
        const baseAudit = AuditHelper.getEntityBaseAudit({
            userId, userName,
            creationContext,
            tenantId,
            operationId,
            entity: reqBody.entity,
            filter: reqBody.filter
        });
        audits.push(AuditHelper.getEntityUpdateInitiateAudit({
            baseAudit,
            reqBody: JSON.stringify(reqBody.attributesToUpdate),
            filter: reqBody.filter
        }));
        return { audits, baseAudit };
    }

    getFatalErrorAudit({ req, tenantId, operationId }) {
        return {
            reqBody: JSON.stringify(req.body),
            tenantId,
            operationId,
            userId: req.userInfo.email,
            userName: req.userInfo.name,
            creationContext: Context.API,
            message: AUDIT_MESSAGES.ENTITY.update_failed,
            extraDetails: '',
            entity: req.body.entity,
            ...req.body.filter
        };
    }

    getChangesOnly(attributesToUpdate, existingJson) {
        const changes = {
            oldValues: {},
            newValues: {}
        };
        for (const key in attributesToUpdate) {
            if (existingJson[key] !== attributesToUpdate[key]) {
                changes.oldValues[key] = existingJson[key];
                changes.newValues[key] = attributesToUpdate[key];
            }
            else {
                changes.newValues[key] = attributesToUpdate[key];
            }
        }
        return changes;
    }

    async getExistingEntityFromMongo({ email, audits, baseAudit }) {
        const existingMongoUser = await this.mongoDal.mongoRead.getItemThatMatchesAnyFilter({
            resource: MONGO_COLLECTION_NAMES.users,
            filters: [{ email }]
        })
        if (!existingMongoUser) {
            return true;
        } else {
            audits.push(AuditHelper.getWorkflowExpectedErrorAudit({
                baseAudit, message: AUDIT_MESSAGES.USER_ONBOARDING.user_exists_already_in_mongo,
                extraDetails: email
            }));
            return false;
        }
    }

    restrictUpdateOnSomeAttributes({ rules, reqBodyToUpdate }) {
        if (rules.controlledUpdate) {
            const filteredObject = {};
            for (const allowedAttribute of rules.updatableAttributes) {
                if (reqBodyToUpdate[allowedAttribute]) {
                    filteredObject[allowedAttribute] = reqBodyToUpdate[allowedAttribute];
                }
            }
        } else {
            rules.immutableAttributes.push('tenantId');
            for (const restrictedAttribute of rules.immutableAttributes) {
                if (reqBodyToUpdate[restrictedAttribute]) {
                    delete reqBodyToUpdate[restrictedAttribute];
                }
            }
        }
    }
}