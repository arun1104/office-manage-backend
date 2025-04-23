import { Identifiers, MONGO_COLLECTION_NAMES } from "@constants";
import { FormatRedisKeys, DynamoDAL, convertToUnixTimestamp,convertUnixToEndOfDay } from "@utilities";
import { IDynamoResults } from "@interfaces";
import { ViewingLens, TaskFilters, Dynamo_Index_Names } from "@enums";
export class TaskUtilities {

    public static async getActiveConfiguredTaskList({ redisClient, mongoDal, branchId, orgId }) {
        const redisKey = FormatRedisKeys.activeTaskList({ branchId });
        const cachedResponse = await redisClient.get({
            tenantId: orgId,
            key: redisKey,
            isJSON: true
        });
        if (cachedResponse) {
            return cachedResponse;
        } else {
            let result = await mongoDal.mongoRead.getItemList({
                resource: MONGO_COLLECTION_NAMES.userInputs,
                queryObj: {
                    tenantId: orgId, branchId, isActive: true,
                    identifier: Identifiers.FINANCIAL_TASKS
                }
            })
            result = result.results.map(item => ({
                taskId: item.taskId,
                taskName: item.taskName,
                defaultAssignees: item.defaultAssignees, // Ensure these properties exist in your data
                defaultReviewers: item.defaultReviewers, // Ensure these properties exist in your data
                periodicity: item.periodicity,
                isPeriodicallyRepeating: item.isPeriodicallyRepeating
            }));
            redisClient.set({
                tenantId: orgId,
                key: redisKey,
                value: result,
                isJSON: true
            });
            return result;
        }
    }

