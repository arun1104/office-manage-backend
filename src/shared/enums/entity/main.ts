export enum OrgEntityTypes {
    REWARDS = 'rewards',
    ANNOUNCEMENT_POSTS = 'announcement_posts',
    OFFICE_EVENTS = 'office_events',
    OFFICE_TODOS = 'office_todos',
    USER_LOCATIONS = 'user_locations',
    REAL_TIME_MESSAGES = 'realTimeMessage',
    CMS_COLLECTIONS = 'cms_collections',
    CMS_PROJECTS = 'cms_projects',
}

export enum ReminderOccurence {
    ONCE = 'once',
    DAILY = 'daily',
    MONTHLY = 'monthly',
    WEEKLY = 'weekly',
    BIWEEKLY = 'bi_weekly',
    YEARLY = 'yearly',
    HALF_YEARLY = 'half_yearly',
    QUARTERLY = 'quarterly',
    ON_A_DAY_OF_EVERY_MONTH = 'on_a_day_of_every_month'
}

export enum OrgEntityHierarchy {
    ORG_LEVEL = 'org_level',
    BRANCH_LEVEL = 'branch_level',
    DEPARTMENT_LEVEL = 'department_level',
    TEAM_LEVEL = 'team_level',
}

export enum SummaryEntity {
    INVESTMENT_SUMMARY = 'investment_summary'
}

export enum DynamoEntity {
    ENTITY_MANAGED_FILES = 'entity_managed_files',
    TASK_CLIENT_ASSOCIATION = 'taskClientAssociation',
    TASK_PERIOD_LIST_BASED_ON_RANGE = 'taskPeriodListBasedOnRange',
    NOTIFICATIONS = 'notifications',
    EVENT_TRAILS = 'eventTrails'
}

export enum Notifications_DynamoType {
    USER_NOTIFICATIONS = 'userNotifications',
    ORG_NOTIFICATIONS = 'orgNotifications',
    BRANCH_NOTIFICATIONS = 'branchNotifications',
}

export enum ViewingLens {
    ASSIGNEE = 'assignees',
    REVIEWERS = 'reviewers',
    ALL_TASKS_OF_BRANCH = 'all_tasks_of_branch'
}

export enum TaskFilters {
    TaskId = "taskId",
    StatusId = "statusId",
    TaskSeqNumber = "taskSeqNumber",
    DueDate = "dueDate",
    InternalDueDate = "internalDueDate",
    TaskCreationDate = "taskCreationDate",
    DueDateRange = "dueDateRange",
    InternalDueDateRange = "internalDueDateRange",
    TaskCreationDateRange = "taskCreationDateRange",
    ClientId = "clientId",
    AssigneeId = "assigneeId",
    ReviewerId = "reviewerId",
    GlobalSearchKey = "globalSearchKey"
}
  
export enum Dynamo_Index_Names {
    lsi5 = "lsi5-index",
    lsi3 = "lsi3-index",
    lsi1 = "lsi1-index",
    lsi2 = "lsi2-index",
    lsi4 = "lsi4-index",
    gsi2 = "gsi2-index",
    gsi1 = "gsi1-index"
}

export enum Actions {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE'
  }