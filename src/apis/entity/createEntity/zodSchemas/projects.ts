import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForProjectEntities() {
    const safeDescriptionRegex = /[^&$#@]*/;
    return {
        [OPERATION_ID_LIST.createProjectEntity]: z.object({
            entity: z.string().min(1),
            entityType: z.string().min(1),
            name: z.string().min(1),
            description: z.string().regex(safeDescriptionRegex).optional(),
          })}}