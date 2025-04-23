import { HTTP_RESOURCES, RESPOSE_CODES, COMMON_ERROR_MESSAGES, AUDIT_ENTITY_SUB_TYPES, MONGO_COLLECTION_NAMES } from "@constants";
import { IHandler, IReqInfo } from "@interfaces";
import { FILE_OPERATIONS, NotificationHierarchy, NotificationGroups, FILE_ENTITIES } from "@enums";
import { ManagedFileUtilities, DynamoDAL, CacheStore, getHierarchy, TaskEventsAndNotificationsHelpers, EventTrailingUtilities, TaskUtilities } from "@utilities";
import { S3, MongoDBClient } from "@n-oms/multi-tenant-shared";
import { z } from 'zod';
import archiver from "archiver";
import * as stream from "stream";
import { v4 as uuidv4 } from 'uuid';


export class ManageFilesHandler implements IHandler {
    operation: string;
    eventAndNotificationUtilities: EventTrailingUtilities
    s3Client: S3;
    dynamoDAL: DynamoDAL
    operationId: string;
    resource: string;
    validations: any[];
    mongoDal: MongoDBClient;
    cacheStore: CacheStore
    constructor() {
        this.operation = HTTP_RESOURCES.FILES.operationIdList.manageFiles.operationType;
        this.operationId = HTTP_RESOURCES.FILES.operationIdList.manageFiles.name;
        this.resource = HTTP_RESOURCES.FILES.relativepath;
        this.handler = this.handler.bind(this);
        this.dynamoDAL = new DynamoDAL();
        this.cacheStore = new CacheStore();
        this.mongoDal = new MongoDBClient();
        this.validations = [z.object({
            operation: z.nativeEnum(FILE_OPERATIONS),
            fileRelativePath: z.string().optional(),
            branchId: z.string(),
            items: z.array(z.object({
                entity: z.string(),
                entityId: z.string(),
                clientId: z.string().optional(),
                docType: z.string().optional(),
                fileName: z.string().optional(),
                fileType: z.string().optional(),
                name: z.string().optional(),
                fileRelativePath: z.string()
            })).optional(),
            itemsToDelete: z.array(z.object({
                pk: z.string(),
                sk: z.string(),
            })).optional()
        })];
        this.s3Client = new S3();
        this.eventAndNotificationUtilities = new EventTrailingUtilities();
    }

    async handler(req: IReqInfo, res: any) {
        try {
            const reqContext = {
                orgId: req.authorizationInfo.orgId,
                branchId: req.body.branchId,
                userId: req.userInfo.email,
                userName: req.userInfo.name
            };
            const orgInfo = await this.cacheStore.getOrgInfo(reqContext.orgId);
            const bucket = orgInfo.bucketConfigurations.s3UploadsDownloads;
            let result;
            switch (req.body.operation) {
                case FILE_OPERATIONS.CHECK_IF_EXISTS:
                    result = await this.checkIfSameFileExists(req.body.fileRelativePath, reqContext)
                    res.status(RESPOSE_CODES.READ).send(result);
                    break;
                case FILE_OPERATIONS.UPLOAD_FILES:
                    result = await this.addFileEntriesInDynamoDB(req.body.items, reqContext);
                    res.status(RESPOSE_CODES.CREATE).send(result);
                    break;
                case FILE_OPERATIONS.GET_FILE_TREE:
                    result = await this.getS3FilesTree(req.body.entityId, orgInfo);
                    res.status(RESPOSE_CODES.READ).send(result);
                    break;
                case FILE_OPERATIONS.DELETE_FILE:
                    await this.copyFileAndDeleteFromS3(req.body.itemsToDelete, reqContext, bucket);
                    await this.removeFileEntriesFromDynamoDB(req.body.itemsToDelete);
                    res.status(RESPOSE_CODES.UPDATE_SUCCESS).send(result);
                    break;
                case FILE_OPERATIONS.DOWNLOAD_ZIP:
                    this.downloadS3Folder(req.body.entityId, res, orgInfo)
                    break;
                default:
                    break;
            }
            return;
        } catch (err) {
            console.log(`Error in ${this.operationId}`, err);
            res.status(RESPOSE_CODES.UNKNOWN_ERROR).send({
                message: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
            });
        }
    }

