import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForTags() {
    return {
        [OPERATION_ID_LIST.updateTags]: z.object({
            entity: z.string().min(1),
            category:z.string().min(1).optional(),
            tagId:z.string().min(1),
            name: z.string().min(1).optional(),
            item: z.object({}),
            action: z.enum(['push', 'pop'])
        })
    };
}

