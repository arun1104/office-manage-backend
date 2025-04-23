import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForMessages() {
    return {
        [OPERATION_ID_LIST.sendMessage]: z.object({
            entity: z.string().min(1),
            messageEntityType: z.string().optional(),
            branchId: z.string().optional(),
            messageThreadId: z.string(),
            messageMediaType: z.string(),
            attachments: z.array(z.string()).optional(),
            text: z.string().optional(),
            sentById: z.string(),
            sentByName: z.string(),
            userReferences: z.array(z.string()).optional(),
            oldMessageReferenceId: z.string().optional(),
        })
    };
}

