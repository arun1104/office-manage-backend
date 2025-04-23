import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import {  regexFor_yyyy_mm_dd } from "@utilities";

export function getZodSchemasForPaymentUpdate() {
    return {
        [OPERATION_ID_LIST.updatePayment]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                paymentId: z.string().min(1),
            }),
            attributesToUpdate: z.object({
            clientId: z.string().min(1).max(255).optional(),
            projectId: z.string().min(1).max(255).optional(),
            amount: z.number().min(0).optional(),
            paymentDate: z.string().regex(regexFor_yyyy_mm_dd()).optional(),
            method: z.string().min(1).max(255).optional(),
            status: z.string().min(1).max(255).optional(),
            receivedByUserId: z.string().min(1).max(255).optional(),
            receivedByUserName: z.string().min(1).max(255).optional()
            }), 
        })
    };
}


