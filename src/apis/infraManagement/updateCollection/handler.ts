import { HTTP_RESOURCES,BAD_REQUEST } from "@constants";
import { UpdateCollection } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { createGlobalSearchKey } from "@utilities";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
export class UpdateCollectionHandler implements IHandler {
    operation: string;
    operationId: string;
    mongoDal: MongoDBClient;
    resource: string;
    validations: any[];
    constructor() {
        this.operation = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.updateCollection.operationType;
        this.operationId = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.updateCollection.operationId;
        this.resource = HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.updateCollection.relativepath;
        this.handler = this.handler.bind(this);
        this.mongoDal = new MongoDBClient();
        this.validations = [z.object({
            filter: z.object({}).optional(),
            filters: z.array(z.object({})).optional(),
            action: z.nativeEnum(UpdateCollection),
            collection: z.string().max(50),
            batchSize: z.number().optional(),
            attributesToDelete: z.array(z.string()).optional(),
            attributesToUpdate:z.object({}).optional()
        })];
    }

    async handler(req: IReqInfo, res: any) {
        const tenantId = req.authorizationInfo.orgId;
        const filter = { ...req.body.filter,tenantId };
        const { action,batchSize,collection,attributesToDelete,attributesToUpdate } = req.body;
        let result;
        try {
            switch (action) {
                case UpdateCollection.DELETE_ATTRIBUTES:
                    result = await this.mongoDal.mongoUpdate.removeAttributesFromDocuments({
                        resource:collection,
                        filters:[filter], attributes:attributesToDelete, batchSize
                    })
                    res.status(200).send(
                        { message: 'Removed attributes',result}
                    );
                    return;
            
                case UpdateCollection.UPDATE_ATTRIBUTES:
                    if (req.body.filters) {
                        const filters = req.body.filters.map(filter => ({
                            ...filter,
                            tenantId
                        }));
                        result = await this.mongoDal.mongoUpdate.updateMultipleUsingOr({
                            resource:collection,
                            filters, attributesToUpdate
                        })
                    } else {
                        result = await this.mongoDal.mongoUpdate.updateMultipleItemsWithPagination({
                            resource:collection,
                            filters:[filter], attributesToUpdate, batchSize
                        }) 
                    }
                    res.status(200).send(
                        { message: 'Updated attributes',result}
                    );
                    return;
                case UpdateCollection.UPDATE_GLOBAL_SEARCH_KEY:
                    await this.updateGlobalSearchKey(req.body) 
                    return res.status(200).send(
                        { message: 'Updated global search key',result}
                    );
                default:
                    res.status(BAD_REQUEST.invalidReqPayload.statusCode).send(
                        { message: BAD_REQUEST.invalidReqPayload.message }
                    );
            }
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(500).send(
                { message: 'Unknown error'}
            );
        }
    }

    async updateGlobalSearchKey(body) {
        const totalDocs = await this.mongoDal.mongoRead.countEntities({ resource: body.collection, filter: {} });
        let skip = 0;
        const globalSearchKeys = HTTP_RESOURCES.NEW_ENTITY.entityList[body.collection].rules.globalSearchKeys;
        globalSearchKeys.push('vendorId');
    while (skip < totalDocs) {
        const documents = await this.mongoDal.mongoRead.getItemList({
            resource: body.collection,
            queryObj: {},
            skip: skip,
            limit: body.batchSize,
        });

        for (const doc of documents.results) {
            const existingVendor:any = doc;
            let globalSearchKey = createGlobalSearchKey(doc, globalSearchKeys);
            globalSearchKey = globalSearchKey.replace(/ /g, '-');
            await this.mongoDal.mongoUpdate.patchItem({resource:body.collection,filters:[{vendorId:existingVendor.vendorId}],attributesToUpdate:{globalSearchKey}})
        }
        skip += body.batchSize;
    }
}

}