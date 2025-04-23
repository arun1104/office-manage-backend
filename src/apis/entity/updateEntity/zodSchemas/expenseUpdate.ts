import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy } from "@utilities";

export function getZodSchemasForExpenseUpdate() {
    return {
        [OPERATION_ID_LIST.updateExpense]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                expenseId: z.string().min(1),
            }),
            attributesToUpdate: z.object({
                expenseTitle: z.string().max(100).optional(),
                category: z.string().max(100).optional(),
                branchId: z.string().max(100).optional(),
                departmentId: z.string().max(100).optional(),
                amount: z.number().optional(), // Assuming Decimal can be mapped to number in Zod
                expenseDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                status: z.string().max(100).optional(),
                currency: z.string().max(100).optional(),
                defaultAttachment: z.string().max(100).optional(),
                conversionRate: z.number().optional(), // Assuming Decimal can be mapped to number in Zod
                description: z.string().max(100).optional(),
                approvedBy: z.string().max(100).optional(),
                recepientId: z.string().max(100).optional(),
                recepientName: z.string().max(100).optional(),
                recepientType: z.string().max(100).optional(),
                tags: z.array(z.string().max(100)).optional(),
            }), 
        })
    };
}


