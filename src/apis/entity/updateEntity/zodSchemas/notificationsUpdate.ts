import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForNotificationsUpdate() {
    return {
        [OPERATION_ID_LIST.updateNotifications]: z.object({
            entity: z.string().max(100),
            branchId: z.string().max(100).optional(),
            clearAll: z.boolean().optional(),
            attributesToUpdate: z.object({
                pkSkList: z.array(z.object({
                    pk: z.string(),
                    sk: z.string()
                }))
            }), 
        })
    };
}


