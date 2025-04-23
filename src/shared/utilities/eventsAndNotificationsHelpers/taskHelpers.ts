import { MONGO_COLLECTION_NAMES } from "@constants";
import { NotificationUrgency } from "@enums";
import { IEventContext, IWorkflowArg, ITaskEventDetails} from "@interfaces";
import { convertDateFormat_YYYYMMDD_to_DD_MM_YYYY } from "@utilities";

export class TaskEventsAndNotificationsHelpers {

    static getNotificationMessagesForNewTaskFileUpload({ taskDetails, uploadedBy, uploadedByName }) {
        const notifications = [];
        taskDetails.assignees.forEach(assignee => {
            if (assignee.userId !== uploadedBy) {
                notifications.push({
                    to: assignee.userId,
                    message: `New File Upload against task:${taskDetails.taskName} for Client:${taskDetails.clientName} by ${uploadedByName}.`
                });
            }
            });
            taskDetails.reviewers.forEach(reviewer => {
            if (reviewer.userId !== uploadedBy) { 
                notifications.push({
                    to: reviewer.userId,
                    message: `New File Upload against task:${taskDetails.taskName} for Client:${taskDetails.clientName} by ${uploadedByName}.`
                });
            }
        });
        return notifications;
    }

    static getNotificationMessagesForExistingTaskFileUpload({ taskDetails, uploadedBy, uploadedByName }) {
        const notifications = [];
        taskDetails.assignees.forEach(assignee => {
            if (assignee.userId !== uploadedBy) {
                notifications.push({
                    to: assignee.userId,
                    message: `File Updated against task:${taskDetails.taskName} for Client:${taskDetails.clientName} by ${uploadedByName}.`
                });
            }
            });
            taskDetails.reviewers.forEach(reviewer => {
            if (reviewer.userId !== uploadedBy) { 
                notifications.push({
                    to: reviewer.userId,
                    message: `File Updated against task:${taskDetails.taskName} for Client:${taskDetails.clientName} by ${uploadedByName}.`
                });
            }
        });
        return notifications;
    }

    static getNotificationMessagesForTaskCreation(newTaskAssociation) {
        const notifications = [];
        newTaskAssociation.assignees.forEach(assignee => {
            if (assignee.userId !== newTaskAssociation.createdByEmail) {
                notifications.push({
                    to: assignee.userId,
                    message: `You have been assigned to task:${newTaskAssociation.taskName} for Client:${newTaskAssociation.clientName} by ${newTaskAssociation.createdByName}.`
                });
            }
            });
        newTaskAssociation.reviewers.forEach(reviewer => {
            if (reviewer.userId !== newTaskAssociation.createdByEmail) { 
                notifications.push({
                    to: reviewer.userId,
                    message: `You have been asked to review the task:${newTaskAssociation.taskName} for Client:${newTaskAssociation.clientName} by ${newTaskAssociation.createdByName}.`
                });
            }
        });
        return notifications;
    }

    static getNotificationMessagesForLifeCycleEvents({ existingTaskAssociation, message, createdByName, createdByEmail }) {
        const notifications = [];
        let allUserIds = [];

        existingTaskAssociation.assignees.forEach(assignee => {
            if (assignee.userId !== existingTaskAssociation.createdByEmail) {
                allUserIds.push(assignee.userId);
            }
        });
        
        existingTaskAssociation.reviewers.forEach(reviewer => {
            if (reviewer.userId !== existingTaskAssociation.createdByEmail) {
                allUserIds.push(reviewer.userId);
            }
        });
        allUserIds = [...new Set(allUserIds)];
        allUserIds.forEach(userId => {
            if (userId !== createdByEmail) {
                notifications.push({
                    to: userId,
                    message: `${message} by ${createdByName}.`
                });
            }
            })
        return notifications;
    }