    getArchiverInstance(res) {
        const archiverInstance = archiver("zip", { zlib: { level: 9 } });
        archiverInstance.pipe(res);
        return archiverInstance;
    }

    async downloadS3Folder(filePrefix: string, res, orgInfo) {
        const archive = this.getArchiverInstance(res);
        const bucket = orgInfo.bucketConfigurations.s3UploadsDownloads
        const listObjectsResponse = await this.s3Client.getItemsInFolder({
            bucket,
            folderPath: filePrefix
        });
        for (const s3Object of listObjectsResponse.Contents || []) {
            const bufferResponse = await this.s3Client.getObjectBuffer({ bucket, key: s3Object.Key })
            archive.append(bufferResponse.Body as stream.Readable, {
                name: s3Object.Key || "",
            });
        }
        archive.finalize();
    }

    async checkIfSameFileExists(fileRelativePath, context) {
        const existingDynamoItemParam = ManagedFileUtilities.checkIfFilePathExists({ ...context, fileRelativePath })
        const existingItemRes = await this.dynamoDAL.getRowsWithFilterFromDynamoDB(existingDynamoItemParam);
        if (existingItemRes.totalCount) {
            return { fileAlreadyPresent: true };
        } else {
            return { fileAlreadyPresent: false };
        }
    }

    async checkIfTaskAssocPresent({ id, orgId, branchId, entity, input }) {
        const reqContext = { orgId, branchId, id };
        if (entity === FILE_ENTITIES.PRIMARY_TASK_FILES) {
            let existingTaskAssoc = await TaskUtilities.getExistingTaskAssoc({ reqContext, dynamoClient: this.dynamoDAL });
            if (!existingTaskAssoc) {
                existingTaskAssoc = await this.getEntityFromGenericTasks({  orgId, id})
            }
            return existingTaskAssoc; 
        } else {
            return input;
        }
    }
    
    async addFileEntriesInDynamoDB(items, context) {
        const rows = [];
        let newFile = true;
        const file = items[0];
        const taskDetails = await this.checkIfTaskAssocPresent({ id: file.entityId, orgId: context.orgId, branchId: context.branchId, entity:file.entity, input:file });
        for (let index = 0; index < items.length; index++) {
            const fileInfo = items[index];
            context.clientId = fileInfo.clientId;
            const existingDynamoItemParam = ManagedFileUtilities.getExistingAttachmentsWithFileName({ ...context, ...fileInfo })
            const existingItemRes = await this.dynamoDAL.getRowsWithFilterFromDynamoDB(existingDynamoItemParam);
            if (existingItemRes.totalCount) {
                newFile = false;
                const updatedItem = {
                    ...existingItemRes.items[0],
                    updatedOn: Date.now(),
                    userId: context.userId,
                    lastUploadedBy: context.userId,
                    lastUploadedByName: context.userName,
                };
                rows.push(updatedItem);
            } else {
                const newItem = ManagedFileUtilities.getNewFileEntityDynamoRow(fileInfo, context, taskDetails);
                rows.push(newItem);
            }
        }
        await this.dynamoDAL.putRowsInDynamoDB(rows, context);
        if (file.entity === FILE_ENTITIES.PRIMARY_TASK_FILES) { 
            this.addNotificationAndEventTrail({ newFile, taskDetails, context,docType:file.docType, fileName:file.fileName }) 

        }
        return rows;
    }

