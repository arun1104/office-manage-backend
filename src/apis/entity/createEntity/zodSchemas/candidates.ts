import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_dd_mm_yyyy} from "@utilities";

export function getZodSchemasForCandidates() {
    return {
        [OPERATION_ID_LIST.createCandidate]: z.object({
            entity: z.string().max(100),
            jobId: z.string().max(100).optional(),
            firstName: z.string().max(100),
            lastName: z.string().max(100),
            email: z.string().max(100),
            phone: z.string().max(100).optional(),
            resumeUrl: z.string().max(100).optional(),
            coverLetter: z.string().max(1000).optional(),
            linkedinProfile: z.string().url().optional(),
            portfolioUrl: z.string().url().optional(),
            gender: z.enum(["Male","Female","Other"]).optional(),
            skills: z.array(z.string().max(100)).optional(),
            education: z.array(z.object({
                degree: z.string().max(100).optional(),
                institution: z.string().max(100).optional(),
                startDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                endDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                grade: z.string().max(20).optional(),
            })).optional(),
            experience: z.array(z.object({
                jobTitle: z.string().max(100).optional(),
                companyName: z.string().max(100).optional(),
                startDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                endDate: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
                responsibilities: z.string().max(1000).optional(),
            })).optional(),
            certifications: z.array(z.object({
                name: z.string().max(100).optional(),
                institution: z.string().max(100).optional(),
                dateObtained: z.string().regex(regexFor_dd_mm_yyyy()).optional(),
            })).optional(),
            references: z.array(z.object({
                name: z.string().max(100).optional(),
                contactInfo: z.string().max(100).optional(),
                relationship: z.string().max(100).optional(),
            })).optional(),
            status: z.string().max(50),
            appliedOn: z.string().max(100).optional(),
            source: z.string().max(100).optional(),
            notes: z.string().max(1000).optional(),
            })
    };
}