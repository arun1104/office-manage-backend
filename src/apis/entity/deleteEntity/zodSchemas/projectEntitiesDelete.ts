import { OPERATION_ID_LIST } from "@constants";
import { DeleteAble_Entities } from "@enums";
import { z } from "zod";

export function getZodSchemasForProjectEntityDelete() {
    return {
        [OPERATION_ID_LIST.deleteProjectEntity]: z.object({
            entity: z.nativeEnum(DeleteAble_Entities),
            filters: z.array(z.object({})),
        })
    };
}


