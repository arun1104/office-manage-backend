import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForIntegrations() {
    return {
        [OPERATION_ID_LIST.addIntegration]: z.object({
            entity: z.string().max(100),
            integrationType: z.string(),
            name: z.string(),
            status: z.string().optional(),
            description: z.string().optional(),
            bucketName: z.string().optional(),
            dataSourceFilePath: z.string().optional(),
            mapperFilePath: z.string().optional(),
            fileFormat: z.string().optional()
        })
    };
}
