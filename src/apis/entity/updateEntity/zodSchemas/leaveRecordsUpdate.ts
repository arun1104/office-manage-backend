import { z } from 'zod';
import { regexFor_dd_mm_yyyy } from "@utilities";
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForLeaveRecordUpdate() {
    return {
        [OPERATION_ID_LIST.updateLeaveRecord]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                leaveId: z.string().max(100),
                employeeId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                dateFrom: z.string().regex(regexFor_dd_mm_yyyy(), { message: "Invalid date format for dateFrom" }).optional(),
                dateTo: z.string().regex(regexFor_dd_mm_yyyy(), { message: "Invalid date format for dateTo" }).optional(),
                duration: z.enum(["Full Day", "Half Day", "Quarter Day"]).optional(), // Optional duration enum
                leaveCount: z.number().int().positive().optional(),                   // Optional positive integer
                leaveDays: z.array(z.string().regex(/^\d{8}$/, { message: "Invalid date format in leaveDays" })).optional(),
                leaveReason: z.string().min(1, "Leave reason cannot be empty").optional(), // Optional leave reason
                leaveType: z.string().optional(),                                      // Optional string for leave type
                statusId: z.string().optional(),                                       // Optional statusId
                status: z.string().optional()
            }),
        })
    };
}


