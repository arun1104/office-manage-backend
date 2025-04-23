import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { DeleteAble_Entities } from "@enums";
export function getZodSchemasForPrimaryTaskDelete() {
    return {
        [OPERATION_ID_LIST.deletePrimaryTask]: z.object({
            entity: z.nativeEnum(DeleteAble_Entities),
            filters: z.array(z.object({taskAssociationId:z.string(),branchId:z.string() })),
        })
    };
}


