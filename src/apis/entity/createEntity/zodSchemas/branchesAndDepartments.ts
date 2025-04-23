import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForBranchesAndDepartments() {
    return {
        [OPERATION_ID_LIST.createBranch]: z.object({
            entity: z.string().max(100),
            branchName: z.string()
            .max(100),
            location: z.string()
            .max(100),
            branchAdmin: z.string().max(50).optional(),
        }),
        [OPERATION_ID_LIST.createDepartment]: z.object({
            entity: z.string().max(100),
            branchId: z.string().max(100),
            departmentName: z.string()
            .max(100),
            location: z.string()
            .max(100)
            .optional(),
            departmentAdmin: z.string().max(50).optional(),
        })
    };
}