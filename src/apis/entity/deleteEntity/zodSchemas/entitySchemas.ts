import { getZodSchemasForUserLeadsDelete } from "./userLeadsDelete";
import { getZodSchemasForVendorDelete } from "./vendorDelete";
import { getZodSchemasForUserDelete } from "./usersDelete";
import { getZodSchemasForGenericTaskDelete } from "./genericTaskDelete";
import { getZodSchemasForInvoiceDelete } from "./invoiceDelete";
import { getZodSchemasForPrimaryTaskDelete } from "./primaryTaskDelete";
import { getZodSchemasForOrgEntitiesDelete } from "./orgEntitiesDelete";
import { getZodSchemasForProjectEntityDelete } from "./projectEntitiesDelete";

export const zodSchemas = {
    ...getZodSchemasForUserDelete(),
    ...getZodSchemasForUserLeadsDelete(),
    ...getZodSchemasForVendorDelete(),
    ...getZodSchemasForGenericTaskDelete(),
    ...getZodSchemasForInvoiceDelete(),
    ...getZodSchemasForPrimaryTaskDelete(),
    ...getZodSchemasForOrgEntitiesDelete(),
    ...getZodSchemasForProjectEntityDelete()
}