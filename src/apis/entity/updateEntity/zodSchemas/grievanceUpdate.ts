import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy } from "@utilities";

export function getZodSchemasForGrievanceUpdate() {
    return {
        [OPERATION_ID_LIST.updateGrievance]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                grievanceId: z.string().min(1),
            }),
            attributesToUpdate: z.object({
                category: z.string().min(1).optional(),
                severity: z.string().min(1).optional(),
                description: z.string().min(1).optional(),
                status: z.string().min(1).optional(),
                assignedTo: z.string().optional(),
                resolvedDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                closedDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                attachmentUrls: z.array(z.string()).optional()
            }), 
        })
    };
}


