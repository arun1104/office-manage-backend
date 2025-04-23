import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForOrgEntityUpdate() {
    return {
        [OPERATION_ID_LIST.updateOrgEntity]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                entityId: z.string().max(100),
            }),
            attributesToUpdate: z.object({}), 
        })
    };
}


