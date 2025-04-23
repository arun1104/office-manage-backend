import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { DeleteAble_Entities } from "@enums";
export function getZodSchemasForOrgEntitiesDelete() {
    return {
        [OPERATION_ID_LIST.deleteOrgEntities]: z.object({
            entity: z.nativeEnum(DeleteAble_Entities),
            filters: z.array(z.object({})),
        })
    };
}


