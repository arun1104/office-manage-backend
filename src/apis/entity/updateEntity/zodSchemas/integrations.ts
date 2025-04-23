import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForIntegrationUpdate() {
    return {
        [OPERATION_ID_LIST.triggerIntegration]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                integrationId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                action:z.string()
            }), 
        })
    };
}


