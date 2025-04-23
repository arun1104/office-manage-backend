import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForExpenses() {
    return {
        [OPERATION_ID_LIST.createExpense]: z.object({
            entity: z.string().min(1),
            branchId: z.string().min(1),
            departmentId:z.string().min(1),
            expenseTitle: z.string().min(1),
            category:z.string().min(1),
            amount: z.number().min(0.01),
            status: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
        })
    };
}


