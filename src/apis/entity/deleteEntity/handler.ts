import {
    HTTP_RESOURCES, OPERATIONS,
    RESPOSE_CODES, MONGO_COLLECTION_NAMES, AUDIT_MESSAGES, DYNAMO_ENTITIES,
    QUEUE_PREFIX,
    QUEUE_EVENTS
} from "@constants";
import { IHandler, IDeleteEntityReqInfo, ITaskNotificationEvent } from "@interfaces";
import { Context, DeleteAble_Entities } from "@enums";
import { MongoDBClient, SQS } from "@n-oms/multi-tenant-shared";
import { zodSchemas } from "./zodSchemas/entitySchemas";
import { AuditHelper } from "@utilities";

export class DeleteEntityHandler implements IHandler {
    operation: string;
    mongoDal: MongoDBClient;
    operationId: string;
    resource: string;
    sqsClient: SQS;
    validations: any[];
    constructor() {
        this.operation = OPERATIONS.DELETE;
        this.operationId = ''
        this.resource = HTTP_RESOURCES.DELETE_ENTITY.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [zodSchemas];
        this.mongoDal = new MongoDBClient();
        this.sqsClient = new SQS();
    }

    async handler(req: IDeleteEntityReqInfo, res: any) {
        const tenantId = req.authorizationInfo.orgId;
        this.operationId = req.accessInfo.operationId;
        try {
            const { audits, baseAudit } = this.initiateAuditing({
                userId: req.userInfo.email,
                userName: req.userInfo.name,
                creationContext: Context.API,
                tenantId,
                operationId: this.operationId,
                reqBody: req.body
            });
            const filters = req.body.filters.map(filter => ({
                tenantId,
                ...filter
            }));
            const rules = JSON.parse(
                JSON.stringify(
                    HTTP_RESOURCES.DELETE_ENTITY.entityList[req.body.entity].rules
                )
            );
            let resource;

            switch (req.body.entity) {
                case DeleteAble_Entities.USER_LEADS:
                    resource = MONGO_COLLECTION_NAMES.orgEntities
                    break;
                case DeleteAble_Entities.VENDORS:
                    resource = MONGO_COLLECTION_NAMES.vendors
                    break;
                case DeleteAble_Entities.USERS:
                    resource = MONGO_COLLECTION_NAMES.users
                    break;
                case DeleteAble_Entities.GENERIC_TASK:
                    resource = MONGO_COLLECTION_NAMES.genericTasks
                    break;
                case DeleteAble_Entities.PRIMARY_TASK:
                    resource = DYNAMO_ENTITIES.PRIMARY_TASK
                    break;
                case DeleteAble_Entities.INVOICE:
                    resource = MONGO_COLLECTION_NAMES.invoices
                    break;
                case DeleteAble_Entities.ORG_ENTITIES:
                    resource = MONGO_COLLECTION_NAMES.orgEntities
                    break;
                case DeleteAble_Entities.PROJECT_ENTITIES:
                    resource = MONGO_COLLECTION_NAMES.project_entities
                    break;
                

            }
            if (rules.takeBackupBeforeDelete) {
                const itemsToDelete = await this.mongoDal.mongoRead.getManyThatMatchesAnyFilter({ resource, filters });
                audits.push(AuditHelper.putResourceBackupToBeDeleteInAudit({ baseAudit, resourceToBeDeleted: itemsToDelete.results, resourceId:resource }));
            }

            if (resource === MONGO_COLLECTION_NAMES.invoices ||
                resource === MONGO_COLLECTION_NAMES.genericTasks ||
                resource === DYNAMO_ENTITIES.PRIMARY_TASK) {
                if (resource === DYNAMO_ENTITIES.PRIMARY_TASK) {
                    const msgBody: ITaskNotificationEvent = {
                        eventId: QUEUE_EVENTS.TASK_DELETED,
                        userId: req.userInfo.email,
                        userName: req.userInfo.name,
                        eventDetails: {},
                        orgId:tenantId,
                        branchId:req.body.filters[0].branchId,
                        taskAssociationId: req.body.filters[0].taskAssociationId
                    }
                    await this.sqsClient.sendMessagesToQueue({ tenantId, queueName: `${QUEUE_PREFIX.TASK_NOTIFICATIONS}-${process.env.ORG_NAME}`, msgBody });
                } else {
                    if (resource === MONGO_COLLECTION_NAMES.invoices) {
                        const invoiceRes: any = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({ resource, filters, matchAny: true });
                        if (invoiceRes) {
                            for (const taskAssociationInfo of invoiceRes.invoiceInfo.taskDetails) {
                                await this.mongoDal.mongoUpdate.updateArrayAttributeOfItem({
                                    resource: MONGO_COLLECTION_NAMES.genericTasks,
                                    action: 'pop',
                                    arrayAttribute: 'invoiceIds',
                                    filter: {
                                      entity: "financialTasks",
                                      tenantId,
                                      taskAssociationId: taskAssociationInfo.taskAssociationId
                                    },
                                    item: req.body.filters[0].invoiceId
                                }); 
                            }
                        }
                        await this.mongoDal.mongoDelete.deleteItem({ resource, filters, matchAny: true });
                    } else {
                        await this.mongoDal.mongoDelete.deleteItem({ resource, filters, matchAny: true }); 
                    }
                }
            } else {
                await this.mongoDal.mongoDelete.deleteMany({ resource, filters, matchAny: true });
            }
            audits.push(AuditHelper.getEntityDeleteAudit({ baseAudit, filters }));
            AuditHelper.createReadOnlyEntries({
                input: audits,
                mongoDal: this.mongoDal
            })
            res.status(RESPOSE_CODES.DELETE).send({ message: 'Successfully Deleted' });
        } catch (err) {
            console.log(`Error in deleting entity:${req.body.entity}`, err)
            const errorAudit: any = this.getFatalErrorAudit({ req, tenantId, operationId: this.operationId });
            errorAudit.extraDetails = err;
            AuditHelper.createReadOnlyEntries({
                input: [AuditHelper.getEntityFatalErrorAudit(errorAudit)],
                mongoDal: this.mongoDal
            })
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: `Unable to delete entity: ${req.body.entity}`
            });
        }
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
        audits.push(AuditHelper.getEntityDeleteInitiateAudit({
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
}