    public static async getTaskConfiguration({ orgId, taskId, branchId, mongoDal }) {
        const taskConfiguration = await mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: MONGO_COLLECTION_NAMES.userInputs,
            filters: [{ tenantId: orgId, taskId, branchId }]
        });
        return taskConfiguration;
    }

    public static getTasksToBeCreatedParams({ orgId, dateInNumber }): any {
        const params = {
            keyCondition: "gsi1Pk = :v1",
            expressionAttributeValues: {
                ":v1": { S: `org#${orgId}#taskPeriods#taskCreationDateInNumber#${dateInNumber}` },
            },
            indexName: Dynamo_Index_Names.gsi1,
            isAscendingOrder: false,
        };
        return params;
    }
    
    public static getPkSKForTaskAssociation({ orgId, branchId, id }) {
        const params = {
            pk: `org#${orgId}#branch#${branchId}#primaryTasks`,
            sk: id
        };
        return params;
    }

    public static async getExistingTaskAssoc({ reqContext, dynamoClient }: {
        dynamoClient: DynamoDAL, reqContext: {
            orgId: string, branchId: string, id: string
        }
    }) {
        const params = TaskUtilities.getPkSKForTaskAssociation(reqContext);
        const dynamoParams = {
            pkValue: params.pk,
            tableName: '',
            sortKeyValues: {
                sk: { S: params.sk }
            }
        }
        const response = await dynamoClient.getSingleRowFromDynamoDB(dynamoParams);
        return response;
    }

    public static async getExistingTaskAssocList({ reqContext, dynamoClient }: {
        dynamoClient: DynamoDAL, reqContext: {
            orgId: string, branchId: string, id: string
        }
    }) {
        const dynamoQueryParams = {
            tableName: '',
            isAscendingOrder: false,
            totalCountNeeded: true,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: `org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks` },
                ":v2": { S: reqContext.id },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
        const response = await dynamoClient.getRowsFromDynamoDB(dynamoQueryParams);
        return response;
    }

    public static getNewTaskAssociationDynamoRow(input) {
        const newRow = {
            ...input,
            pk: `org#${input.orgId}#branch#${input.branchId}#primaryTasks`,
            sk: input.id,
            lsi1: Date.now(),
            lsi2: `${input.financialYear}#${input.periodRange}`,
            lsi3: `dueDate#${input.dueDate}`,
            lsi4: `internalDueDate#${input.internalDueDate}`,
            lsi5: `status#${input.statusId}#${Date.now().toString()}`,
            gsi1Pk: `client#${input.clientId}#primaryTasks`,
            gsi1Sk: Date.now(),
            gsi2Pk: `org#${input.orgId}#branch#${input.branchId}#primaryTasks`,
            gsi2Sk: input.taskName,
            messageCount: 0,
        };
        return newRow;
    }

    public static getSKForSort(input) {
        switch (input.paramName) {
            case 'dueDate':
                return { key: 'lsi3', beginsWith: 'dueDate' }
            case 'internalDueDate':
                return { key: 'lsi4', beginsWith: 'internalDueDate' }
            case 'status':
                return { key: 'lsi5', beginsWith: 'status' }

        }
    }

    public static getPkSkForAssignee({ reqContext, assignee }) {
        return {
            pk: `assignees#org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks`,
            sk: `${assignee.userId}#task#${reqContext.id}`,
        }
    }

    public static getPkSkForReviewer({ reqContext, reviewer }) {
        return {
            pk: `reviewers#org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks`,
            sk: `${reviewer.userId}#task#${reqContext.id}`,
        }
    }

    public static getNewTaskAssociationForAssigneeDynamoRow(input, assignee: { name: string, userId: string }) {
        const newRow = {
            ...input,
            pk: `assignees#org#${input.orgId}#branch#${input.branchId}#primaryTasks`,
            sk: `${assignee.userId}#task#${input.id}`,
            role: 'Assignee',
            assigneeName: assignee.name,
            assigneeId: assignee.userId,
            lsi1: Date.now(),
            lsi2: `${input.financialYear}#${input.periodRange}`,
            lsi3: `dueDate#${input.dueDate}`,
            lsi4: `internalDueDate#${input.internalDueDate}`,
            lsi5: `status#${input.statusId}#${Date.now().toString()}`,
            gsi1Pk: `users#org#${input.orgId}#branch#${input.branchId}#primaryTasks#${input.id}`,
            gsi1Sk: Date.now(),
            gsi2Pk: `assignees#org#${input.orgId}#primaryTasks#${assignee.userId}`,
            gsi2Sk: input.taskName,
            messageCount: 0,
        };
        return newRow;
    }

    public static getNewTaskAssociationForReviewersDynamoRow(input, reviewer: { name: string, userId: string }) {
        const newRow = {
            ...input,
            role: 'Reviewer',
            pk: `reviewers#org#${input.orgId}#branch#${input.branchId}#primaryTasks`,
            sk: `${reviewer.userId}#task#${input.id}`,
            reviewerName: reviewer.name,
            reviewerId: reviewer.userId,
            lsi1: Date.now(),
            lsi2: `${input.financialYear}#${input.periodRange}`,
            lsi3: `dueDate#${input.dueDate}`,
            lsi4: `internalDueDate#${input.internalDueDate}`,
            lsi5: `status#${input.statusId}#${Date.now().toString()}`,
            gsi1Pk: `users#org#${input.orgId}#branch#${input.branchId}#primaryTasks#${input.id}`,
            gsi1Sk: Date.now(),
            gsi2Pk: `reviewers#org#${input.orgId}#primaryTasks#${reviewer.userId}`,
            gsi2Sk: input.taskName,
            messageCount: 0,
        };
        return newRow;
    }

    public static async getTaskAssocList({ reqContext, dynamoClient, viewingLens, sortCondition, filter }: {
        dynamoClient: DynamoDAL, reqContext: {
            orgId: string, branchId: string, id: string
        }, viewingLens: ViewingLens, sortCondition: any, filter: any
    }) {
        let dynamoQueryParams, response: IDynamoResults;
        switch (viewingLens) {
            case ViewingLens.ALL_TASKS_OF_BRANCH:
                dynamoQueryParams = TaskUtilities.getDynamoParamsForAllTasksOfBranch({ reqContext, sortCondition, filter })
                response = await dynamoClient.getRowsWithFilterFromDynamoDB(dynamoQueryParams);
                break;
            case ViewingLens.ASSIGNEE:
                dynamoQueryParams = TaskUtilities.getDynamoParamsForAllTasksOfAssigneeInBranch({ reqContext, filter })
                response = await dynamoClient.getRowsWithFilterFromDynamoDB(dynamoQueryParams);
                response.items.sort((a: any, b: any) => b.lsi1 - a.lsi1);
                break;
            case ViewingLens.REVIEWERS:
                dynamoQueryParams = TaskUtilities.getDynamoParamsForAllTasksOfReviewerInBranch({ reqContext, filter })
                response = await dynamoClient.getRowsWithFilterFromDynamoDB(dynamoQueryParams);
                response.items.sort((a: any, b: any) => b.lsi1 - a.lsi1);
                break;
        }
        return response;
    }

    public static getDynamoParamsForAllTasksOfBranch({ reqContext, sortCondition, filter }) {
        const pk = `org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks`;
        if (!sortCondition && !filter) {
            return {
                tableName: '',
                indexName: Dynamo_Index_Names.lsi1,
                isAscendingOrder: false,
                totalCountNeeded: true,
                keyCondition: "pk = :v1",
                expressionAttributeValues: {
                    ":v1": { S: pk }
                },
            };
        }
        if (filter) {
            return TaskUtilities.getFilterDynamoParamsForAllTasks({
                pk,
                subString: filter.subString,
                paramName: filter.paramName,
                ...reqContext,
                from: filter.from,
                to: filter.to,
            });
        }
        if (sortCondition) {
            const skParams = this.getSKForSort(sortCondition);
            return TaskUtilities.sortDynamoParamsForAllTasks({
                pk,
                ...skParams,
                ...sortCondition
            });
        }
    }

    public static getDynamoParamsForAllTasksOfAssigneeInBranch({ reqContext, filter }) {
        const pk = `assignees#org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks`;
        return {
            tableName: '',
            isAscendingOrder: false,
            totalCountNeeded: true,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `${filter.userId}#task` },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
    }

    public static getDynamoParamsForAllTasksOfReviewerInBranch({ reqContext, filter }) {
        const pk = `reviewers#org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks`;
        return {
            tableName: '',
            isAscendingOrder: false,
            totalCountNeeded: true,
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `${filter.userId}#task` },
            },
            expressionAttributeNames: {
                "#sk": "sk",
            },
        };
    }

    static getFilterDynamoParamsForAllTasks({ paramName, subString, pk, orgId, branchId, from, to }): any {
        let params = {};
        switch (paramName) {
            case TaskFilters.TaskId:
                params = {
                    keyCondition: "#pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":v2": { S: subString }
                    },
                    expressionAttributeNames: {
                        "#pk": "pk",
                        "#sk": "sk"
                    },
                    tableName: '',
                    isAscendingOrder: false
                };
                break;
            case TaskFilters.StatusId:
                params = {
                    keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":v2": { S: `status#${subString}` },
                    },
                    expressionAttributeNames: {
                        "#sk": "lsi5",
                    },
                    tableName: '',
                    indexName: Dynamo_Index_Names.lsi5,
                    isAscendingOrder: false,
                };
                break;
            case TaskFilters.DueDate:
                params = {
                    keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":v2": { S: `dueDate#${subString}` },
                    },
                    expressionAttributeNames: {
                        "#sk": "lsi3",
                    },
                    tableName: '',
                    indexName: Dynamo_Index_Names.lsi3,
                    isAscendingOrder: false,
                };
                break;
            case TaskFilters.InternalDueDate:
                params = {
                    keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":v2": { S: `internalDueDate#${subString}` },
                    },
                    expressionAttributeNames: {
                        "#sk": "lsi4",
                    },
                    tableName: '',
                    indexName: Dynamo_Index_Names.lsi4,
                    isAscendingOrder: false,
                };
                break;
            case TaskFilters.ClientId:
                params = {
                    keyCondition: "#pk = :v1",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":v2": { S: subString },
                    },
                    expressionAttributeNames: {
                        "#pk": "pk",
                        "#clientId": "clientId"
                    },
                    tableName: '',
                    filterExpression: "#clientId = :v2",
                    isAscendingOrder: false,
                };
                break;
            case TaskFilters.TaskSeqNumber:
                    params = {
                        keyCondition: "#pk = :v1",
                        expressionAttributeValues: {
                            ":v1": { S: pk },
                            ":v2": { S: subString }
                        },
                        expressionAttributeNames: {
                            "#pk": "pk",
                            "#taskSeqNumber": "taskSeqNumber"
                        },
                        tableName: '',
                        filterExpression: "#taskSeqNumber = :v2",
                        isAscendingOrder: false,
                    };
                    break;
            case TaskFilters.AssigneeId:
                params = {
                    tableName: '',
                    isAscendingOrder: false,
                    totalCountNeeded: true,
                    keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: `assignees#org#${orgId}#branch#${branchId}#primaryTasks` },
                        ":v2": { S: `${subString}` },
                    },
                    expressionAttributeNames: {
                        "#sk": "sk",
                    },
                }
                break;
            case TaskFilters.ReviewerId:
                params = {
                    tableName: '',
                    isAscendingOrder: false,
                    totalCountNeeded: true,
                    keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
                    expressionAttributeValues: {
                        ":v1": { S: `reviewers#org#${orgId}#branch#${branchId}#primaryTasks` },
                        ":v2": { S: `${subString}` },
                    },
                    expressionAttributeNames: {
                        "#sk": "sk",
                    },
                }
                break;
            case TaskFilters.DueDateRange:
                params = {
                    keyCondition: "pk = :v1 AND lsi3 between :from and :to",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":from": { S: `dueDate#${from}` },
                        ":to": { S: `dueDate#${to}` },
                    },
                    tableName: '',
                    indexName: Dynamo_Index_Names.lsi3,
                    isAscendingOrder: false,
                };
                break;
            case TaskFilters.InternalDueDateRange:
                params = {
                    keyCondition: "pk = :v1 AND lsi4 between :from and :to",
                    expressionAttributeValues: {
                        ":v1": { S: pk },
                        ":from": { S: `internalDueDate#${from}` },
                        ":to": { S: `internalDueDate#${to}` },
                    },
                    tableName: '',
                    indexName: Dynamo_Index_Names.lsi4,
                    isAscendingOrder: false,
                };
                break;
                case TaskFilters.TaskCreationDateRange:
                    params = {
                        keyCondition: "pk = :v1 AND lsi1 between :from and :to",
                        expressionAttributeValues: {
                            ":v1": { S: pk },
                            ":from": { N: `${convertToUnixTimestamp(from)}` },
                            ":to": { N: `${convertUnixToEndOfDay(to)}` },
                        },
                        tableName: '',
                        indexName: Dynamo_Index_Names.lsi1,
                        isAscendingOrder: false,
                    };
                break;
                case TaskFilters.GlobalSearchKey:
                    params = {
                        keyCondition: "#pk = :v1",
                        expressionAttributeValues: {
                            ":v1": { S: pk },
                            ":v2": { S: subString.toLowerCase() }
                        },
                        expressionAttributeNames: {
                            "#pk": "pk",
                            "#globalSearchKey": "globalSearchKey"
                        },
                        tableName: '',
                        filterExpression: "contains(#globalSearchKey, :v2)",
                        isAscendingOrder: false,
                    };
                    break;
            default:
                break;
        }

        return params;
    }

    static sortDynamoParamsForAllTasks({ pk, key, beginsWith, LOWEST_TO_HIGHEST }): any {
        const params = {
            keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
                ":v1": { S: pk },
                ":v2": { S: `${beginsWith}` },
            },
            expressionAttributeNames: {
                "#sk": key,
            },
            tableName: '',
            indexName: Dynamo_Index_Names[key],
            isAscendingOrder: LOWEST_TO_HIGHEST,
        };
        return params;
    }

    public static async getAssigneeReviewerRows({ reqContext, dynamoClient }: {
        dynamoClient: DynamoDAL, reqContext: {
            orgId: string, branchId: string, id: string
        }
    }) {
        const dynamoQueryParams = {
            tableName: '',
            indexName: Dynamo_Index_Names.gsi1,
            isAscendingOrder: false,
            totalCountNeeded: true,
            keyCondition: "gsi1Pk = :v1",
            expressionAttributeValues: {
                ":v1": { S: `users#org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks#${reqContext.id}` },
            },
        };
        const response = await dynamoClient.getRowsFromDynamoDB(dynamoQueryParams);
        return response.items;
    }

}
