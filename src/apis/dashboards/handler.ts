import { HTTP_RESOURCES, RESPOSE_CODES, MONGO_COLLECTION_NAMES } from "@constants";
import { DASHBOARD_ACTIONS, DASHBOARD_RESOURCES } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { MongoDBClient, MATH_OPERATIONS, RedisClient, DateAndTime } from "@n-oms/multi-tenant-shared";
import { DynamoDAL, convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD } from "@utilities";
import { z } from 'zod';

type ReqContext = {
    orgId: string;
    branchId?: string;
    rangeQueryParams?: {
        attributeName: string;
        from: any;
        to: any;
    };
    resourceDashboard: {
        resourceType: string;
        resourceId: string;
    };
};

export class DashboardsHandler implements IHandler {
    operation: string;
    mongoDal: MongoDBClient;
    operationId: string;
    resource: string;
    validations: any[];
    dynamoDAL: DynamoDAL;
    redisClient: RedisClient;
    dateAndTime: DateAndTime;
    constructor() {
        this.operation = HTTP_RESOURCES.DASHBOARDS.operationIdList.dashboards.operationType;
        this.operationId = HTTP_RESOURCES.DASHBOARDS.operationIdList.dashboards.name;
        this.resource = HTTP_RESOURCES.DASHBOARDS.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            action: z.nativeEnum(DASHBOARD_ACTIONS),
            regenerate: z.boolean(),
            branchId: z.string(),
            resourceDashboard: z.object({
                resourceType: z.nativeEnum(DASHBOARD_RESOURCES),
                resourceId: z.string(),
            }).optional(),
            sortParam: z.object({}).optional(),
            rangeQueryParams: z.object({
                attributeType: z.string().optional(),
                attributeName: z.string(),
                timezone: z.string().optional(),
                from: z.any(),
                to: z.any(),
                castToInteger: z.boolean().optional()
            }).optional(),
        })];
        this.mongoDal = new MongoDBClient();
        this.dynamoDAL = new DynamoDAL();
        this.redisClient = new RedisClient();
        this.dateAndTime = new DateAndTime();
    }

    async handler(req: IReqInfo, res: any) {
        const { action } = req.body;

        if (req.body.rangeQueryParams && req.body.rangeQueryParams.attributeType === 'date') {
            req.body.rangeQueryParams.from = convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD(req.body.rangeQueryParams.from);
            req.body.rangeQueryParams.to = convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD(req.body.rangeQueryParams.to);
            const rangeInUTC = this.dateAndTime.convertRangeToUTC({ ...req.body.rangeQueryParams }, req.body.timezone);
            req.body.rangeQueryParams.from = rangeInUTC.startDate;
            req.body.rangeQueryParams.to = rangeInUTC.endDate;
        }

        const reqContext: ReqContext = {
            orgId: req.authorizationInfo.orgId,
            branchId: req.body.branchId,
            rangeQueryParams: req.body.rangeQueryParams,
            resourceDashboard: {
                resourceType: req.body?.resourceDashboard?.resourceType,
                resourceId: req.body?.resourceDashboard?.resourceId
            }
        };
      
        try {
            const result = await this.getDashboardData({ action, reqContext, req });
            res.status(RESPOSE_CODES.READ).send(result);
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(500).send({
                message: 'Unknown error'
            });
        }
    }

    async getDashboardData({ action, reqContext, req }) {
        let result;
        switch (action) {
            case DASHBOARD_ACTIONS.GET_CA_PRIMARY_TASK_DASHBOARD:
                if (!req.body.regenerate) {
                    result = await this.redisClient.get({ tenantId: reqContext.orgId, key: DASHBOARD_ACTIONS.GET_CA_PRIMARY_TASK_DASHBOARD, isJSON: true });
                    if (result) {
                        return result;
                    }
                }
                result = await this.getCAPrimaryDashboardData(reqContext);
                await this.redisClient.set({ tenantId: reqContext.orgId, key: DASHBOARD_ACTIONS.GET_CA_PRIMARY_TASK_DASHBOARD, isJSON: true, value: result, seconds: 86400 });
                break;
            case DASHBOARD_ACTIONS.GET_CA_COMPLETED_TASK_DASHBOARD:
                if (!req.body.regenerate) {
                    result = await this.redisClient.get({
                        tenantId: reqContext.orgId,
                        key: DASHBOARD_ACTIONS.GET_CA_COMPLETED_TASK_DASHBOARD,
                        isJSON: true
                    });
                    if (result) {
                        return result;
                    }
                }
                result = await this.getCACompletedDashboardData(reqContext);
                await this.redisClient.set({
                    tenantId: reqContext.orgId,
                    key: DASHBOARD_ACTIONS.GET_CA_COMPLETED_TASK_DASHBOARD,
                    isJSON: true,
                    value: result,
                    seconds: 86400
                });
                break;
            case DASHBOARD_ACTIONS.GET_VENDOR_DASHBOARD:
                result = await this.getVendorCompletedDashboardData(reqContext);
                break;
            case DASHBOARD_ACTIONS.GET_INVOICE_DASHBOARD:
                if (!req.body.regenerate) {
                    result = await this.redisClient.get({
                        tenantId: reqContext.orgId,
                        key: DASHBOARD_ACTIONS.GET_INVOICE_DASHBOARD,
                        isJSON: true
                    });
                    if (result) {
                        return result;
                    }
                }
                result = await this.getInvoiceDashboardData(reqContext);
                await this.redisClient.set({
                    tenantId: reqContext.orgId,
                    key: DASHBOARD_ACTIONS.GET_INVOICE_DASHBOARD,
                    isJSON: true,
                    value: result,
                    seconds: 86400
                });
                break;
            case DASHBOARD_ACTIONS.GET_PETROL_PUMP_DASHBOARD:
                result = await this.getPetrolPumpDashboardData(reqContext);
                break;
            case DASHBOARD_ACTIONS.GET_CA_PER_RESOURCE_DASHBOARD:
                result = await this.getPerResourceDashboardData(reqContext);
                break;
        }
        return result;
    }

    async getPerResourceDashboardData(reqContext: ReqContext) {
        let result;
        switch (reqContext.resourceDashboard.resourceType) {
            case DASHBOARD_RESOURCES.CA_USER:
                result = await this.getCAUserDashboardData({
                    tenantId: reqContext.orgId,
                    resourceId: reqContext.resourceDashboard.resourceId,
                    rangeQueryParams: reqContext.rangeQueryParams
                })
                break;

            case DASHBOARD_RESOURCES.CA_CLIENT:
                result = await this.getCAClientDashboardData({
                    tenantId: reqContext.orgId,
                    resourceId: reqContext.resourceDashboard.resourceId,
                    rangeQueryParams: reqContext.rangeQueryParams
                })
                break;
            case DASHBOARD_RESOURCES.CA_TASK:
                result = await this.getCATaskDashboardData({
                    tenantId: reqContext.orgId,
                    resourceId: reqContext.resourceDashboard.resourceId,
                    rangeQueryParams: reqContext.rangeQueryParams
                })
                break;
        }
        return result;
    }

    async getCAUserDashboardData({ tenantId, resourceId, rangeQueryParams }) {
        const result = {} as any;
        result.revenueByAssignee = await this.mongoDal.mongoRead.getAssigneeRevenueReport({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId }],
            assigneeId: resourceId,
            rangeQueryParams
        });
        result.assigneeCompletedClientReport = await this.mongoDal.mongoRead.getAssigneeCompletedTaskReport({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId }],
            assigneeId: resourceId,
            rangeQueryParams
        });
        result.assigneeCompletedTaskNameReport = await this.mongoDal.mongoRead.getAssigneeTaskNameReport({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId }],
            assigneeId: resourceId,
            rangeQueryParams
        });
        return result;
    }

    async getCATaskDashboardData({ tenantId, resourceId, rangeQueryParams }) {
        const result = {} as any;
        result.completedTaskReport = await this.mongoDal.mongoRead.getCompletedTaskReportOfaTask({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId }],
            taskId: resourceId, rangeQueryParams
        })
        result.taskInvoiceReport = await this.mongoDal.mongoRead.getInvoiceReportOfParticularId({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId }],
            particularId: resourceId,
            rangeQueryParams
        });
        result.taskInvoiceReportByAssignee = await this.mongoDal.mongoRead.getInvoiceReportOfParticularIdGroupByAssignee({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId }],
            particularId: resourceId,
            rangeQueryParams
        });
        return result;
    }

    async getCAClientDashboardData({ tenantId, resourceId, rangeQueryParams }) {
        const result = {} as any;
        result.clientAssigneeReport = await this.mongoDal.mongoRead.getClientAssigneeTaskReport({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId, entity: "financialTasks" }],
            clientId: resourceId, rangeQueryParams
        })
        result.clientTaskReport = await this.mongoDal.mongoRead.getClientTaskReport({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId }],
            clientId: resourceId, rangeQueryParams
        })
        result.clientInvoiceReport = await this.mongoDal.mongoRead.getClientInvoiceReport({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId }],
            clientId: resourceId,
            rangeQueryParams
        });
        return result;
    }

    getDateReport(data, paramName) {
        const generatedDates = this.generateNext14Dates();
        const generatedPreviousDates = this.generatePrior14Dates();
        const dateReport: any = this.groupByFunction(data, paramName, true);
        delete dateReport["totalActiveCount"];
        const entries = Object.entries(dateReport);
        const finalDateReport = {};
        for (const [key, value] of entries) {
            if (generatedDates[key]) {
                finalDateReport[generatedDates[key]] = value;
            } else if (generatedPreviousDates[key]) {
                finalDateReport[generatedPreviousDates[key]] = value;
            }
        }
        return finalDateReport;
    }

    generateNext14Dates() {
        const currentDate = new Date();
        const result = {};
        for (let i = 0; i < 14; i++) {
            const nextDate = new Date();
            nextDate.setDate(currentDate.getDate() + i);
            const year = nextDate.getFullYear();
            const month = String(nextDate.getMonth() + 1).padStart(2, "0");
            const day = String(nextDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}${month}${day}`;
            let representation;
            if (i == 0) {
                representation = "Today";
            } else if (i == 1) {
                representation = "Tomorrow";
            } else if (i == 2) {
                representation = "Day after Tomorrow";
            } else {
                representation = `Within ${i + 1} days`;
            }
            result[formattedDate] = representation;
        }
        return result;
    }

    generatePrior14Dates() {
        const currentDate = new Date();
        const result = {};
        for (let i = 1; i < 14; i++) {
            const nextDate = new Date();
            nextDate.setDate(currentDate.getDate() - i);
            const year = nextDate.getFullYear();
            const month = String(nextDate.getMonth() + 1).padStart(2, "0");
            const day = String(nextDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}${month}${day}`;
            let representation;
            if (i == 1) {
                representation = "Yesterday";
            } else if (i == 2) {
                representation = "Day Before Yesterday";
            } else {
                representation = `Delayed by ${i} days`;
            }
            result[formattedDate] = representation;
        }
        return result;
    }

    userCounterByRole(data: any[], field: 'reviewers' | 'assignees'): { userId: string; taskCount: number }[] {
        const userCountMap: { [key: string]: number } = {};
        data.forEach(item => {
            if (item[field]) {
                item[field].forEach((user: { userId: string }) => {
                    if (userCountMap[user.userId]) {
                        userCountMap[user.userId]++;
                    } else {
                        userCountMap[user.userId] = 1;
                    }
                });
            }
        });
        return Object.keys(userCountMap).map(userId => ({
            userId,
            taskCount: userCountMap[userId]
        }));
    }

    groupByFunction(data, paramName, dontSlice?) {
        let groupedData = data.reduce((result, obj) => {
            const status = obj[paramName];
            if (!result[status]) {
                result[status] = { totalCount: 0, tasks: [] };
            }
            result[status].tasks.push(obj);
            result[status].totalCount++;
            return result;
        }, {});
        let reportArray = Object.entries(groupedData);
        reportArray.sort((a: any, b: any) => b[1].totalCount - a[1].totalCount);
        const totalCount = reportArray.length;
        if (!dontSlice) {
            reportArray = reportArray.slice(0, 50);
        }
        groupedData = Object.fromEntries(reportArray);
        groupedData.totalActiveCount = totalCount;
        return groupedData;
    }

    async getCAPrimaryDashboardData(reqContext) {
        const totalPrimaryTasks = await this.getTotalPrimaryTaskS(reqContext);
        const internalDueDateCards = this.getDateReport(totalPrimaryTasks.items, "internalDueDate");
        const dueDateCards = this.getDateReport(totalPrimaryTasks.items, "dueDate");
        const uniqueDataColumnValues = this.getUniqueColumnValues(totalPrimaryTasks.items);
        const dueDateDistribution = this.groupByFunction(totalPrimaryTasks.items, 'dueDate');
        const internalDueDateDistribution = this.groupByFunction(totalPrimaryTasks.items, 'internalDueDate');
        const creationByDistribution = this.groupByFunction(totalPrimaryTasks.items, 'createdByName');
        const taskNameDistribution = this.groupByFunction(totalPrimaryTasks.items, 'taskName');
        const statusDistribution = this.groupByFunction(totalPrimaryTasks.items, 'status');
        const fyDistribution = this.groupByFunction(totalPrimaryTasks.items, 'financialYear');
        const assigneeDistribution = this.userCounterByRole(totalPrimaryTasks.items, 'assignees');
        const clientDistribution = uniqueDataColumnValues?.clientDetails?.reduce((acc, client) => {
            acc[client.clientId] = (acc[client.clientId] || 0) + 1;
            return acc;
        }, {});
        const reviewerDistribution = this.userCounterByRole(totalPrimaryTasks.items, 'reviewers');
        const totalClientCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.clients, filter: { tenantId: reqContext.orgId, clientType: "financial_client" }
        })
        return {
            primaryTaskCount: totalPrimaryTasks.totalCount,
            activeAssignees: assigneeDistribution.length,
            activeReviewers: reviewerDistribution.length,
            activeClients: clientDistribution ? Object.keys(clientDistribution).length : 0,
            totalClientCount,
            taskNameDistribution,
            reviewerDistribution,
            assigneeDistribution,
            fyDistribution,
            creationByDistribution,
            clientDistribution: clientDistribution ? clientDistribution : {},
            dueDateDistribution,
            internalDueDateDistribution,
            internalDueDateCards,
            dueDateCards,
            statusDistribution
        };
    }

    async getInvoiceDashboardData(reqContext) {
        const totalCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.invoices, filter: { tenantId: reqContext.orgId },
            rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByMonthCreatedAt = await this.mongoDal.mongoRead.getMonthBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.invoices,
            months: 12, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByDateCreatedAt = await this.mongoDal.mongoRead.getDateBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.invoices,
            days: 30, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByStatus = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'status',
            operationType: MATH_OPERATIONS.GROUP_COUNT, groupByAttributeName: 'statusId'
        })

        const totalAmountPaidByMonths = await this.mongoDal.mongoRead.getMonthBasedGroupingAndSum({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filter: { tenantId: reqContext.orgId }, dateAttributeName: 'createdAt',
            sumAttributeName: 'totalAmountPaid'
        })

        const totalAmountPayableByMonths = await this.mongoDal.mongoRead.getMonthBasedGroupingAndSum({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filter: { tenantId: reqContext.orgId }, dateAttributeName: 'createdAt',
            sumAttributeName: 'invoiceInfo.calculations.totalPayable'
        })

        const totalAmountPaid = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'totalAmountPaid',
            operationType: MATH_OPERATIONS.SUM, rangeQueryParams: reqContext.rangeQueryParams
        })

        const totalAmountPayable = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'invoiceInfo.calculations.totalPayable',
            operationType: MATH_OPERATIONS.SUM, rangeQueryParams: reqContext.rangeQueryParams
        })

        const amountPayableByTaskCategoryId = await this.mongoDal.mongoRead.groupByArrayFieldAndSumOfStringAttribute({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }], arrayField: "invoiceInfo.invoiceDetails",
            groupByKey: "invoiceInfo.invoiceDetails.particularId",
            sumField: "invoiceInfo.invoiceDetails.amount",
            isSumFieldString: true,
            isArray: true,
            rangeQueryParams: reqContext.rangeQueryParams
        })

        const amountPayableByTaskPeriod = await this.mongoDal.mongoRead.groupByArrayFieldAndSumOfStringAttribute({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }], arrayField: "invoiceInfo.invoiceDetails",
            groupByKey: "invoiceInfo.invoiceDetails.particulars",
            sumField: "invoiceInfo.invoiceDetails.amount",
            isSumFieldString: true,
            isArray: true,
            rangeQueryParams: reqContext.rangeQueryParams
        })

        const groupAssigneeByRevenue = await this.mongoDal.mongoRead.groupAssigneeByRevenue({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }],
            rangeQueryParams: reqContext.rangeQueryParams
        })

        const groupAssigneeByParticulars = await this.mongoDal.mongoRead.groupAssigneeByParticulars({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }],
            rangeQueryParams: reqContext.rangeQueryParams
        })

        const groupAssigneeByParticularId = await this.mongoDal.mongoRead.groupAssigneeByParticularId({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }],
            rangeQueryParams: reqContext.rangeQueryParams
        })

        //groupAssigneeByParticularId = this.transformAssigneeByParticularDataToTree(groupAssigneeByParticularId);
        const groupClientByInvoiceTotalPayable = await this.mongoDal.mongoRead.groupClientByInvoiceTotalPayable({
            resource: MONGO_COLLECTION_NAMES.invoices,
            filters: [{ tenantId: reqContext.orgId }],
            rangeQueryParams: reqContext.rangeQueryParams
        })
        
        return {
            totalCount,
            groupByMonthCreatedAt,
            groupByDateCreatedAt,
            groupByStatus,
            totalAmountPaidByMonths,
            totalAmountPayableByMonths,
            totalAmountPaid,
            totalAmountPayable,
            amountPayableByTaskCategoryId,
            amountPayableByTaskPeriod,
            groupAssigneeByRevenue,
            groupAssigneeByParticulars,
            groupAssigneeByParticularId,
            groupClientByInvoiceTotalPayable
        };
    }

     transformAssigneeByParticularDataToTree(inputData) {
        const rootCategory = {
            title: "Assignees",
            description: "Assignees Task Invoice Contribution",
            key: "rootCategory",
            type: "category",
            configuration: []
        };
        const assigneeMap = {};
        inputData.forEach(entry => {
            const { assignee, userId, particularIds } = entry;
            const assigneeKey = `assignee-${userId}`;
            if (!assigneeMap[assigneeKey]) {
                assigneeMap[assigneeKey] = {
                    parentId: "rootCategory",
                    key: assigneeKey,
                    email: userId,
                    title: assignee,
                    description: "User",
                    type: "category",
                    createdOn: new Date().toISOString(),
                    icon: {
                        type: {},
                        key: null,
                        ref: null,
                        props: {
                            style: {
                                color: "Highlight"
                            }
                        },
                        _owner: null
                    },
                    children: []
                };
                rootCategory.configuration.push(assigneeMap[assigneeKey]);
            }

            particularIds.forEach(({ particularId, particulars, count }) => {
                particulars.forEach(particular => {
                    assigneeMap[assigneeKey].children.push({
                        parentId: assigneeKey,
                        key: `${assigneeKey}-${particularId}`,
                        title: particular,
                        description: `Task Count: ${count}`,
                        type: "task",
                        createdOn: new Date().toISOString(),
                        icon: {
                            type: {},
                            key: null,
                            ref: null,
                            props: {
                                style: {
                                    color: "Highlight"
                                }
                            },
                            _owner: null
                        }
                    });
                });
            });
        });
        return [rootCategory];
    }
    
    async getPetrolPumpDashboardData(reqContext) {
        const totalCustomerCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.orgEntities, filter: { tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpCustomers }
        })
        const totalBillsCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.orgEntities, filter: { tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills }
        })

        const totalQuantityPaidAsIncentive = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills, "status": "INCENTIVE_PAID" }], attributeName: 'quantity',
            operationType: MATH_OPERATIONS.SUM
        })

        const totalQuantityNotPaid = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills, "status": "INCENTIVE_NOT_PAID" }], attributeName: 'quantity',
            operationType: MATH_OPERATIONS.SUM
        })

        const totalAmountPaidAsIncentive = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: reqContext.orgId, "itemName": "petrolPumpCustomerIncentive" }], attributeName: 'amount',
            operationType: MATH_OPERATIONS.SUM
        })

        const customerWiseTopQuantity = await this.mongoDal.mongoRead.performSummationAndSort({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: { tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills },
            attributeName: "quantity",
            groupByAttributeName: "name",
            sortParamName: "totalAmount",
            limit: 50
        })

        const customerWiseFuelWiseTopQuantity = await this.mongoDal.mongoRead.performSummationOnMultipleGroupAttributesAndSort({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: { tenantId: reqContext.orgId, itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills },
            attributeName: "quantity",
            groupByAttributes: ["name", "commodity"],
            sortParamName: "totalAmount",
            limit: 50
        })

        const customerWiseIncentiveReceived = await this.mongoDal.mongoRead.performSummationAndSort({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: { tenantId: reqContext.orgId, "itemName": "petrolPumpCustomerIncentive" },
            attributeName: "amount",
            groupByAttributeName: "name",
            sortParamName: "totalAmount",
            limit: 50
        })

        const customerWiseIncentiveNotReceived = await this.mongoDal.mongoRead.performSummationAndSort({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: { tenantId: reqContext.orgId, "status": "INCENTIVE_NOT_PAID", itemName: HTTP_RESOURCES.NEW_ENTITY.entityList.org_entities.rules.entitiesMapForCountPrefix.petrolPumpBills },
            attributeName: "quantity",
            groupByAttributeName: "name",
            sortParamName: "totalAmount",
            limit: 50
        })

        return {
            totalCustomerCount,
            totalBillsCount,
            totalAmountPaidAsIncentive,
            totalQuantityPaidAsIncentive,
            totalQuantityNotPaid,
            customerWiseTopQuantity,
            customerWiseFuelWiseTopQuantity,
            customerWiseIncentiveReceived,
            customerWiseIncentiveNotReceived
        };
    }

    async getVendorCompletedDashboardData(reqContext) {
        const totalCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.vendors, filter: { tenantId: reqContext.orgId }
        })
        const groupByMonthCreatedAt = await this.mongoDal.mongoRead.getMonthBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.vendors,
            months: 12, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByDateCreatedAt = await this.mongoDal.mongoRead.getDateBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.vendors,
            days: 30, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByOnBoardedBy = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.vendors,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'createdByName',
            operationType: MATH_OPERATIONS.GROUP_COUNT, groupByAttributeName: 'createdByEmail'
        })

        return { totalCount, groupByMonthCreatedAt, groupByDateCreatedAt, groupByOnBoardedBy };
    }

    async getCACompletedDashboardData(reqContext) {
        const totalCount = await this.mongoDal.mongoRead.countEntities({
            resource: MONGO_COLLECTION_NAMES.genericTasks, filter: { tenantId: reqContext.orgId },
            rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByMonthCreatedAt = await this.mongoDal.mongoRead.getMonthBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            months: 12, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByDateCreatedAt = await this.mongoDal.mongoRead.getDateBasedGrouping({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            days: 30, dateAttributeName: 'createdAt', filter: { tenantId: reqContext.orgId }
        })
        const groupByStatus = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'status',
            operationType: MATH_OPERATIONS.GROUP_COUNT, groupByAttributeName: 'statusId',
            rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByClient = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'clientDetails.name',
            operationType: MATH_OPERATIONS.GROUP_COUNT_SORT_TOP, groupByAttributeName: 'clientDetails.clientId',
            top: 30, rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByInvoiceStatus = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'latestInvoiceStatus',
            operationType: MATH_OPERATIONS.GROUP_COUNT, groupByAttributeName: 'latestInvoiceStatusId',
            rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByAssignee = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'assignees.name',
            groupByAttributeName: "assignees.userId",
            operationType: MATH_OPERATIONS.GROUP_COUNT_SORT_TOP, isArray: true, arrayAttributeName: 'assignees',
            top: 30, rangeQueryParams: reqContext.rangeQueryParams
        })
        const groupByReviewers = await this.mongoDal.mongoRead.performMathematicalAggregation({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }], attributeName: 'reviewers.name',
            groupByAttributeName: "reviewers.userId",
            operationType: MATH_OPERATIONS.GROUP_COUNT_SORT_TOP, isArray: true, arrayAttributeName: 'reviewers',
            rangeQueryParams: reqContext.rangeQueryParams
        })
        // const taskPeriodReport = await this.mongoDal.mongoRead.getCompletedTaskPeriodReportWithClientAndAssignee({
        //     resource: MONGO_COLLECTION_NAMES.genericTasks,
        //     filters: [{ tenantId: reqContext.orgId }],
        //     rangeQueryParams: reqContext.rangeQueryParams
        // });

        const taskPeriodCount = await this.mongoDal.mongoRead.entityCountReport({
            resource: MONGO_COLLECTION_NAMES.genericTasks,
            filters: [{ tenantId: reqContext.orgId }],
            concatAttribute1: 'taskName',
            concatAttribute2: 'periodString',
            rangeQueryParams: reqContext.rangeQueryParams
        });

        return {
            totalCount,
            groupByMonthCreatedAt,
            groupByDateCreatedAt,
            groupByStatus,
            groupByClient,
            activeClientCount: groupByClient.length,
            groupByInvoiceStatus,
            groupByAssignee,
            groupByReviewers,
            taskPeriodCount
        };
    }

    async getTotalPrimaryTaskS(reqContext) {
        const params: any = {
            tableName: '',
            keyCondition: "#pk = :pk",
            expressionAttributeNames: {
                "#pk": "pk"
            },
            expressionAttributeValues: {
                ":pk": { S: `org#${reqContext.orgId}#branch#${reqContext.branchId}#primaryTasks` }
            },
            isAscendingOrder: true,
        };
        return await this.dynamoDAL.getRowsFromDynamoDB(params);
    }

    getUniqueColumnValues(rows) {
        const uniqueValues: Record<string, Set<any>> = {};
        rows.forEach((obj) => {
            Object.keys(obj).forEach((key) => {
                if (!uniqueValues[key]) {
                    uniqueValues[key] = new Set();
                }
                if (Array.isArray(obj[key])) {
                    obj[key].forEach((nestedElement: any) => {
                        uniqueValues[key].add(nestedElement);
                    });
                } else {
                    uniqueValues[key].add(obj[key]);
                }
            });
        });
        const result: Record<string, any[]> = {};
        for (const key in uniqueValues) {
            result[key] = Array.from(uniqueValues[key]);
        }
        return result;
    }
}