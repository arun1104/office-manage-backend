
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { DynamoDAL, CacheStore, getUniqueId } from "@utilities";
import { IVendorInvoiceRaiseEvent } from "@interfaces";
import { MONGO_COLLECTION_NAMES } from "@constants";
const initialStatus = 'Raised By Vendor';
export async function handleInvoiceRequest({ mongoDal, context, cacheStore }:{mongoDal:MongoDBClient,dynamoDAL:DynamoDAL,context:IVendorInvoiceRaiseEvent, cacheStore:CacheStore}) {
    if (context.tenantId && context.vendorId) {
        const tenantInfo = await cacheStore.getOrgInfo(context.tenantId);
        if (tenantInfo) {
            const vendorInfo = await mongoDal.mongoRead.getItemThatMatchesAllFilters({
                resource: MONGO_COLLECTION_NAMES.vendors,
                filters:[{tenantId:context.tenantId,vendorId:context.vendorId}]
            })
            if (vendorInfo.isBlackListed) {
                console.log('Vendor is black listed. Hence wont raise invoice request')
                return;
            }
            await mongoDal.mongoCreate.createItem({
                resource: MONGO_COLLECTION_NAMES.ledgers, data: {
                    ...context,
                    status:initialStatus,
                    entryId: getUniqueId(),
                    raisedOn: Date.now().toString()
                }
            });
        }
    }
}