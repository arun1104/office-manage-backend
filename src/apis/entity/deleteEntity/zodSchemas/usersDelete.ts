import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { DeleteAble_Entities } from "@enums";
export function getZodSchemasForUserDelete() {
    return {
        [OPERATION_ID_LIST.deleteUser]: z.object({
            entity: z.nativeEnum(DeleteAble_Entities),
            filters: z.array(z.object({email:z.string() })),
        })
    };
}


