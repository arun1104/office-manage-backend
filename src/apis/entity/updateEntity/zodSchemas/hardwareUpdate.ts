import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy } from "@utilities";

export function getZodSchemasForHardwareUpdate() {
    return {
        [OPERATION_ID_LIST.updateHardware]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                hardwareId: z.string().min(1),
            }),
            attributesToUpdate: z.object({
            type: z.string().optional(),
            brand: z.string().optional(),
            model: z.string().optional(),
            serialNumber: z.string().optional(),
            purchaseDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
            warrantyExpiryDate: z.string().optional(),
            location: z.string().optional(),
            status: z.string().optional(),
            assignedToUserId: z.string().optional(),
            specifications: z.string().optional(),
            notes: z.string().optional(),
            }), 
        })
    };
}


