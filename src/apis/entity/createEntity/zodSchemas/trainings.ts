import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy } from "@utilities";

export function getZodSchemasForTrainings() {
    return {
        [OPERATION_ID_LIST.createTraining]: z.object({
            entity: z.string().max(100),
            trainingName: z.string(),
            trainingDescription: z.string().optional(),
            trainingType: z.string().optional(),
            createdDate: z.string().regex(regexFor_dd_mm_yyyy()),
            lastUpdatedDate: z.string().optional(),
            duration: z.string().optional(),
            isMandatory: z.boolean().optional(),
            trainerDetails: z.string().optional(),
            tags: z.array(z.string()).optional(),
        })
    };
}


