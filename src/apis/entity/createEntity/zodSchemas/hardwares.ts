import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForHardwares() {
    return {
        [OPERATION_ID_LIST.createHardware]: z.object({
            entity: z.string().min(1).max(100),
            uid: z.string(),
            type: z.string(),
            brand: z.string(),
            model: z.string(),
            serialNumber: z.string(),
            purchaseDate: z.string()
          })}}