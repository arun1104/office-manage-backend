import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { IBillingInvoiceEvent } from "@interfaces";
import { MONGO_COLLECTION_NAMES } from "@constants";
export async function invoiceEventHandler({
  mongoDal,
  context,
}: {
  mongoDal: MongoDBClient;
  context: IBillingInvoiceEvent;
}) {
 const result =  await mongoDal.mongoUpdate.updateMultipleItemsWithPagination({
    resource: MONGO_COLLECTION_NAMES.genericTasks,
   attributesToUpdate: {
      $addToSet: { invoiceIds: context.eventDetails.invoiceId },
      latestInvoiceId: context.eventDetails.invoiceId,
      latestInvoiceNo: context.eventDetails.invoiceNo,
      latestInvoiceStatusId: context.eventDetails.invoiceStatusId,
      latestInvoiceStatus: context.eventDetails.invoiceStatus,
      latestInvoiceRaisedById: context.createdBy,
      latestInvoiceRaisedByName: context.createdByName,
      latestInvoiceRaisedOn: Date.now().toString(),
    },
    batchSize: 20,
    filters: [
      {
        tenantId: context.tenantId,
        taskAssociationId: {
          $in: context.eventDetails.taskAssociationIdList,
        },
      },
    ],
  });
  return result;
}
