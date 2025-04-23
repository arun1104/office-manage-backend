import { z } from 'zod';
import { OPERATION_ID_LIST } from "@constants";
export function getZodSchemasForVendorUpdate() {
    const additionalContactSchema = z.object({
        contact_type: z.string().max(100).optional(),
        name: z.string().max(100).min(2).optional(),
        email: z.string().max(100).optional(),
        phone: z.string().max(100).min(2).optional(),
      });
    return {
        [OPERATION_ID_LIST.updateVendor]: z.object({
            entity: z.string().max(100),
            filter: z.object({
                vendorId: z.string().min(1),
                skip: z.number().min(0).optional(),
                limit: z.number().min(0).optional(),
                sortCriteria: z.object({}).optional(),
            }),
            attributesToUpdate: z.object({
                operation: z.string().max(100).min(2).optional(),
                crmUserName: z.string().max(100).min(2).optional(),
                crmUserId: z.string().max(100).min(2).optional(),
                vendorName: z.string().max(100).min(2).optional(),
                vendorType: z.string().max(100).min(2).optional(),
                vendorStatus: z.string().max(100).optional(),
                vendorApprovalStatus: z.string().max(100).optional(),
                contactPersonName: z.string().max(100).min(2).optional(),
                email: z.string().max(100).optional(),
                phoneNumber: z.string().max(100).min(2).optional(),
                address: z.string().max(100).min(2).optional(),
                additional_contacts: z.array(additionalContactSchema).optional(),
                preferredPaymentMode: z.string().max(100).optional(),
                bank_name: z.string().max(100).optional(),
                account_number: z.string().max(100).optional(),
                ifscCode: z.string().max(100).optional(),
                taxRegistrationNumber: z.string().max(100).optional(),
                notes: z.string().max(100).optional(),
                vendorApprovedByUserId: z.string().max(100).optional(),
                vendorLastStatusUpdatedOnDate: z.string().max(100).optional(),
            }), 
        })
    };
}