    static getTaskUpdateChanges(newTaskAssociation, oldTaskAssociation): string[] {
        const changes = [];
        if (newTaskAssociation.internalDueDate !== oldTaskAssociation.internalDueDate) {
            changes.push(`Internal due date updated from ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(oldTaskAssociation.internalDueDate)} to ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(newTaskAssociation.internalDueDate)}`);
        }

        if (newTaskAssociation.dueDate !== oldTaskAssociation.dueDate) {
            changes.push(`Due date updated from ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(oldTaskAssociation.dueDate)} to ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(newTaskAssociation.dueDate)}`);
        }
    
        if (newTaskAssociation.status !== oldTaskAssociation.status) {
            changes.push(`Status changed from ${oldTaskAssociation.status} to ${newTaskAssociation.status}`);
        }

        const oldAssigneesEmails = oldTaskAssociation.assignees.map(assignee => assignee.userId);
        const newAssignees = newTaskAssociation.assignees.filter(assignee => !oldAssigneesEmails.includes(assignee.userId));
        const removedAssignees = oldTaskAssociation.assignees.filter(assignee => !newTaskAssociation.assignees.some(a => a.userId === assignee.userId));
    
        if (newAssignees.length > 0) {
            changes.push(`New assignees added: ${newAssignees.map(a => a.name).join(', ')}`);
        }
    
        if (removedAssignees.length > 0) {
            changes.push(`Assignees removed: ${removedAssignees.map(a => a.name).join(', ')}`);
        }
    
        const oldReviewersEmails = oldTaskAssociation.reviewers.map(reviewer => reviewer.userId);
        const newReviewers = newTaskAssociation.reviewers.filter(reviewer => !oldReviewersEmails.includes(reviewer.userId));
        const removedReviewers = oldTaskAssociation.reviewers.filter(reviewer => !newTaskAssociation.reviewers.some(r => r.userId === reviewer.userId));
    
        if (newReviewers.length > 0) {
            changes.push(`New reviewers added: ${newReviewers.map(r => r.name).join(', ')}`);
        }
    
        if (removedReviewers.length > 0) {
            changes.push(`Reviewers removed: ${removedReviewers.map(r => r.name).join(', ')}`);
        }
        return changes;
    }

     static getNotificationMessagesForTaskUpdate(newTaskAssociation, oldTaskAssociation):Array<{to:string,message:string}> {
        const notifications:Array<{to:string,message:string}>= [];
         const {
            taskName, updatedByEmail, clientName,
            assignees, reviewers, updatedByName
        } = newTaskAssociation;
    
        const updatedFields = [];
        if (newTaskAssociation.internalDueDate !== oldTaskAssociation.internalDueDate) {
            updatedFields.push(`Internal due date has been updated from ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(oldTaskAssociation.internalDueDate)} to ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(newTaskAssociation.internalDueDate)}.`);
        }
        if (newTaskAssociation.dueDate !== oldTaskAssociation.dueDate) {
            updatedFields.push(`Due date has been updated from ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(oldTaskAssociation.dueDate)} to ${convertDateFormat_YYYYMMDD_to_DD_MM_YYYY(newTaskAssociation.dueDate)}.`);
        }
        if (newTaskAssociation.status !== oldTaskAssociation.status) {
            updatedFields.push(`Status has been changed from ${oldTaskAssociation.status} to ${newTaskAssociation.status}.`);
        }
        const oldAssigneesEmails = oldTaskAssociation.assignees.map(assignee => assignee.userId);
        const newAssignees = assignees.filter(assignee => !oldAssigneesEmails.includes(assignee.userId));
        const removedAssignees = oldTaskAssociation.assignees.filter(assignee => !assignees.some(a => a.userId === assignee.userId));
        const oldReviewersEmails = oldTaskAssociation.reviewers.map(reviewer => reviewer.userId);
        const newReviewers = reviewers.filter(reviewer => !oldReviewersEmails.includes(reviewer.userId));
        const removedReviewers = oldTaskAssociation.reviewers.filter(reviewer => !reviewers.some(r => r.userId === reviewer.userId));
    
        const allRecipients = [...assignees, ...reviewers];
       
        allRecipients.forEach(user => {
            if (user.userId !== updatedByEmail) {
                let message = `Task:${taskName} for client:${clientName} has been updated by ${updatedByName}.`;
                if (updatedFields.length > 0) {
                    message += ` Changes: ${updatedFields.join(' ')}`;
                }
                if (newAssignees.some(assignee => assignee.userId === user.userId)) {
                    message = `You have been assigned to task: ${taskName} for Client: ${clientName} by ${updatedByName}.`;
                }
                if (newReviewers.some(reviewer => reviewer.userId === user.userId)) {
                    message = `You have been asked to review a task: ${taskName} for Client: ${clientName} by ${updatedByName}.`;
                }
    
                notifications.push({
                    to: user.userId,
                    message
                });
            }
        });
        removedAssignees.forEach(assignee => {
            if (assignee.userId !== updatedByEmail) {
                notifications.push({
                    to: assignee.userId,
                    message: `You have been removed as an assignee from task: ${taskName} for Client: ${clientName}.`
                });
            }
        });
        removedReviewers.forEach(reviewer => {
            if (reviewer.userId !== updatedByEmail) {
                notifications.push({
                    to: reviewer.userId,
                    message: `You have been removed as a reviewer from task: ${taskName} for Client: ${clientName}.`
                });
            }
        });
        return notifications;
    }

