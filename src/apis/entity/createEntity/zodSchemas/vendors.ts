import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";

export function getZodSchemasForVendors() {
    return {
        [OPERATION_ID_LIST.createVendor]: z.object({
            entity: z.string().min(1),
            vendorName: z.string().min(1).max(255),
            vendorType: z.string().min(1).max(255),
            contactPersonName: z.string().min(1).max(255),
            phoneNumber: z.string().min(1).max(255),
            address: z.string().min(1).max(255),
          })
    };
}