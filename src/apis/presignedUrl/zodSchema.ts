import { z } from "zod";

export enum PRESIGNED_URL_ACTIONS {
    GET_PRESIGNED_URL = "GET_PRESIGNED_URL",
    GET_PRESIGNED_URL_FROM_REGION = "GET_PRESIGNED_URL_FROM_REGION",
}

export const presignedUrlZodSchema = z.object({
   action: z.nativeEnum(PRESIGNED_URL_ACTIONS),
   key: z.string(),
   domainName: z.string().optional(),
   region: z.string().optional(),
})

export type PresignedUrlInput = z.infer<typeof presignedUrlZodSchema>;