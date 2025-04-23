import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForEmployees() {
    return {
        [OPERATION_ID_LIST.createEmployee]: z.object({
            entity: z.string().max(100),
            branchId: z.string().min(1),
            departmentId: z.string().min(1),
            address: z.string().max(500).optional(),
            name:z.string().max(100).min(2),
            email:z.string().max(100).optional(),
            userId:z.string().max(100).optional(),
            phoneNumber:z.string().max(15),
            countryCode:z.string().max(4),
            gender:z.enum(["Male","Female","Other"]),
            maritalStatus:z.enum(["Single", "Married"]).optional(),
            highestEducation:z.string().max(150).optional(),
            employmentType:z.string().min(1),
            startDate:z.string().min(1),
            roles:z.array(z.string()).optional(),
            designation:z.string().min(1),
            levelCode:z.string().max(10).optional(),
            lineManager: z.string().min(1),
            lineManagerEmail:z.string().email()
        })
    };
}


