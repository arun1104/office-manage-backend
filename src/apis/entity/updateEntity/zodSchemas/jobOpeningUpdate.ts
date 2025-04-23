import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy} from "@utilities";

export function getZodSchemasForJobOpeningUpdate() {
    return {
        [OPERATION_ID_LIST.updateJobOpening]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                jobId: z.string().max(100),
            }),
            attributesToUpdate: z.object({
                jobTitle: z.string().max(100).optional(),
                jobDescription: z.string().max(1000).optional(),
                departmentId: z.string().max(100).optional(),
                location: z.string().max(100).optional(),
                employmentType: z.enum(['FullTime', 'PartTime', 'Contract', 'Intern' ]).optional(), // e.g., Full-Time, Part-Time, Contract
                experienceLevel: z.string().max(50).optional(), // e.g., Junior, Mid, Senior
                salaryRange: z.string().optional(),
                currency:z.string().optional(),
                qualifications:z.string().optional(),
                postedDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                closedDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                status: z.string().max(50).optional(), // e.g., Open, Closed, On Hold
                requirements: z.array(z.string().max(1000)).optional(),
                numberOfOpenings:z.number().optional(),
                responsibilities: z.array(z.string().max(1000)).optional(),
                benefits: z.array(z.string().max(1000)).optional(),
                hiringManagerId: z.string().optional(),
                educationLevel: z.string().optional(),
                skillsRequired:z.array(z.string()).optional(),
                additionalNotes:z.string().max(1000).optional(),
                contactPhone:z.string().optional(),
                contactEmail: z.string().optional(),
                applicationDeadline:z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                lastUpdatedBy: z.string().max(100).optional(),
                lastUpdatedOn: z.string().max(100).optional()
            }), 
        })
    };
}


