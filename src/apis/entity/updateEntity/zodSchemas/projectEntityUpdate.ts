import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForProjectEntityUpdate() {
    return {
        [OPERATION_ID_LIST.updateProjectEntity]: z.object({
            entity: z.string().max(100),
            entityType: z.string().max(100),
            filter: z.object({
                entityId: z.string().max(100),
                // Not sure about making this required
                parentId: z.string().max(100).optional(),
            }),
            attributesToUpdate: z.object({}), 
        })
    };
}


