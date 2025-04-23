import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForSelfUpdate() {
    return {
        [OPERATION_ID_LIST.updateSelf]: z.object({
            entity: z.string().max(100),
            attributesToUpdate: z.object({
                profilePic: z.string().min(1).optional(),
                maritalStatus:z.enum(["Single", "Married"]).optional(),
                spouseName: z.string().min(1).optional(),
                bloodGroup: z.string().min(1).optional(),
                alternativePhn: z.string().max(500).optional(),
                guardian:z.string().max(100).min(2).optional(), 
            }).strict(), 
        })
    };
}
