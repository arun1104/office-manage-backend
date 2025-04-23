import { getZodSchemasForBranchesAndDepartments } from "./branchesAndDepartments";
import { getZodSchemasForInvestorsAndInvestments } from "./investorsAndInvestments";
import { getZodSchemasForEmployees } from "./employees";
import { getZodSchemasForGrievances } from "./grievances";
import { getZodSchemasForClients } from "./clients";
import { getZodSchemasForProjectEntities } from "./projects";
import { getZodSchemasForExpenses } from "./expenses";
import { getZodSchemasForPayments } from "./payments";
import { getZodSchemasForVendors } from "./vendors";
import { getZodSchemasForFiles } from "./files";
import { getZodSchemasForTags } from "./tags";
import { getZodSchemasForMessages } from "./messages"
import { getZodSchemasForHardwares } from "./hardwares"
import { getZodSchemasForPaymentAccounts } from "./paymentAccounts"
import { getZodSchemasForMembership } from "./memberships"
import { getZodSchemasForIntegrations } from "./integrations"
import { getZodSchemasForJobOpenings } from "./jobOpenings"
import { getZodSchemasForCandidates } from "./candidates"
import { getZodSchemasForIncomes } from "./incomes"
import { getZodSchemasForTrainings } from "./trainings"
import { getZodSchemasForLeaveRecords } from "./leaveRecords"
import { getZodSchemasForOrgEntities } from "./orgEntities"
import { getZodSchemasForTeamsOfDeapartment } from "./teams";
import { getZodSchemasForInvoices } from "./invoices";
export const zodSchemas = {
    ...getZodSchemasForTrainings(),
    ...getZodSchemasForOrgEntities(),
    ...getZodSchemasForJobOpenings(),
    ...getZodSchemasForCandidates(),
    ...getZodSchemasForIncomes(),
    ...getZodSchemasForIntegrations(),
    ...getZodSchemasForMembership(),
    ...getZodSchemasForPaymentAccounts(),
    ...getZodSchemasForBranchesAndDepartments(),
    ...getZodSchemasForInvestorsAndInvestments(),
    ...getZodSchemasForEmployees(),
    ...getZodSchemasForGrievances(),
    ...getZodSchemasForProjectEntities(),
    ...getZodSchemasForClients(),
    ...getZodSchemasForExpenses(),
    ...getZodSchemasForPayments(),
    ...getZodSchemasForVendors(),
    ...getZodSchemasForFiles(),
    ...getZodSchemasForTags(),
    ...getZodSchemasForMessages(),
    ...getZodSchemasForHardwares(),
    ...getZodSchemasForLeaveRecords(),
    ...getZodSchemasForTeamsOfDeapartment(),
    ...getZodSchemasForInvoices()
}