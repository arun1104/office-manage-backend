import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
import { regexFor_financial_year, regexFor_yyyy_mm_dd } from "@utilities";
export function getZodSchemasForInvestorsAndInvestments() {
    return {
        [OPERATION_ID_LIST.addInvestor]: z.object({
            name: z.string().min(1).max(255),
            phone: z.string().min(1).max(255),
            email: z.string().min(1).max(255).email(),
            areasOfExpertise: z.array(z.object({
                field: z.string().min(1).max(255),
                role: z.string().min(1).max(255),
                experienceYears: z.number().int().min(0)
            })),
            dateJoined: z.string().regex(regexFor_yyyy_mm_dd()),
            imageUrl: z.string().min(1).max(255).optional(),
            typeOfInvestor: z.string().min(1).max(255).optional(),
            roleInStartup: z.string().min(1).max(255).optional(),
            dateOfBirth: z.string().regex(regexFor_yyyy_mm_dd()).optional(),
            currentLocation: z.string().min(1).max(255).optional(),
            currentJobRole: z.string().min(1).max(255).optional(),
            investmentAmountCommittedMonth: z.number().int().min(0),
            investmentCommittedAmountFY: z.number().int().min(0).optional(),
        }),
        [OPERATION_ID_LIST.addInvestment]: z.object({
            investorId: z.string().min(1).max(255),
            investorName: z.string().min(1).max(255),
            amountReceivedOn:  z.string().regex(regexFor_yyyy_mm_dd()),
            amount: z.number().int().min(1),
            paymentMethod: z.string().min(1).max(255),
            notes: z.string().min(1).max(255).optional(),
            status: z.string().min(1).max(255),
            financialYear: z.string().regex(regexFor_financial_year()),
            transactionReference: z.string().min(1).max(255).optional(),
            period: z.string().min(1).max(255).optional(),
            periodRangeFrom: z.string().min(1).max(255).optional(),
            periodRangeTo: z.string().min(1).max(255).optional(),
            receivedByUserId: z.string().min(1).max(255),
            receivedByUserName: z.string().min(1).max(255)
        })
    };
}