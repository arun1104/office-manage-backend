import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";

export function getZodSchemasForInvoices() {
    return {
        [OPERATION_ID_LIST.createInvoice]: z.object({
            entity: z.string().min(1),
            clientId: z.string().min(1).max(255),
            invoiceInfo:z.any()
          })
    };
}