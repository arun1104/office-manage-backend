import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import {  regexFor_yyyy_mm_dd } from "@utilities";

export function getZodSchemasForPayments() {
    return {
        [OPERATION_ID_LIST.createPayment]: z.object({
            entity: z.string().min(1),
            clientId: z.string().min(1).max(255).optional(),
            projectId: z.string().min(1).max(255).optional(),
            amount: z.number().min(0),
            paymentFlow: z.enum(["incoming","outgoing"]),
            paymentDate: z.string().regex(regexFor_yyyy_mm_dd()),
            method: z.string().min(1).max(255),
            status: z.string().min(1).max(255),
            receivedByUserId: z.string().min(1).max(255).optional(),
            receivedByUserName: z.string().min(1).max(255).optional()
        })
    };
}