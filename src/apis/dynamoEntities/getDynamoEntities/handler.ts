import {
    HTTP_RESOURCES, RESPOSE_CODES,
    COMMON_ERROR_MESSAGES
} from "@constants";
import { IHandler, IReqInfo } from "@interfaces";
import { DynamoEntity, ViewingLens, TaskFilters, Notifications_DynamoType, NotificationStatus, PERIODICITY } from "@enums";
import { DynamoDAL, TaskUtilities, EventTrailingUtilities,PeriodUtilities } from "@utilities";
import { z } from 'zod';

export class GetDynamoEntitiesHandler implements IHandler {
    operation: string;
    operationId: string;
    dynamoDAL: DynamoDAL;
    resource: string;
    validations: any[];
    eventTrailingUtilities: EventTrailingUtilities;
    periodUtilities: PeriodUtilities;
    constructor() {
        this.operation = HTTP_RESOURCES.DYNAMO_ENTITIES.operationIdList.getDynamoEntities.operationType;
        this.operationId = HTTP_RESOURCES.DYNAMO_ENTITIES.operationIdList.getDynamoEntities.name;
        this.resource = HTTP_RESOURCES.DYNAMO_ENTITIES.relativepath;
        this.handler = this.handler.bind(this);
        this.eventTrailingUtilities = new EventTrailingUtilities();
        this.dynamoDAL = new DynamoDAL();
        this.periodUtilities = new PeriodUtilities();
        this.validations = [z.object({
            entity: z.nativeEnum(DynamoEntity),
            branchId: z.string(),
            viewingLens: z.nativeEnum(ViewingLens).optional(),
            notificationLevel: z.nativeEnum(Notifications_DynamoType).optional(),
            filter: z.object({
                eventEntity: z.string().optional(),
                eventEntityId: z.string().optional(),
                userId: z.string().optional(),
                subString: z.string().optional(),
                from: z.string().optional(),
                to: z.string().optional(),
                paramName: z.nativeEnum(TaskFilters).optional(),
                taskId: z.string().optional(),
                branchId: z.string().optional(),
                periodicity: z.nativeEnum(PERIODICITY).optional(),
                effectiveFrom: z.string().optional(),
                generateTill: z.string().optional()
            }).optional(),
            sortCondition: z.object({}).optional(),
        })];
    }

