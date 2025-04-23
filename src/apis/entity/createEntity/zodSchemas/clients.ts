import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForClients() {
    const safeDescriptionRegex = /[^&$#@]*/;
    return {
        [OPERATION_ID_LIST.createClient]: z.object({
            entity: z.string().min(1).max(100),
            clientType: z.string().min(1).max(50),
            location: z.string().min(1).max(100),
            name: z.string().min(1).max(200),
            contactNo: z.string().min(5).max(20),
            email: z.string().email().max(80),
            description: z.string().max(200).regex(safeDescriptionRegex).optional(),
          })}}