    static getEventContextForTaskLifeCycleUpdate({ args, eventDetails,existingTask,changes }: { args: IWorkflowArg, eventDetails: ITaskEventDetails,existingTask:any,changes:any }):IEventContext {
        const eventContext: IEventContext = {
            branchId: existingTask.branchId,
            orgId: args.tenantId,
            userId: args.creationContext.createdByEmail,
            userName: args.creationContext.createdByName,
            clientId: existingTask.clientId,
            operationId: args.workflowId,
            action: eventDetails.action,
            hierarchy: eventDetails.hierarchy,
            urgency: NotificationUrgency.medium,
            entityId: eventDetails.entityId,
            entity: MONGO_COLLECTION_NAMES.taskClientAssociation,
            eventMessage: `Updated Task:${existingTask.taskName} for Client:${existingTask.clientId}`,
            changes
        }
        return eventContext;
    }

    static getEventContextForTaskUpdate({ args, eventDetails,newTask,oldTask }: { args: IWorkflowArg, eventDetails: ITaskEventDetails,newTask:any,oldTask:any }):IEventContext {
        const changes = TaskEventsAndNotificationsHelpers.getTaskUpdateChanges(newTask, oldTask);
        const eventContext: IEventContext = {
            branchId: newTask.branchId,
            orgId: args.tenantId,
            userId: args.creationContext.createdByEmail,
            userName: args.creationContext.createdByName,
            clientId: newTask.clientId,
            operationId: args.workflowId,
            action: eventDetails.action,
            hierarchy: eventDetails.hierarchy,
            urgency: NotificationUrgency.medium,
            entityId: eventDetails.entityId,
            entity: MONGO_COLLECTION_NAMES.taskClientAssociation,
            eventMessage: `Updated Task:${newTask.taskName} for Client:${newTask.clientId}`,
            changes
        }
        return eventContext;
    }

    static getEventContextForNewTaskFileUpload({ args, eventDetails }) {
        const eventContext: IEventContext = {
            branchId: args.branchId,
            orgId: args.orgId,
            userId: args.userId,
            userName: args.userName,
            clientId: eventDetails.taskDetails.clientId,
            operationId: eventDetails.operationId,
            action: eventDetails.action,
            hierarchy: eventDetails.hierarchy,
            urgency: NotificationUrgency.medium,
            entityId: eventDetails.taskDetails.id,
            entity: MONGO_COLLECTION_NAMES.taskClientAssociation,
            eventMessage: `New file uploaded: Task ${eventDetails.taskDetails.taskName} for Client:${eventDetails.taskDetails.clientId}. Doc Type:${eventDetails.docType}. File name:${eventDetails.fileName}`
        }
        return eventContext;
    }

    static getEventContextForExistingTaskFileUpload({ args, eventDetails }) {
        const eventContext: IEventContext = {
            branchId: args.branchId,
            orgId: args.orgId,
            userId: args.userId,
            userName: args.userName,
            clientId: eventDetails.taskDetails.clientId,
            operationId: eventDetails.operationId,
            action: eventDetails.action,
            hierarchy: eventDetails.hierarchy,
            urgency: NotificationUrgency.medium,
            entityId: eventDetails.taskDetails.id,
            entity: MONGO_COLLECTION_NAMES.taskClientAssociation,
            eventMessage: `File Updated: Task ${eventDetails.taskDetails.taskName} for Client:${eventDetails.taskDetails.clientId}. Doc Type:${eventDetails.docType}. File name:${eventDetails.fileName}`
        }
        return eventContext;
    }

    static getEventContextForTaskCreation({ args, eventDetails,newTask }: { args: IWorkflowArg, eventDetails: ITaskEventDetails,newTask:any }):IEventContext {
        const eventContext: IEventContext = {
            branchId: newTask.branchId,
            orgId: args.tenantId,
            userId: args.creationContext.createdByEmail,
            userName: args.creationContext.createdByName,
            clientId: newTask.clientId,
            operationId: args.workflowId,
            action: eventDetails.action,
            hierarchy: eventDetails.hierarchy,
            urgency: NotificationUrgency.medium,
            entityId: eventDetails.entityId,
            entity: MONGO_COLLECTION_NAMES.taskClientAssociation,
            eventMessage: `Created Task:${newTask.taskName} for Client:${newTask.clientId}`
        }
        return eventContext;
    }
}