    async handler(req: IReqInfo, res: any) {
        try {
            let result;
            const reqContext = {
                orgId: req.authorizationInfo.orgId,
                branchId: req.body.branchId,
                userId: req.userInfo.email
            };
            switch (req.body.entity) {
                case DynamoEntity.TASK_CLIENT_ASSOCIATION:
                    result = await this.filterTaskClientAssociations({ reqContext, reqBody: req.body })
                    break;
                case DynamoEntity.NOTIFICATIONS:
                    result = await this.getNotifications({ reqContext, reqBody: req.body })
                    break;
                case DynamoEntity.EVENT_TRAILS:
                    result = await this.getEventTrails({ reqContext, reqBody: req.body })
                    break;
                case DynamoEntity.ENTITY_MANAGED_FILES:
                    result = await this.getEntityFiles({ reqContext, reqBody: req.body })
                    break;
                case DynamoEntity.TASK_PERIOD_LIST_BASED_ON_RANGE:
                    result = await this.getEffectivePeriods({ ...reqContext, ...req.body })
                    this.removeFuturePeriodsAndRegisterForTaskAutomation(result)
                    break;
                default:
                    break;
            }
            res.status(RESPOSE_CODES.READ).send(result);
            return;
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            });
        }
    }

     removeFuturePeriodsAndRegisterForTaskAutomation(result) {
        const currentDayInNumber = this.periodUtilities.get_TodayS_DateStringIn_YYYYMMDD_format("Asia/Kolkata");
        console.log('currentDayInNumber', currentDayInNumber);
        const futuristicPeriods = result.items.filter(e => e.taskCreationDateInNumber > currentDayInNumber);
        console.log('futuristicPeriods', futuristicPeriods);
        if (futuristicPeriods.length) {
            result.addToTaskAutomation = true;
        }
         result.items = result.items.filter(e => e.taskCreationDateInNumber <= currentDayInNumber);
         result.resultCount = result.items.length;
    }

    async getEffectivePeriods({
        orgId,
        branchId,
        taskId,
        periodicity,
        effectiveFrom,
        generateTill,
    }) {
        const startValue = effectiveFrom;
        const endValue = generateTill;

        const dynamoParams = {
            keyCondition: "pk = :v1 AND #sk BETWEEN :startValue AND :endValue",
            expressionAttributeValues: {
                ":v1": { S: `org#${orgId}#branch#${branchId}#task#${taskId}#periodicity` },
                ":startValue": {
                    S:
                        startValue ||
                        `${periodicity}#${effectiveFrom.financialYear}#${effectiveFrom.periodRange}`,
                },
                ":endValue": {
                    S:
                        endValue ||
                        `${periodicity}#${generateTill.financialYear}#${generateTill.periodRange}`,
                },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
            tableName: '',
            isAscendingOrder: false,
        };
        const result = await this.dynamoDAL.getRowsFromDynamoDB(dynamoParams);
        return result;
    }

    async getEntityFiles({ reqContext, reqBody }) {
        const pk = `org#${reqContext.orgId}#branch#${reqContext.branchId}#managedFiles`;
        const taskPartition = `attachments#${reqBody.filter.fileEntity}#${reqBody.filter.fileEntityId}`;
        let dynamoParams;
        if (reqBody.filter.subString) {
            dynamoParams = {
                keyCondition: "#pk = :v1 AND begins_with(#sk, :v3)",
                expressionAttributeValues: {
                    ":v1": { S: pk },
                    ":v2": { S: reqBody.filter.subString.toLowerCase() },
                    ":v3": { S: taskPartition }
                },
                expressionAttributeNames: {
                    "#pk": "pk",
                    "#globalSearchKey": "globalSearchKey",
                    "#sk": "sk"
                },
                tableName: '',
                filterExpression: "contains(#globalSearchKey, :v2)",
                isAscendingOrder: false,
            };
        } else if (reqBody.filter.docType) {
            dynamoParams = {
                keyCondition: "#pk = :v1 AND begins_with(#sk, :v3)",
                expressionAttributeValues: {
                    ":v1": { S: pk },
                    ":v2": { S:reqBody.filter.docType },
                    ":v3": { S: taskPartition }
                },
                expressionAttributeNames: {
                    "#pk": "pk",
                    "#sk": "sk",
                    "#docType": "docType"
                },
                tableName: '',
                filterExpression: "#docType = :v2",
                isAscendingOrder: false,
            };
         }
        else {  
            dynamoParams = {
                keyCondition: "#pk = :v1 AND begins_with(#sk, :v2)",
                expressionAttributeValues: {
                    ":v1": { S: pk },
                    ":v2": { S: taskPartition }
                },
                expressionAttributeNames: {
                    "#pk": "pk",
                    "#sk": "sk"
                },
                tableName: '',
                isAscendingOrder: false
            }
        }
        const result = await this.dynamoDAL.getRowsWithFilterFromDynamoDB(dynamoParams);
        return result;
    }

    async filterTaskClientAssociations({ reqContext, reqBody }) {
        const result = await TaskUtilities.getTaskAssocList({
            reqContext, dynamoClient: this.dynamoDAL,
            viewingLens: reqBody.viewingLens,
            sortCondition: reqBody.sortCondition, filter: reqBody.filter
        });
        return result;
    }

    async getEventTrails({ reqContext, reqBody }) {
        let dynamoParams;
        if (reqBody.filter.eventEntity === 'self') {
            dynamoParams = this.eventTrailingUtilities.getSelfActivityParams(reqContext)
        } else {
            dynamoParams = this.eventTrailingUtilities.getEventTrailParams({
                ...reqContext,
                entity: reqBody.filter.eventEntity, entityId: reqBody.filter.eventEntityId
            })

        }
        const result = await this.eventTrailingUtilities.getRowsFromDynamo(dynamoParams);
        return result;
    }

    async getNotifications({ reqContext, reqBody }) {
        let dynamoParams;
        switch (reqBody.notificationLevel) {
            case Notifications_DynamoType.USER_NOTIFICATIONS:
                if (reqBody.filter && reqBody.filter.subString === NotificationStatus.READ) {
                    dynamoParams = await this.eventTrailingUtilities.getAllNotificationsParams(reqContext)
                } else {
                    dynamoParams = await this.eventTrailingUtilities.getUserNotificationsParams(reqContext)
                }
                break;
            case Notifications_DynamoType.BRANCH_NOTIFICATIONS:
                dynamoParams = await this.eventTrailingUtilities.getBranchNotificationsParams(reqContext)
                break;
            case Notifications_DynamoType.ORG_NOTIFICATIONS:
                dynamoParams = await this.eventTrailingUtilities.getOrgNotificationsParams(reqContext)
                break;
            default:
                break;
        }
        const result = await this.eventTrailingUtilities.getRowsFromDynamo(dynamoParams);
        return result;
    }

    async getEventHistory({ reqContext, reqBody }) {
        const result = await TaskUtilities.getTaskAssocList({
            reqContext, dynamoClient: this.dynamoDAL,
            viewingLens: reqBody.viewingLens,
            sortCondition: reqBody.sortCondition, filter: reqBody.filter
        });
        return result;
    }
}