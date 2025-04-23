import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForCountUpdate() {
    return {
        [OPERATION_ID_LIST.updateCount]: z.object({
            entity: z.string().max(100),
            filter: z.object({}),
            incrementBy: z.number().min(1).optional(),
        })
    };
}
