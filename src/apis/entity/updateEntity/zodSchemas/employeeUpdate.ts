import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForEmployeeUpdate() {
    return {
        [OPERATION_ID_LIST.updateEmployee]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                employeeId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                branchId: z.string().min(1).optional(),
                departmentId: z.string().min(1).optional(),
                departmentName: z.string().min(1).optional(),
                address: z.string().max(500).optional(),
                name:z.string().max(100).min(2).optional(),
                email:z.string().max(100).optional(),
                userId:z.string().max(100).optional(),
                phoneNumber:z.string().max(15).optional(),
                countryCode:z.string().max(4).optional(),
                gender:z.enum(["Male","Female","Other"]).optional(),
                maritalStatus:z.enum(["Single", "Married"]).optional(),
                highestEducation:z.string().max(150).optional(),
                employmentType:z.string().min(1).optional(),
                startDate:z.string().min(1).optional(),
                roles:z.array(z.string()).optional(),
                designation:z.string().min(1).optional(),
                levelCode:z.string().max(10).optional(),
                lineManager: z.string().min(1).optional(),
                lineManagerEmail:z.string().email().optional()  
            }), 
        })
    };
}


