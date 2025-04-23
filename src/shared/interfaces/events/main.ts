import { TaskOperationErrors, NotificationGroups, Actions } from "@enums";
export interface ITaskNotificationEvent {
    eventId: string;
    taskAssociationId: string;
    orgId: string;
    branchId: string;
    eventDetails: any;
    userId: string;
    userName: string;
}

export interface IVendorInvoiceRaiseEvent {
  eventId: string;
  invoiceReqId: string;
  tenantId: string;
  vendorId: string;
  eventDetails: any;
}

export interface IVendorGenericEvent {
  eventId: string;
  subEvent: string;
  tenantId: string;
  vendorId?: string;
  eventDetails: any;
}

export interface IVendorCreateEvent {
  eventId: string;
  eventDetails: {
    fullName: string;
    vendorId: string;
    phoneNumber: string;
  };
  createdBy: string;
  createdByName: string;
}

export interface IBillingInvoiceEvent {
  eventId: string;
  tenantId: string;
  eventDetails: {
    invoiceId: string;
    clientId?: string;
    invoiceStatus: string;
    invoiceStatusId: string;
    invoiceNo: string;
    taskAssociationIdList?:Array<string>
  };
  createdBy: string;
  createdByName: string;
}

export interface IClientUpdateEvent {
  eventId: string;
  tenantId: string;
  eventDetails: {
    clientId: string;
    operationId: string;
  };
  createdBy: string;
  createdByName: string;
}

export interface INewMessageEvent {
  eventId: string;
  tenantId: string;
  eventDetails: {
    userId: string;
    vendorId?: string;
    message: string;
  };
  createdBy: string;
  createdByName: string;
}

export interface IScheduledEvent {
  eventId: string;
  tenantId: string;
  eventDetails: any;
  createdBy: string;
  createdByName: string;
}

export interface IVendorInvoiceReqUpdateEvent {
  eventId: string;
  eventDetails: {
    invoiceReqId: string;
    vendorId: string;
    status: string;
    message: string;
    createdBy: string;
    createdByName: string;
    amountPaid: string;
  }
}

export interface IApplicationsSyncEvent {
  eventId: string;
  eventDetails: {
    applicationList: [];
  };
  createdBy: string;
  createdByName: string;
}

export interface IEventContext{
  branchId: string;
  orgId: string;
  userId: string;
  userName: string;
  clientId?: string;
  categoryId?: string;
  operationId: string;
  action: string;
  hierarchy: string;
  urgency: string;
  entityId: string;
  entity: string;
  eventMessage: string;
  changes?: string[]
}

export interface ITaskUserIdUpdates {
  usersToRemove: Array<{ name: string; userId: string }>;
  usersToAdd: Array<{ name: string; userId: string }>;
  updateNeeded?: boolean;
}

export interface ITaskCreationResult {
  error: boolean;
  errorType: TaskOperationErrors;
  taskAssociationId: string;
  audits: Array<any>;
  taskToBeCreated: any;
  existingTaskAssoc?: any;
}

export interface ITaskUpdateResult {
  error: boolean;
  errorType: TaskOperationErrors;
  taskAssociationId: string;
  audits: Array<any>;
  newTask: any;
  oldTask: any;
}

export interface ITaskEventDetails {
  action: Actions;
  entityName: string;
  hierarchy: string;
  entityId: string;
  group: NotificationGroups;
}
