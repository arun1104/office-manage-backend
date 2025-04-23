import { CMS_CRUD_ACTIONS } from "@enums";
import { z } from "zod";

export const cmsCrudZodSchema = z.object({
    entity: z.string(),
    entityType: z.string(),
    action:z.nativeEnum(CMS_CRUD_ACTIONS),
    data: z.unknown(),
    isDataValidationRequired: z.boolean().optional(),
    metaData: z.any(),
    fieldData: z.any(),
    filter: z.any().optional(),
    createUniqueId: z.boolean().optional(),
    uniqueIdAttribute: z.string().optional(),
    updateCmsUser: z.boolean().optional(),
    cmsUserUpdationInfo: z.object({
        email: z.string(),
        data: z.any(),
    }).optional(),
})