import { HTTP_RESOURCES, BAD_REQUEST, RESPOSE_CODES } from "@constants";
import { Advance_Search_Filter_Options, String_Search } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD } from "@utilities";
import { MongoDBClient, MATH_OPERATIONS, DateAndTime } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class AdvanceSearchAndFilteringHandler implements IHandler {
    operation: string;
    mongoDal: MongoDBClient;
    operationId: string;
    resource: string;
    dateAndTime: DateAndTime
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.ADVANCE_SEARCH_FILTERING.operationIdList.advanceSearchAndFiltering.operationType;
        this.operationId = HTTP_RESOURCES.ADVANCE_SEARCH_FILTERING.operationIdList.advanceSearchAndFiltering.name;
        this.resource = HTTP_RESOURCES.ADVANCE_SEARCH_FILTERING.relativepath;
        this.handler = this.handler.bind(this);
        this.validations = [z.object({
            action: z.nativeEnum(Advance_Search_Filter_Options),
            filters: z.array(z.object({}).optional()),
            sortCriteria: z.object({}).optional(),
            subStringParams: z.array(z.object({
                attributeName: z.string().max(100),
                value: z.string().max(100),
                searchAt: z.nativeEnum(String_Search),
            })).optional(),
            rangeQueryParams: z.object({
                attributeType: z.string().optional(),
                attributeName: z.string(),
                timezone: z.string().optional(),
                from: z.any(),
                to: z.any(),
                castToInteger: z.boolean().optional()
            }).optional(),
            groupByAttributeName: z.string().optional(),
            attributeName: z.string().optional(),
            isArray: z.boolean().optional(),
            isMonth: z.boolean().optional(),
            month: z.number().max(12).optional(),
            year: z.number().max(4000).optional(),
            arrayAttributeName: z.string().optional(),
            operationType: z.nativeEnum(MATH_OPERATIONS).optional(),
        })];
        this.mongoDal = new MongoDBClient();
        this.dateAndTime = new DateAndTime();
    }

    getFilterForSubstring({ subStringParams, filters }: { filters: Array<any>, subStringParams: Array<{ value: string, searchAt: String_Search, attributeName: string }>, tenantId: string }) {
        return subStringParams.map(param => {
            const filter = [];
            filter[param.attributeName] = this.getRegexPattern(param.value, param.searchAt);
            return { ...filter, ...filters[0] };
        });
    }

    getFilterForValueSearch({ subStringParams, filters }: { filters: Array<any>, subStringParams: Array<{ value: string, searchAt: String_Search, attributeName: string }>, tenantId: string }) {
        return subStringParams.map(param => {
            const filter = [];
            filter[param.attributeName] = this.getRegexPattern(param.value, param.searchAt);
            return { ...filter, ...filters[0] };
        });
    }

    getRegexPattern(value: string, searchAt: String_Search): RegExp {
        switch (searchAt) {
            case String_Search.PREFIX:
                return new RegExp(`^${value}`, 'i');
            case String_Search.SUFFIX:
                return new RegExp(`${value}$`, 'i');
            case String_Search.ALL:
                return new RegExp(`${value}`, 'i');
            case String_Search.VALUE:
                return new RegExp(`^${value}$`, 'i');
        }
    }

    async handler(req: IReqInfo, res: any) {
        const { action, entity } = req.body;
        const tenantId = req.authorizationInfo.orgId;
        let filters = req.body.filters.map(e => ({ ...e, tenantId }));
        let result;
        try {
            switch (action) {
                case Advance_Search_Filter_Options.GET_MANY:
                    result = await this.mongoDal.mongoRead.getManyThatMatchesAnyFilter({
                        resource: entity,
                        filters: filters.length ? filters : [{ tenantId }], sortParam: req.body.sortCriteria
                    });
                    break;
                case Advance_Search_Filter_Options.SUBSTRING_SEARCH:
                    filters = this.getFilterForSubstring({ subStringParams: req.body.subStringParams, tenantId, filters });
                    filters = filters.map(e => ({ ...e, tenantId }));
                    result = await this.mongoDal.mongoRead.getManyThatMatchesAnyFilter({
                        resource: entity,
                        filters: filters.length ? filters : [{ tenantId }], sortParam: req.body.sortCriteria
                    });
                    break;
                case Advance_Search_Filter_Options.VALUE_SEARCH:
                    filters = this.getFilterForSubstring({ subStringParams: req.body.subStringParams, tenantId, filters });
                    filters = filters.map(e => ({ ...e, tenantId }));
                    result = await this.mongoDal.mongoRead.getManyThatMatchesAnyFilter({
                        resource: entity,
                        filters: filters.length ? filters : [{ tenantId }], sortParam: req.body.sortCriteria
                    });
                    break;
                case Advance_Search_Filter_Options.GET_PROJECTIONS:
                    result = await this.mongoDal.mongoRead.getDistinctValuesForAttributes({
                        resource: entity,
                        projectionAttributes: req.body.projectionAttributes,
                        filters: filters.length ? filters : [{ tenantId }]
                    });
                    break;
                case Advance_Search_Filter_Options.RANGE_SEARCH:
                    if (req.body.rangeQueryParams.attributeType && req.body.rangeQueryParams.attributeType === 'date') {
                        req.body.rangeQueryParams.from = convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD(req.body.rangeQueryParams.from);
                        req.body.rangeQueryParams.to = convertDateFormat_DD_MM_YYYY_To_YYYY_MM_DD(req.body.rangeQueryParams.to);
                        const rangeInUTC = this.dateAndTime.convertRangeToUTC({ ...req.body.rangeQueryParams }, req.body.timezone);
                        req.body.rangeQueryParams.from = rangeInUTC.startDate;
                        req.body.rangeQueryParams.to = rangeInUTC.endDate;
                    }
                    result = await this.mongoDal.mongoRead.rangeQuery({
                        resource: entity,
                        rangeQueryParams: req.body.rangeQueryParams,
                        filters: filters.length ? filters : [{ tenantId }], sortParam: req.body.sortCriteria
                    });
                    break;
                case Advance_Search_Filter_Options.MATH_OPERATIONS:
                    if (req.body.attributeName && req.body.operationType) {
                        result = await this.mongoDal.mongoRead.performMathematicalAggregation({
                            resource: entity,
                            attributeName: req.body.attributeName,
                            operationType: req.body.operationType,
                            groupByAttributeName: req.body.groupByAttributeName,
                            arrayAttributeName: req.body.arrayAttributeName,
                            isArray: req.body.isArray,
                            month: req.body.month,
                            year: req.body.year,
                            isMonth: req.body.isMonth,
                            filters: filters.length ? filters : [{ tenantId }]
                        });
                    } else {
                        res.status(BAD_REQUEST.invalidReqPayload.statusCode).send(
                            { message: BAD_REQUEST.invalidReqPayload.message }
                        );
                        return;
                    }
                    break;
                default:
                    res.status(BAD_REQUEST.invalidReqPayload.statusCode).send(
                        { message: BAD_REQUEST.invalidReqPayload.message }
                    );
                    return;
            }
            res.status(RESPOSE_CODES.READ).send(result);
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(500).send({
                message: 'Unknown error'
            });
        }
    }
}