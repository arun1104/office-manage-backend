
import { TaskUtilities } from "@utilities";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { DynamoDAL } from "@utilities";
import { ITaskNotificationEvent } from "@interfaces";
import { MONGO_COLLECTION_NAMES } from "@constants";
export async function handleFinalStatus({ mongoDal, dynamoDAL, context }:{mongoDal:MongoDBClient,dynamoDAL:DynamoDAL,context:ITaskNotificationEvent}) {
    //1) Remove all tasks from assignees and reviewers and then put the new task in mongo and then delete it from primary
    const reqContext = { ...context, id: context.taskAssociationId };
    const existingTaskAssoc = await TaskUtilities.getExistingTaskAssoc({ reqContext, dynamoClient: dynamoDAL });
    if (existingTaskAssoc) {

        const assigneeReviewerRows = await TaskUtilities.getAssigneeReviewerRows({ reqContext: { ...context, id: context.taskAssociationId }, dynamoClient: dynamoDAL });
        const taskToBeCloned = {
            ...existingTaskAssoc,
            entity: 'financialTasks',
            name: existingTaskAssoc.taskName,
            tenantId: existingTaskAssoc.orgId,
            movedToFinalStatusByName: context.userName,
            movedToFinalStatusById: context.userId,
            movedToFinalStatusOn: Date.now(),
            latestInvoiceStatusId: 'not-raised',
            latestInvoiceStatus: 'Not Raised',
            id: context.taskAssociationId
        };
        await mongoDal.mongoCreate.createItem({ resource: MONGO_COLLECTION_NAMES.genericTasks, data: taskToBeCloned });
        const rowsToDelete:any = assigneeReviewerRows.map((item:any) => { return { pk: item.pk, sk: item.sk } })
        rowsToDelete.push({ pk: existingTaskAssoc.pk, sk: existingTaskAssoc.sk });
        await dynamoDAL.putAndDeleteRowsInDynamoDB([], rowsToDelete)
    }
    return;
}