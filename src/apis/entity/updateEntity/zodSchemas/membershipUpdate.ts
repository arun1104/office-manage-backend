import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForMembershipUpdate() {
    return {
        [OPERATION_ID_LIST.updateMembership]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                membershipId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                type: z.string().optional(),
                startDate: z.string().optional(),
                status: z.string().optional(),
                serialNo: z.string().optional(),
                initial: z.string().nullable().optional(),
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                name: z.string().optional(),
                address: z.string().optional(),
                location: z.string().optional(),
                phone: z.string().optional(),
                deceased: z.boolean().nullable().optional(),
                regNo: z.string().nullable().optional(),
                countryCode: z.string().max(4).optional(),
                maritalStatus: z.enum(["Single", "Married"]).optional(),
                gender: z.enum(["Male", "Female", "Other"]).optional(),
                email: z.string().max(100).optional(),
                dob: z.string().max(100).optional(),
                professionalDesignation: z.string().max(150).optional(),
                areasOfExpertise: z.array(
                  z.object({
                    field: z.string().min(1).max(255),
                    role: z.string().min(1).max(255),
                    experienceYears: z.number().int().min(0)
                  })
                ).optional(),
                highestEducation: z.string().max(150).optional(),
                familyName: z.string().max(100).min(2).optional(),
                roles: z.array(z.string()).optional(),
                designation: z.string().optional()
            }), 
        })
    };
}


