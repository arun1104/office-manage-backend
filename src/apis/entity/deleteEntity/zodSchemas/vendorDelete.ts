import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { DeleteAble_Entities } from "@enums";
export function getZodSchemasForVendorDelete() {
    return {
        [OPERATION_ID_LIST.deleteVendor]: z.object({
            entity: z.nativeEnum(DeleteAble_Entities),
            filters: z.array(z.object({vendorId:z.string() })),
        })
    };
}


