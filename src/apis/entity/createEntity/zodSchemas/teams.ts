import { OPERATION_ID_LIST } from "@constants";
import { z } from "zod";

export function getZodSchemasForTeamsOfDeapartment() {
  return {
    [OPERATION_ID_LIST.createTeam]: z.object({
      entity: z.string().max(100),
      teamName: z.string().max(100),
      departmentId: z.string().min(4),
    }),
  };
}
