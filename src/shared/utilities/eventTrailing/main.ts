import { DynamoDAL } from "@utilities";
import { ConfigKeys, Dynamo_Index_Names, NotificationHierarchy, NotificationStatus } from "@enums";
import { IEventContext } from "@interfaces";
import { getBranchConfiguration } from "@utilities";
import { S3, RedisClient } from "@n-oms/multi-tenant-shared";
import { v4 as uuidv4 } from 'uuid';

export class EventTrailingUtilities {
    dynamoDAL: DynamoDAL;
    redisClient: RedisClient;
    s3Client: S3;
    constructor() {
        this.dynamoDAL = new DynamoDAL();
        this.s3Client = new S3();
        this.redisClient = new RedisClient();
    }

    pushNotificationDynamoRows(notificationsToSend, eventContext, dynamoRows) {
        for (let index = 0; index < notificationsToSend.length; index++) {
            const notification = notificationsToSend[index];
            const finalNotificationObj = {
                ...notification,
                ...eventContext
            }
            dynamoRows.push(this.getNotificationsDynamoRow(finalNotificationObj, eventContext))
        }
    }

    async addEventTrailAndNotificationsIfNeeded(eventContext: IEventContext, notificationsToSend: Array<{ to: string, message: string }>, checkConfigBeforeSending = false) {
        const dynamoRows = [];
        if (checkConfigBeforeSending) {
            const notificationConfig = await getBranchConfiguration({
                branchId: eventContext.branchId,
                orgId: eventContext.orgId,
                configId: ConfigKeys.NOTIFICATIONS, s3Client: this.s3Client,
                redisClient: this.redisClient
            });
            const eventHistoryConfig = await getBranchConfiguration({
                branchId: eventContext.branchId,
                orgId: eventContext.orgId,
                configId: ConfigKeys.EVENT_HISTORY,
                s3Client: this.s3Client,
                redisClient: this.redisClient
            })
            if (this.isEnabled(notificationConfig, eventContext.operationId)) {
                this.pushNotificationDynamoRows(notificationsToSend, eventContext, dynamoRows)
            }
            if (this.isEnabled(eventHistoryConfig, eventContext.entity)) {
                dynamoRows.push(this.getEventTrailDynamoRow(eventContext))
            }
        } else {
            this.pushNotificationDynamoRows(notificationsToSend, eventContext, dynamoRows)
            dynamoRows.push(this.getEventTrailDynamoRow(eventContext))
        }
        const dynamoContext = {
            ...eventContext, userInfo: {
                userId: eventContext.userId,
                userName: eventContext.userName
            }
        }
        try {
            await this.dynamoDAL.putRowsInDynamoDB(dynamoRows, dynamoContext);
        } catch (error) {
            console.log('Error while adding event trail and notifications in dynamodb', error);
        }
    }

    isEnabled(config: any, id: string): boolean {
        const item = config.configuration.find((item) => item.id === id);
        return item ? item.enabled : false;
    }

    getEventTrailDynamoRow(context: IEventContext) {
        const newRow: any = {
            ...context,
            orgId: context.orgId,
            branchId: context.branchId,
            userId: context.userId,
            userName: context.userName,
            pk: `org#${context.orgId}#branch#${context.branchId}#eventHistory`,
            sk: `events#${context.entity}#${context.entityId}#${Date.now()}`,
            lsi1: Date.now(),
            lsi2: context.categoryId,
            lsi3: context.action,
            lsi4: `${context.userId}#${Date.now()}`,
        };
        if (context.clientId) {
            newRow.gsi1Pk = `client#${context.clientId}#eventHistory`;
            newRow.gsi1Sk = Date.now();
        }
        return JSON.parse(JSON.stringify(newRow));
    }

    getNotificationsDynamoRow(notification: any, context: IEventContext) {
        switch (context.hierarchy) {
            case NotificationHierarchy.org:
                return this.getOrgNotificationsDynamoRow(notification, context);
            case NotificationHierarchy.branch:
                return this.getBranchNotificationsDynamoRow(notification, context)
            case NotificationHierarchy.personal:
                return this.getUserNotificationsDynamoRow(notification, context)
        }
    }

    getUserNotificationsDynamoRow(notification, context: IEventContext) {
        const newRow: any = {
            ...notification,
            orgId: context.orgId,
            branchId: context.branchId,
            userId: context.userId,
            userName: context.userName,
            pk: `org#${context.orgId}#branch#${context.branchId}#users#${notification.to}`,
            sk: `notifications#${Date.now()}#${uuidv4()}`,
            gsi1Pk:`org#${context.orgId}#branch#${context.branchId}#notifications`,
            lsi1: Date.now(),
            lsi2: context.categoryId,
            lsi3: context.action,
            lsi4: context.urgency,
            lsi5: `notifications#${NotificationStatus.NOT_READ}#${Date.now()}`
        };
        return JSON.parse(JSON.stringify(newRow));
    }

