import { HTTP_RESOURCES, OPERATIONS, RESPOSE_CODES, MONGO_COLLECTION_NAMES } from "@constants";
import { IHandler, IReqInfo } from "@interfaces";
import { AttributeTypes } from "@enums";
import { MongoDBClient, RedisClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class GetEntityListHandler implements IHandler {
    operation: string;
    redisClient: RedisClient;
    mongoDal: MongoDBClient;
    operationId: string;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = OPERATIONS.READ;
        this.operationId = ''
        this.resource = HTTP_RESOURCES.ENTITY.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            sortBy: z.string().max(30).optional(),
            value: z.string().max(200).optional(),
            attribute: z.string().max(50).optional(),
            sortDirection: z.enum(['asc', 'desc']).optional(),
            parentId: z.string().max(200).optional(),
            attributeType: z.string().max(30).optional(),
            skip: z.string().max(5).optional(),
            queryType: z.string().max(20),
            entity: z.string().max(20),
            limit: z.string().max(5).optional(),
        })];
        this.mongoDal = new MongoDBClient();
        this.redisClient = new RedisClient();
    }

    async handler(req: IReqInfo, res: any) {
        try {
            this.operationId = HTTP_RESOURCES.ENTITY.entityList[req.query.entity]['operationId'];
            let result;
            const tenantId = req.authorizationInfo.orgId;
            switch (req.query.queryType) {
                case 'all':
                    result = await this.handleAllQuery({ entity: req.query.entity, tenantId, limit: req.query.limit});
                    break;
                case 'self':
                    result = await this.handleSelfQuery({ tenantId, queryParams: req.query, email: req.userInfo.email });
                    break;
                case 'single_entity':
                    if (!HTTP_RESOURCES.ENTITY.entityList[req.query.entity].isConditionalPopulate) {
                        result = await this.handleSingleEntity({
                            tenantId, queryParams: req.query, options: {
                                populate: Array.isArray(HTTP_RESOURCES.ENTITY.entityList[req.query.entity].populate),
                                paths: HTTP_RESOURCES.ENTITY.entityList[req.query.entity].populate
                            }
                        });
                    } else {
                        if (req.query.parentToPopulate) {
                            const attributesToPopulate = JSON.parse(JSON.stringify(HTTP_RESOURCES.ENTITY.entityList[req.query.entity].populate));
                            attributesToPopulate[0].model = req.query.parentToPopulate;
                            result = await this.handleSingleEntity({
                                tenantId, queryParams: req.query, options: {
                                    populate: true,
                                    paths: attributesToPopulate
                                }
                            });
                        }
                    }

                    break;
                case 'filter':
                    result = await this.handleFilterQuery({ tenantId, queryParams: req.query })
                    break;
                case 'paginated':
                    result = await this.handlePaginatedQuery({ tenantId, ...req.query })
                    break;
                case 'search':
                    result = await this.handleSearchQuery({ tenantId, queryParams: req.query });
                    break;
                case 'sort':
                    result = await this.handleSortQuery({ tenantId, ...req.query });
                    break;
                case 'vendor-dashboard':
                    result = await this.fetchVendorDashboardData({ tenantId, ...req.query });
                    break;
                default:
                    break;
            }
            if (result === null) {
                res.status(RESPOSE_CODES.RESOURCE_NOT_FOUND).send({ message: 'Resource not found' });
            } else {
                res.status(RESPOSE_CODES.READ).send(result);
            }
        } catch (err) {
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: `Unable to retrieve ${req.query.entity}.Internal Server Error`
            });
        }
    }

    async handleSingleEntity({ tenantId, queryParams, options }) {
        const queryObj = { tenantId };
        queryObj[queryParams.attribute] = queryParams.value;
        const result = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: queryParams.entity,
            filters: [queryObj], options
        })
        if (queryParams.entity === MONGO_COLLECTION_NAMES.tags) {
            if (!result) {
                return { hashTags:[]};
            }
        }
        return result
    }

    async handleSelfQuery({ tenantId, queryParams, email }) {
        let result = null;
        switch (queryParams.entity) {
            case HTTP_RESOURCES.ENTITY.entityList.users.name:
                result = await this.getUserOfTenantFromMongoDB({ tenantId, email });
                return result;
            case HTTP_RESOURCES.ENTITY.entityList.tenants.name:
                result = await this.getTenantInfoFromMongoDB({ tenantId });
                return result;
        }
    }

    async handleAllQuery({ entity, tenantId, limit }) {
        const result = await this.mongoDal.mongoRead.getItemList({
            resource: entity,
            queryObj: { tenantId },
            limit
        });
        return result;
    }

    async handleSortQuery({ entity, tenantId, attribute, sortDirection, skip, limit }) {
        let sortCriteria = {};
        if (!attribute) {
            sortCriteria = { createdAt: 'asc' }
        } else {
            sortCriteria[attribute] = sortDirection;
        }
        const result = await this.mongoDal.mongoRead.getItemList({
            resource: entity,
            queryObj: { tenantId },
            limit: parseInt(limit), skip: parseInt(skip), sortCriteria
        });
        return result;
    }

    async handlePaginatedQuery({ entity, tenantId, skip, limit }) {
        const result = await this.mongoDal.mongoRead.getItemList({
            resource: entity,
            queryObj: { tenantId },
            limit, skip
        });
        return result;
    }

    async handleSearchQuery({ tenantId, queryParams }) {
        const { attribute, parentId, value, entity } = queryParams;
        const queryObj = { tenantId, ...(parentId !== undefined ? { parentId } : {}) };
        queryObj[attribute] = new RegExp(value, 'i');
        const result = await this.mongoDal.mongoRead.getManyThatMatchesAnyFilter({
            resource: entity,
            filters: [queryObj]
        });
        return result;
    }

    async handleFilterQuery({ tenantId, queryParams }) {
        const { attribute, attributeType, value, entity, parentId } = queryParams;
        const queryObj = { tenantId, ...(parentId !== undefined ? { parentId } : {}) };
        switch (attributeType) {
            case AttributeTypes.STRING:
                queryObj[attribute] = value;
                break;
            case AttributeTypes.NUMBER:
                queryObj[attribute] = parseInt(value);
                break;
            case AttributeTypes.DECIMAL:
                queryObj[attribute] = parseFloat(value);
                break;
            case AttributeTypes.ARRAY:
                queryObj[attribute] = value;
                break;
            case AttributeTypes.BOOLEAN:
                queryObj[attribute] = Boolean(value);
                break;
            default:
                queryObj[attribute] = value;
                break;
        }
        const result = await this.mongoDal.mongoRead.getItemList({
            resource: entity,
            queryObj,
        });
        return result;
    }

    async getTenantInfoFromMongoDB({ tenantId }) {
        let tenantInfo = null;
        tenantInfo = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: HTTP_RESOURCES.ENTITY.entityList.tenants.name,
            filters: [{ tenantId }], options: {
                populate: true,
                paths: HTTP_RESOURCES.ENTITY.entityList.tenants.populate
            }
        });
        return tenantInfo;
    }

    async getUserOfTenantFromMongoDB({ tenantId, email }) {
        let userInfo = null;
        userInfo = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: MONGO_COLLECTION_NAMES.users,
            filters: [{ tenantId, email }]
        });
        return userInfo;
    }

    objectToQueryString(obj: Record<string, string | number | boolean>): string {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(obj)) {
            params.append(key, value.toString());
        }
        return `${params.toString()}`;
    }

    async fetchVendorDashboardData({ tenantId, vendorId, ...rest }) {
        const tenantInfo = await this.getTenantInfoFromMongoDB({ tenantId });
        let url = `${tenantInfo.vendorConfiguration.dashboardApiUrl}?`;
        const queryParams = {
            ...rest,
            entity: rest.dashboardEntity
        };
        delete queryParams['dashboardEntity'];
        delete queryParams['queryType'];
        const remainingQueryString = this.objectToQueryString(queryParams);
        if (vendorId) {
            url = `${url}vendorId=${vendorId}&`;
        }
        url = `${url}${remainingQueryString}`;
        const apiKey = tenantInfo.vendorConfiguration.apiKey;
        const headers = {
            'x-api-key': apiKey,
        };
        try {
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching vendor dashboard data:', error);
        }
    }

}