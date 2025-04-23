import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForInvoiceUpdate() {
    return {
        [OPERATION_ID_LIST.updateInvoice]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                invoiceId: z.string().max(100),
                clientId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                statusId: z.string(),
                status:z.string()
            }), 
        })
    };
}


