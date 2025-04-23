import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForMembership() {
    return {
        [OPERATION_ID_LIST.addMembership]: z.object({
            entity: z.string().max(100),
            branchId: z.string().min(1),
            type: z.string(),
            startDate: z.string(),
            status: z.string(),
            serialNo: z.string(),
            initial: z.string().optional(),
            firstName: z.string(),
            lastName: z.string(),
            name: z.string(),
            address: z.string(),
            location: z.string(),
            phone: z.string(),
            deceased: z.boolean().optional(),
            regNo: z.string(),
            countryCode: z.string().max(4).optional(),
            maritalStatus:z.enum(["Single", "Married"]).optional(),
            gender:z.enum(["Male","Female","Other"]).optional(),
            email:z.string().max(100).optional(),
            dob:z.string().max(100).optional(),
            professionalDesignation: z.string().max(150).optional(),
            areasOfExpertise: z.array(z.object({
                field: z.string().min(1).max(255),
                role: z.string().min(1).max(255),
                experienceYears: z.number().int().min(0)
            })).optional(),
            highestEducation: z.string().max(150).optional(),
            familyName: z.string().max(100).min(2).optional(),
            roles:z.array(z.string()).optional(),
            designation:z.string().optional(),
        })
    };
}


