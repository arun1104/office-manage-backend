export enum NotificationEvents{
    UPDATE_TASK_DUE_DATE = 'UPDATE_TASK_DUE_DATE',
    TASK_CREATED='TASK_CREATED',
    UPDATE_TASK_INTERNAL_DUE_DATE='UPDATE_TASK_INTERNAL_DUE_DATE',
    UPDATE_TASK_STATUS='UPDATE_TASK_STATUS',
    UPDATE_TASK_ASSIGNEE_ADDED='UPDATE_TASK_ASSIGNEE_ADDED',
    UPDATE_TASK_ASSIGNEE_REMOVED = 'UPDATE_TASK_ASSIGNEE_REMOVED',
    UPDATE_TASK_REVIEWER_ADDED='UPDATE_TASK_REVIEWER_ADDED',
    UPDATE_TASK_REVIEWER_REMOVED = 'UPDATE_TASK_REVIEWER_REMOVED',
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    ORG_ANNOUNCEMENT='ORG_ANNOUNCEMENT',
    TASK_FOR_REVIEW = 'TASK_FOR_REVIEW',
    SUB_TASK_ASSIGNED='SUB_TASK_ASSIGNED',
    SUB_TASK_FOR_REVIEW = 'SUB_TASK_FOR_REVIEW',
    SUB_TASK_LIST_PRESENT='SUB_TASK_LIST_PRESENT',
}

export enum NotificationGroups{
    actions = 'Action Required',
    reminders = 'Reminders',
    regular = 'regular',
}

export enum NotificationHierarchy{
    personal ='Personal',
    org = 'Organization',
    branch = 'Branch',
}

export enum NotificationUrgency{
    low='LOW',
    urgent = 'URGENT',
    medium='MEDIUM',
    high = 'HIGH',
    important='IMPORTANT',
}

export enum NotificationStatus{
    NOT_READ ='NotRead',
    READ = 'READ'
}