    async getEntityFromGenericTasks({ id, orgId }) {
        const entityDetails = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: MONGO_COLLECTION_NAMES.genericTasks, filters: [{ tenantId: orgId, 
                taskAssociationId: id }]
        });
        return entityDetails;
    }

    async addNotificationAndEventTrail({ newFile, taskDetails, context, docType, fileName }) {
        let eventContext, notificationsToSend;
        if (newFile) {
               eventContext = TaskEventsAndNotificationsHelpers.getEventContextForNewTaskFileUpload({
                args:context, eventDetails: {
                    action: FILE_OPERATIONS.UPLOAD_FILES,
                    group: NotificationGroups.regular,
                    hierarchy: NotificationHierarchy.personal,
                    entityName: AUDIT_ENTITY_SUB_TYPES.Financial_Task,
                    entityId: taskDetails.taskAssociationId,
                    workflowId: uuidv4(),
                    operationId: this.operationId,
                    taskDetails,
                    docType, fileName
                },
            });
             notificationsToSend = TaskEventsAndNotificationsHelpers.getNotificationMessagesForNewTaskFileUpload({ taskDetails, uploadedBy:context.userId, uploadedByName:context.userName });
        } else {
            eventContext = TaskEventsAndNotificationsHelpers.getEventContextForExistingTaskFileUpload({
                args:context, eventDetails: {
                    action: FILE_OPERATIONS.UPLOAD_FILES,
                    group: NotificationGroups.regular,
                    hierarchy: NotificationHierarchy.personal,
                    entityName: AUDIT_ENTITY_SUB_TYPES.Financial_Task,
                    entityId: taskDetails.taskAssociationId,
                    workflowId: uuidv4(),
                    operationId: this.operationId,
                    taskDetails,
                    docType, fileName
                },
            });
             notificationsToSend = TaskEventsAndNotificationsHelpers.getNotificationMessagesForExistingTaskFileUpload({ taskDetails, uploadedBy:context.userId, uploadedByName:context.userName });
        }
        this.eventAndNotificationUtilities.addEventTrailAndNotificationsIfNeeded(eventContext, notificationsToSend);
    }
    
    async copyFileAndDeleteFromS3(items, context, bucket) {
        for (let index = 0; index < items.length; index++) {
            const fileInfo = items[index];
            const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const s3ParamsToCopy = {
                bucketName: bucket,
                pathToFile: fileInfo.fileRelativePath,
                destinationPath: `${context.orgId}/${context.branchId}/deletedFiles/${dateString}/${fileInfo.fileRelativePath}`
            }
            await this.s3Client.copyFileToAnotherFolder(s3ParamsToCopy);
            await this.s3Client.deleteFile({ bucket, key: fileInfo.fileRelativePath });
        }
    }

    async removeFileEntriesFromDynamoDB(items) {
        items = items.map(e => ({ pk: e.pk, sk: e.sk }));
        await this.dynamoDAL.putAndDeleteRowsInDynamoDB([], items);
    }

    findDuplicatePairs(arr) {
        const duplicatePairs = [];
        const seen = {};
        for (const item of arr) {
            if (seen[item]) {
                duplicatePairs.push([item, item]);
                seen[item] = false;
            } else {
                seen[item] = true;
            }
        }

        return duplicatePairs;
    }

    getAllIds(data) {
        const ids = [];
        const objectNodes = [];
        function traverse(node) {
            if (node && node.id) {
                ids.push(node.id);
                objectNodes.push(node);
            }

            if (node && node.children && Array.isArray(node.children)) {
                node.children.forEach(child => {
                    traverse(child);
                });
            }
        }

        traverse(data);
        return { ids, objectNodes };
    }

    async getS3FilesTree(entityId, orgInfo) {
        try {
            const filePrefix = `public/${entityId}/`;
            const fileList = await this.s3Client.getItemsInFolder({
                bucket: orgInfo.bucketConfigurations.s3UploadsDownloads,
                folderPath: filePrefix
            });
            let result: any = fileList.Contents ? getHierarchy(fileList.Contents) : [];
            result = Array.from(result.values());
            const { ids: allIds, objectNodes } = this.getAllIds(result[0]);
            const duplicatePairs = this.findDuplicatePairs(allIds);

            for (const duplicatePair of duplicatePairs) {
                for (let index = 0; index < duplicatePair.length; index++) {
                    const element = duplicatePair[index];
                    const objToUpdate = objectNodes.find(e => e.id === element);
                    objToUpdate.id = `${objToUpdate.id}-${index + 1}`;
                }
            }
            return result;
        } catch (err) {
            console.log('Error in Get file tree', err)
        }
    }
}