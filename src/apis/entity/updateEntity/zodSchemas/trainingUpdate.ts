import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForTrainingUpdate() {
    return {
        [OPERATION_ID_LIST.updateTraining]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                trainingId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                trainingName: z.string().optional(),
                trainingDescription: z.string().optional(),
                trainingType: z.string().optional(),
                lastUpdatedDate: z.string().optional(),
                duration: z.string().optional(),
                isMandatory: z.boolean().optional(),
                trainerDetails: z.string().optional(),
                tags: z.array(z.string()).optional(),
            }), 
        })
    };
}


