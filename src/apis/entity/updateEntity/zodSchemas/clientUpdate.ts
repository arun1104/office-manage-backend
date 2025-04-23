import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForClientUpdate() {
    return {
        [OPERATION_ID_LIST.updateClient]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                clientId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                name:z.string().max(100).min(2).optional(),
                location:z.string().max(100).optional(),
                description:z.string().max(100).optional(),
                category:z.string().max(100).optional(),
                status:z.string().optional(),
                tags:z.array(z.string()).optional()
            }), 
        })
    };
}


