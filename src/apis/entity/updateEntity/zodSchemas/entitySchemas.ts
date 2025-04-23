import { getZodSchemasForEmployeeUpdate } from "./employeeUpdate";
import { getZodSchemasForSelfUpdate } from "./selfUpdate";
import { getZodSchemasForCountUpdate } from "./countUpdate";
import { getZodSchemasForProjectEntityUpdate } from "./projectEntityUpdate";
import { getZodSchemasForClientUpdate } from "./clientUpdate";
import { getZodSchemasForMembershipUpdate } from "./membershipUpdate";
import { getZodSchemasForIntegrationUpdate } from "./integrations";
import { getZodSchemasForPaymentAccountUpdate } from "./paymentAccountUpdate";
import { getZodSchemasForPaymentUpdate } from "./paymentUpdate";
import { getZodSchemasForGrievanceUpdate } from "./grievanceUpdate";
import { getZodSchemasForVendorUpdate } from "./vendorUpdate";
import { getZodSchemasForExpenseUpdate } from "./expenseUpdate";
import { getZodSchemasForJobOpeningUpdate } from "./jobOpeningUpdate";
import { getZodSchemasForCandidateUpdate } from "./candidateUpdate";
import { getZodSchemasForHardwareUpdate } from "./hardwareUpdate";
import { getZodSchemasForIncomeUpdate } from "./incomeUpdate";
import { getZodSchemasForTrainingUpdate } from "./trainingUpdate";
import { getZodSchemasForLeaveRecordUpdate } from "./leaveRecordsUpdate";
import { getZodSchemasForLedgerUpdate } from "./ledgerUpdate";
import { getZodSchemasForInvoiceUpdate } from "./invoiceUpdate";
import { getZodSchemasForOrgEntityUpdate } from "./orgEntitiesUpdate";
import { getZodSchemasForNotificationsUpdate } from "./notificationsUpdate";
export const zodSchemas = {
    ...getZodSchemasForNotificationsUpdate(),
    ...getZodSchemasForOrgEntityUpdate(),
    ...getZodSchemasForInvoiceUpdate(),
    ...getZodSchemasForLedgerUpdate(),
    ...getZodSchemasForLeaveRecordUpdate(),
    ...getZodSchemasForTrainingUpdate(),
    ...getZodSchemasForIncomeUpdate(),
    ...getZodSchemasForHardwareUpdate(),
    ...getZodSchemasForJobOpeningUpdate(),
    ...getZodSchemasForCandidateUpdate(),
    ...getZodSchemasForExpenseUpdate(),
    ...getZodSchemasForIntegrationUpdate(),
    ...getZodSchemasForPaymentAccountUpdate(),
    ...getZodSchemasForMembershipUpdate(),
    ...getZodSchemasForEmployeeUpdate(),
    ...getZodSchemasForSelfUpdate(),
    ...getZodSchemasForCountUpdate(),
    ...getZodSchemasForProjectEntityUpdate(),
    ...getZodSchemasForClientUpdate(),
    ...getZodSchemasForPaymentUpdate(),
    ...getZodSchemasForGrievanceUpdate(),
    ...getZodSchemasForVendorUpdate()
}