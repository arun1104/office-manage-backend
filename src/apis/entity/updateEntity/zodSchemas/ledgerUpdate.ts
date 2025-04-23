import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForLedgerUpdate() {
    return {
        [OPERATION_ID_LIST.updateVendorRequest]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                invoiceReqId: z.string().max(100),
                vendorId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                status: z.string(),
                message:z.string()
            }), 
        })
    };
}


