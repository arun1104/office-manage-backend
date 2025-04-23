import { z } from "zod";
import { OPERATION_ID_LIST } from "@constants";
import { regexForISOString } from "@utilities";

export function getZodSchemasForIncomeUpdate() {
  return {
    [OPERATION_ID_LIST.updateIncome]: z.object({
      entity: z.string().max(100),
      filter: z.object({
        incomeId: z.string().min(1),
      }),
      attributesToUpdate: z.object({
        incomeTitle: z.string().max(100).optional(),
        category: z.string().max(100).optional(),
        branchId: z.string().max(100).optional(),
        departmentId: z.string().max(100).optional(),
        amount: z.number().optional(), // Assuming Decimal can be mapped to number in Zod
        incomeDate: z.string().regex(regexForISOString()).optional(),
        status: z.string().max(100).optional(),
        currency: z.string().max(100).optional(),
        defaultAttachment: z.string().max(100).optional(),
        conversionRate: z.number().optional(), // Assuming Decimal can be mapped to number in Zod
        description: z.string().max(100).optional(),
        approvedBy: z.string().max(100).optional(),
        tags: z.array(z.string().max(100)).optional(),
      }),
    }),
  };
}
