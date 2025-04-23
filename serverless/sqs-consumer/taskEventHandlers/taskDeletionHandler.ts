
import { TaskUtilities } from "@utilities";
import { DynamoDAL } from "@utilities";
import { ITaskNotificationEvent } from "@interfaces";
export async function handleTaskDeletion({ dynamoDAL, context }:{dynamoDAL:DynamoDAL,context:ITaskNotificationEvent}) {
    const reqContext = { ...context, id: context.taskAssociationId };
    const existingTaskAssoc = await TaskUtilities.getExistingTaskAssoc({ reqContext, dynamoClient: dynamoDAL });
    if (existingTaskAssoc) {
        const assigneeReviewerRows = await TaskUtilities.getAssigneeReviewerRows({ reqContext: { ...context, id: context.taskAssociationId }, dynamoClient: dynamoDAL });
        const rowsToDelete:any = assigneeReviewerRows.map((item:any) => { return { pk: item.pk, sk: item.sk } })
        rowsToDelete.push({ pk: existingTaskAssoc.pk, sk: existingTaskAssoc.sk });
        await dynamoDAL.putAndDeleteRowsInDynamoDB([], rowsToDelete)
    }
    return;
}