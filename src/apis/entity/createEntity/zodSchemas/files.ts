import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForFiles() {
    return {
        [OPERATION_ID_LIST.uploadFile]: z.object({
            entity: z.string().min(1),
            parent: z.string().min(1),
            parentId: z.string().min(1),
            parentQueryAttributeName: z.string().min(1),
            branchId:z.string().min(1),
            departmentId:z.string().min(1).optional(),
            category:z.string().min(1),
            path:z.string().min(1),
            name: z.string().min(1),
            fullUrl: z.string().min(1).optional(),
        })
    };
}

