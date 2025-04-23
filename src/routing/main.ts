import { HTTP_METHODS, OPERATIONS } from "@constants";
import { validate,errorHandler } from "@middlewares";
import { IHandler } from "@interfaces";
import { GetConfigurationHandler, UpdateConfigurationHandler } from "@configurations";
import { ManageFilesHandler } from "@fileManagement";
import {
    GetEntityListHandler,
    CreateEntityHandler,
    UpdateEntityHandler,
    DeleteEntityHandler
} from "@entities";

import { FlushRedisHandler,UpdateCollectionHandler, SendInstantMessage } from "@infraManagement";
import { AdvanceSearchAndFilteringHandler } from "@advanceSearchFilter";
import { GetDynamoEntitiesHandler } from "@dynamoEntities";
import { ManageCalendarEventsHandler } from "@calendarEvents";
import { DashboardsHandler } from "@dashboards";
import { CmsCrudHandler } from "src/apis/cmsCrud/crud/handler";
import { PresignedUrlHandler } from "src/apis/presignedUrl/handler";

const MAP_KEY_PAIR = [
    [OPERATIONS.CREATE, HTTP_METHODS.POST], [OPERATIONS.REPLACE, HTTP_METHODS.PUT],
    [OPERATIONS.DELETE, HTTP_METHODS.DELETE], [OPERATIONS.UPDATE, HTTP_METHODS.PATCH],
    [OPERATIONS.INVOKE, HTTP_METHODS.POST], [OPERATIONS.READ, HTTP_METHODS.GET]
];
const HTTP_OPERATION_MAP = new Map(MAP_KEY_PAIR as any);
const API_VERSION = process.env.API_VERSION || process.env.APP_VERSION;
export const registerRoutes = function (app) {
    const routeHandlers: Array<IHandler> = getAllRouteHandlers();
    routeHandlers.forEach(element => {
        const httpMethod = HTTP_OPERATION_MAP.get(element.operation) as string;
        const relativePath = `/${API_VERSION}/${element.resource}`;
        app[httpMethod](
            relativePath,
            validate(element.validations), element.handler);
    });  
    app.use(errorHandler);
}
function getAllRouteHandlers(): Array<IHandler> {
    const routeHandlers: Array<IHandler> = [];
    routeHandlers.push(new GetConfigurationHandler());
    routeHandlers.push(new GetEntityListHandler());
    routeHandlers.push(new FlushRedisHandler());
    routeHandlers.push(new CreateEntityHandler());
    routeHandlers.push(new UpdateEntityHandler());
    routeHandlers.push(new UpdateConfigurationHandler());
    routeHandlers.push(new AdvanceSearchAndFilteringHandler());
    routeHandlers.push(new UpdateCollectionHandler());
    routeHandlers.push(new GetDynamoEntitiesHandler());
    routeHandlers.push(new ManageFilesHandler());
    routeHandlers.push(new SendInstantMessage());
    routeHandlers.push(new ManageCalendarEventsHandler());
    routeHandlers.push(new DashboardsHandler());
    routeHandlers.push(new DeleteEntityHandler());
    routeHandlers.push(new CmsCrudHandler());
    routeHandlers.push(new PresignedUrlHandler());
    return routeHandlers;
}