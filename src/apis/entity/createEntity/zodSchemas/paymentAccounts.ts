import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForPaymentAccounts() {
    return {
        [OPERATION_ID_LIST.addPaymentAccount]: z.object({
            entity: z.string().max(100),
            holderId: z.string(),
            type: z.string(),
            accountNumber: z.string().optional(),
            accountHolderName: z.string().optional(),
            bankName: z.string().optional(),
            branchName: z.string().optional(),
            ifscCode: z.string().optional(),
            swiftCode: z.string().optional(),
            routingNumber: z.string().optional(),
            iban: z.string().optional(),
            upiId: z.string().optional(),
            upiHolderName: z.string().optional(),
            walletId: z.string().optional(),
            walletProvider: z.string().optional(),
            walletHolderName: z.string().optional(),
            intlWalletId: z.string().optional(),
            intlWalletProvider: z.string().optional(),
            intlWalletHolderName: z.string().optional(),
            currency: z.string().optional(),
            isDefault: z.boolean().default(false).optional(),
        })
    };
}