    getBranchNotificationsDynamoRow(notification, context: IEventContext) {
        const newRow: any = {
            ...notification,
            orgId: context.orgId,
            branchId: context.branchId,
            userId: context.userId,
            userName: context.userName,
            pk: `org#${context.orgId}#branch#${context.branchId}#notifications`,
            sk: `branchLevel#${Date.now()}#${uuidv4()}`,
            lsi1: Date.now(),
            lsi2: context.categoryId,
            lsi3: context.action,
            lsi4: context.urgency
        };
        return JSON.parse(JSON.stringify(newRow));
    }

    getOrgNotificationsDynamoRow(notification, context: IEventContext) {
        const newRow: any = {
            ...notification,
            orgId: context.orgId,
            branchId: context.branchId,
            userId: context.userId,
            userName: context.userName,
            pk: `org#${context.orgId}#notifications`,
            sk: `orgLevel#${Date.now()}#${uuidv4()}`,
            lsi1: Date.now(),
            lsi2: context.categoryId,
            lsi3: context.action,
            lsi4: context.urgency
        };
        return JSON.parse(JSON.stringify(newRow));
    }

    getUserNotificationsParams({ userId, orgId, branchId }) {
        const pk = `org#${orgId}#branch#${branchId}#users#${userId}`;
        return {
            tableName: '',
            indexName: Dynamo_Index_Names.lsi5,
            isAscendingOrder: false,
            keyCondition: "pk = :v1 AND begins_with(#lsi5, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `notifications#${NotificationStatus.NOT_READ}` },
            },
            expressionAttributeNames: {
                "#lsi5": "lsi5",
            }
        };
    }

    getAllNotificationsParams({ userId, orgId, branchId }) {
        const pk = `org#${orgId}#branch#${branchId}#users#${userId}`;
        return {
            tableName: '',
            indexName: Dynamo_Index_Names.lsi5,
            isAscendingOrder: false,
            keyCondition: "pk = :v1 AND begins_with(#lsi5, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `notifications` },
            },
            expressionAttributeNames: {
                "#lsi5": "lsi5",
            }
        };
    }

    async markAllUserNotificationsToRead({ userId, orgId, branchId }) {
        const dynamoParams = await this.getUserNotificationsParams({ userId, orgId, branchId })
        const result = await this.dynamoDAL.getRowsFromDynamoDB(dynamoParams);
        const updatedNotifications = result.items.map((notification: any) => {
            return {
                ...notification,
                lsi5: `notifications#${NotificationStatus.READ}`,
                readOn: Date.now()
            };
        });
        await this.dynamoDAL.updateBatchOfRowsWithLimit(updatedNotifications);
    }

    async markUserNotificationsToReadUsingPKSkList(pkSkList) {
        const notifications = await this.dynamoDAL.getMultipleRowsUsingKeys(pkSkList);
        const updatedNotifications = notifications.items.map((notification: any) => {
            return {
                ...notification,
                lsi5: `notifications#${NotificationStatus.READ}`,
                readOn: Date.now()
            };
        });
        await this.dynamoDAL.putUpdatedRowsInDynamoDB(updatedNotifications);
    }

    getBranchNotificationsParams({ orgId, branchId }) {
        const pk = `org#${orgId}#branch#${branchId}#notifications`;
        return {
            tableName: '',
            isAscendingOrder: false,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `branchLevel` },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
    }

    getOrgNotificationsParams({ orgId }) {
        const pk = `org#${orgId}#notifications`;
        return {
            tableName: '',
            isAscendingOrder: false,
            totalCountNeeded: true,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `orgLevel` },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
    }

    async getRowsFromDynamo(params) {
        const result = await this.dynamoDAL.getRowsFromDynamoDB(params);
        return result;
    }

    getEventTrailParams({ orgId, branchId, entity, entityId }) {
        const pk = `org#${orgId}#branch#${branchId}#eventHistory`;
        const skPrefix = `events#${entity}#${entityId}`;
        return {
            tableName: '',
            isAscendingOrder: false,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: skPrefix },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
    }

    getSelfActivityParams({ orgId, branchId, userId }) {
        const pk = `org#${orgId}#branch#${branchId}#eventHistory`;
        return {
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S:userId },
            },
            expressionAttributeNames: {
                "#sk": "lsi4",
            },
            tableName: '',
            indexName: Dynamo_Index_Names.lsi4,
            isAscendingOrder: false,
        }
    }
}
