import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { OrgEntityHierarchy,OrgEntityTypes, ReminderOccurence } from "@enums";
export function getZodSchemasForOrgEntities() {
    const safeDescriptionRegex = /[^&$#@]*/;
    return {
        [OPERATION_ID_LIST.addOrgEntity]: z.object({
            entity: z.string().min(1),
            notificationConfig: z.object({
                toBeNotifiedOn: z.string(),
                occurence: z.nativeEnum(ReminderOccurence),
                startDate: z.string(),
            }).optional(),
            entityType: z.nativeEnum(OrgEntityTypes),
            name: z.string().min(1).max(500),
            hierarchy:z.nativeEnum(OrgEntityHierarchy),
            description: z.string().max(200).regex(safeDescriptionRegex).optional(),
          })}}