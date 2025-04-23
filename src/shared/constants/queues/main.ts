export const QUEUE_PREFIX = {
  TASK_NOTIFICATIONS: "TaskNotifications",
  VENDOR_CREATE: "Q-GET-vendor-migration",
};

export const QUEUE_EVENTS = {
  TASK_DELAYED: "task-delayed",
  TASK_FINAL_STATUS: "task-finalStatus",
  TASK_DELETED: "task-deleted",
  TASK_ATTRIBUTE_UPDATE: "task-attribute-update",
  TASK_ASSIGNEES_REMOVAL: "task-assignnes-removal",
  TASK_ASSIGNEES_ADDED: "task-assignnes-added",
  TASK_REVIEWERS_REMOVAL: "task-reviewers-removal",
  TASK_REVIEWERS_ADDED: "task-reviewers-added",
  VENDOR_CREATED: "vendor-created",
  SYNC_APPLICATIONS: "sync-applications",
  BILLING_INVOICE_EVENT: "billing-invoice-event",
  NEW_MESSAGE_EVENT: "new-message-event",
  VENDOR_GENERIC_EVENT: "vendor-generic-event",
  RAISE_INVOICE_REQUEST: "raise-invoice-request",
  STATUS_UPDATE_INVOICE_REQUEST: "invoice-request-status-update",
  NEW_AUTOMATED_FINANCIAL_TASK_CREATION_EVENT:
    "new_automated_financial_task_creation_event",
  UNSNOOZE_TASK: "unsnooze_task",
  MOVE_COMPLETED_TO_PRIMARY: "move_from_completed_to_primary",
  CLIENT_UPDATE_EVENT: "client-update-event",
  TASK_COUNT_UPDATE_EVENT: "task-count-update-event",
};

export const VENDOR_GENERIC_SUB_EVENTS = {
  REGISTRATION_REQUEST: "vendor-registration-request",
  PAYMENT_ACCOUNT_UPDATE_REQUEST: "vendor-account-update-request",
  LEAD_GENERATED: "user-lead-generated",
  SBI_LEAD_GENERATED: "sbi-lead-generated",
};

export const EVENT_SOURCE = {
  Automation: "Automation",
};

export const EVENT_TYPES = {
  RealTimeMessage: "realTimeMessage",
};

export const SQS_QUEUE_NAMES = {
  CMS_QUEUE_NAME: "multi-tenant-cms-queue",
};
