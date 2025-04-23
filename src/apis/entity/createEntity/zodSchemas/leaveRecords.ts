import { z } from 'zod';
import { regexFor_dd_mm_yyyy} from "@utilities";
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForLeaveRecords() {
    return {
        [OPERATION_ID_LIST.createLeaveRecord]: z.object({
            fromDate: z.string().regex(regexFor_dd_mm_yyyy(), { message: "Invalid date format for dateFrom" }), // YYYY-MM-DD format
            dateTo: z.string().regex(regexFor_dd_mm_yyyy(), { message: "Invalid date format for dateTo" }),     // YYYY-MM-DD format
            duration: z.enum(["Full Day", "Half Day", "Quarter Day"]),                                           // Restrict to specific options
            leaveCount: z.number().int().positive().optional(),                                                             // Positive integer
            leaveDays: z.array(z.string().regex(/^\d{8}$/, { message: "Invalid date format in leaveDays" })),    // Array of strings in YYYYMMDD format
            leaveReason: z.string().min(1, "Leave reason cannot be empty"),                                      // Non-empty string
            leaveType: z.string(),
            branchId: z.string(),
            status: z.enum(["Applied"]), 
          })
    };
}


