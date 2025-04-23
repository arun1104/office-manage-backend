import { HTTP_RESOURCES, BAD_REQUEST, RESPOSE_CODES, MONGO_COLLECTION_NAMES } from "@constants";
import { CalendarContext, CalendarEvents, Months } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { getUniqueId } from "@utilities";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class ManageCalendarEventsHandler implements IHandler {
  operation: string;
  operationId: string;
  resource: string;
  validations: any[];
  mongoDal: MongoDBClient;
  constructor() {
    this.mongoDal = new MongoDBClient();
    this.operation = HTTP_RESOURCES.CALENDAR_EVENTS.operationIdList.manageCalendarEvents.operationType;
    this.operationId = HTTP_RESOURCES.CALENDAR_EVENTS.operationIdList.manageCalendarEvents.name;
    this.resource = HTTP_RESOURCES.CALENDAR_EVENTS.relativepath;
    this.handler = this.handler.bind(this);
    this.validations = [z.object({
      action: z.nativeEnum(CalendarEvents),
      hierarchy: z.nativeEnum(CalendarContext).optional(),
      eventDate: z.string().regex(/^\d{8}$/),
      month: z.nativeEnum(Months).optional(),
      name: z.string().optional(),
      branchId: z.string().optional(),
      description: z.string().optional(),
      time: z.string().optional(),
      timezone: z.string().optional(),
    })];
  }

  async handler(req: IReqInfo, res: any) {
    const { action } = req.body;
    const reqContext = {
      orgId: req.authorizationInfo.orgId,
      branchId: req.body.branchId,
      userId: req.userInfo.email,
      userName: req.userInfo.name
    };
    try {
      switch (action) {
        case CalendarEvents.Add_Holiday:
          req.body.entityId = getUniqueId();
          await this.addHolidayEventHandler({ ...req.body, ...reqContext })
          await this.mongoDal.mongoCreate.createItem({
            resource: MONGO_COLLECTION_NAMES.orgEntities, data: { ...req.body, ...reqContext, tenantId: reqContext.orgId, entityType: "Holidays" }
          });
          res.status(RESPOSE_CODES.CREATE).send(
            { message: 'Added Holiday successfully', calendarEventId: req.body.entityId }
          );
          return;
        case CalendarEvents.Remove_Holiday:
          await this.removeHolidayEventHandler({ ...req.body, ...reqContext });
          res.status(RESPOSE_CODES.UPDATE_SUCCESS).send({ message: 'Removed Holiday successfully', calendarEventId: req.body.entityId });
          return;
        default:
          res.status(BAD_REQUEST.invalidReqPayload.statusCode).send(
            { message: BAD_REQUEST.invalidReqPayload.message }
          );
      }
    } catch (err) {
      console.log(`Error in ${this.operationId}`, err);
      res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
        message: 'Unable to process request'
      });
    }
  }

  async removeHolidayEventHandler(body) {
    const branchSettings = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
      resource: MONGO_COLLECTION_NAMES.branches,
      filters: [{
        tenantId: body.orgId,
        branchId: body.branchId
      }],
    });

    await this.mongoDal.mongoDelete.deleteItem({
      resource: MONGO_COLLECTION_NAMES.orgEntities,
      filters: [{
        tenantId: body.orgId,
        branchId: body.branchId,
        entityType: "Holidays", entityId: body.entityId
      }],
    });

    const updatedHolidays_InYYYYMMDD = this.getUpdatedHolidaysInNumber(
      body, branchSettings, true);

    await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.branches,
      filters: [{ tenantId: body.orgId, branchId: body.branchId }],
      attributesToUpdate: {
        configuredHolidays_InYYYYMMDD: updatedHolidays_InYYYYMMDD,
      },
    });
  }

  async addHolidayEventHandler(body) {
    const branchSettings = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
      resource: MONGO_COLLECTION_NAMES.branches,
      filters: [{ tenantId: body.orgId, branchId: body.branchId }],
    });

    const updatedHolidays_InYYYYMMDD = this.getUpdatedHolidaysInNumber(
      body,
      branchSettings
    );
    await this.mongoDal.mongoUpdate.patchItem({
      resource: MONGO_COLLECTION_NAMES.branches,
      filters: [{ tenantId: body.orgId, branchId: body.branchId }],
      attributesToUpdate: {
        configuredHolidays_InYYYYMMDD: updatedHolidays_InYYYYMMDD,
      },
    });
  }

  getUpdatedHolidaysInNumber(event, branchSettings, toRemove = false) {
    let configuredHolidays_InYYYYMMDD = (branchSettings && branchSettings.configuredHolidays_InYYYYMMDD) ? branchSettings.configuredHolidays_InYYYYMMDD : [];
    const reqDate = event.eventDate;
    if (toRemove && configuredHolidays_InYYYYMMDD.length && configuredHolidays_InYYYYMMDD.includes(reqDate)) {
      configuredHolidays_InYYYYMMDD = branchSettings.configuredHolidays_InYYYYMMDD.filter(e => e !== reqDate);
    } else {
      configuredHolidays_InYYYYMMDD.push(reqDate);

    }
    return Array.from(new Set(configuredHolidays_InYYYYMMDD));
  }
}