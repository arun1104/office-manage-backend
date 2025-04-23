import { FILE_ENTITIES } from "@enums";

export class ManagedFileUtilities {
    public static getNewFileEntityDynamoRow(input, context, taskDetails) {
        let globalSearchKey;
        if (input.entity === FILE_ENTITIES.PRIMARY_TASK_FILES) {
            globalSearchKey = `${taskDetails.globalSearchKey}-${input.docType.toLowerCase()}-${input.fileName.toLowerCase()}`;
        } else {
            globalSearchKey = `${input.entityId.toLowerCase()}-${input.docType.toLowerCase()}-${input.fileName.toLowerCase()}`;
        }
        globalSearchKey = globalSearchKey.replace(/ /g, '-');
        const newRow = {
            ...input,
            orgId: context.orgId,
            branchId: context.branchId,
            userId: context.userId,
            firstUploadedBy: context.userId,
            firstUploadedByName: context.userName,
            clientId: context.clientId,
            pk: `org#${context.orgId}#branch#${context.branchId}#managedFiles`,
            sk: `attachments#${input.entity}#${input.entityId}#${Date.now()}`,
            lsi1: Date.now(),
            lsi2: input.docType,
            lsi3: input.fileType,
            lsi4: input.fileRelativePath,
            lsi5: input.fileName,
            gsi1Pk: `client#${context.clientId}#managedFiles`,
            gsi1Sk: Date.now(),
            gsi2Pk: `org#${context.orgId}#managedFiles`,
            gsi2Sk: `${input.docType}-${Date.now()}`,
            deleteProtected: true,
            globalSearchKey
        };
        return JSON.parse(JSON.stringify(newRow));
    }

    public static getExistingAttachmentsWithFileName({ orgId, branchId, fileRelativePath, entity, entityId }) {
        const params: any = {
            tableName: process.env.OMS_TABLE,
            keyCondition: "#pk = :pk AND begins_with(#sk, :sk)",
            filterExpression: "fileRelativePath = :fileRelativePath",
            expressionAttributeNames: {
                "#pk": "pk",
                "#sk": "sk"
            },
            expressionAttributeValues: {
                ":pk": { S: `org#${orgId}#branch#${branchId}#managedFiles` },
                ":sk": { S: `attachments#${entity}#${entityId}` },
                ":fileRelativePath": { S: fileRelativePath }
            },
            isAscendingOrder: true,
        };
        return params;
    }

    public static checkIfFilePathExists({ orgId, branchId, fileRelativePath }) {
        const params: any = {
            tableName: process.env.OMS_TABLE,
            keyCondition: "#pk = :pk AND begins_with(#sk, :sk)",
            filterExpression: "fileRelativePath = :fileRelativePath",
            expressionAttributeNames: {
                "#pk": "pk",
                "#sk": "sk"
            },
            expressionAttributeValues: {
                ":pk": { S: `org#${orgId}#branch#${branchId}#managedFiles` },
                ":sk": { S: `attachments` },
                ":fileRelativePath": { S: fileRelativePath }
            },
            isAscendingOrder: true,
        };
        return params;
    }
}
