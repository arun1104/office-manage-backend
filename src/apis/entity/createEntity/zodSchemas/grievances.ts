import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForGrievances() {
    return {
        [OPERATION_ID_LIST.createGrievance]: z.object({
            uid: z.string().min(1),
            userId: z.string().min(1),
            category: z.string().min(1),
            severity: z.string().min(1),
            description: z.string().min(1)
    })}}