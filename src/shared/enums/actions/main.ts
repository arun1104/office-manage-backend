export enum RedisFlush {
    FLUSH_ALL = 'FLUSH_ALL',
    FLUSH_ONLY_TENANT = 'FLUSH_ONLY_TENANT',
}

export enum MessageTypes {
    NEW_VENDOR_ONBOARDING_SHARE_LINK_SMS = 'NEW_VENDOR_ONBOARDING_SHARE_LINK_SMS',
}

export enum UpdateCollection {
    DELETE_ATTRIBUTES = 'DELETE_ATTRIBUTES',
    UPDATE_ATTRIBUTES = 'UPDATE_ATTRIBUTES',
    UPDATE_GLOBAL_SEARCH_KEY = 'UPDATE_GLOBAL_SEARCH_KEY',
}

export enum Integrations {
    MANUAL_TRIGGER = 'MANUAL_TRIGGER',
}

export enum PeriodicityOperations {
    GENERATE_PERIODS = 'GENERATE_PERIODS',
    RE_GENERATE_PERIODS = 'RE_GENERATE_PERIODS',
    UPDATE_PERIOD = 'UPDATE_PERIOD',
    UPDATE_TASK_ATTRIBUTES = 'UPDATE_TASK_ATTRIBUTES'
}

export enum TaskOperations {
    TASK_CREATE = 'TASK_CREATE',
    TASK_UPDATE = 'TASK_UPDATE'
}

export enum DeleteAble_Entities {
    VENDORS = 'vendors',
    USER_LEADS = 'userLeads',
    USERS = 'users',
    PRIMARY_TASK = 'primaryTask',
    GENERIC_TASK = 'genericTasks',
    INVOICE = 'invoices',
    ORG_ENTITIES = 'org_entities',
    PROJECT_ENTITIES = 'project_entities',
}

export enum TaskLifeCycleUpdates {
    MOVE_TO_NON_BILLABLE = 'MOVE_TO_NON_BILLABLE',
    MOVE_BACK_TO_PRIMARY = 'MOVE_BACK_TO_PRIMARY',
    DELETE_PRIMARY_TASK = 'DELETE_PRIMARY_TASK',
    DELETE_COMPLETED_TASK = 'DELETE_COMPLETED_TASK'
}

export enum TaskOperationErrors {
    TASK_ALREADY_PRESENT = 'TASK_ALREADY_PRESENT',
    TASK_ASSOCIATION_NOT_FOUND = 'TASK_ASSOCIATION_NOT_FOUND',
}

export enum DocumentProcessor {
    IMAGE_PROCESSING = 'IMAGE_PROCESSING',
}

export enum GeoProcessor {
    USERS_LAT_LONG_TO_ADDRESS = 'USERS_LAT_LONG_TO_ADDRESS',
}

export enum UserAccountUpdateOperations {
    ENABLE_UI_ACCESS = "enableUIAccess",
    DISABLE_UI_ACCESS = "disableUIAccess",
    UPDATE_PERMISSIONS = "updatePermissions",
    DEACTIVATE_USER = "deactivateUser",
    DELETE_USER = "deleteUser",
    UPDATE_USER_ATTRIBUTE = "updateUserAttribute"
}

export enum CMS_CRUD_ACTIONS {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export enum ANALYTICS_CONTEXT {
    TASK_COMPLETED = 'TASK_COMPLETED',
    TASK_INVOICES = 'TASK_INVOICES',
    PRIMARY_TASK = 'PRIMARY_TASK',
}

export enum ANALYTICS_TASK_META_ATTRIBUTES {
    TASK_NAME = 'taskName',
    TASK_CATEGORY = 'taskCategory',
    USER = 'user',
    CLIENT = 'client',
    RECURRENCE = 'recurrence',
    DEPARTMENT = 'department'
}