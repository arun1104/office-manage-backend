import { IDToken } from "@n-oms/multi-tenant-shared";
export interface IHandler {
    operation: string;
    operationId: string;
    resource: string;
    handler: (validHeader, validBody, next) => void;
    validations: Array<any>;
}

export interface IWorkflow {
    operationId: string;
    workflowHandler:(args)=>Promise<IWorkflowResp>,
    validations: Array<any>;
}

export interface Integration {
    operationId: string;
    integrationHandler:(args)=>Promise<IWorkflowResp>,
    validations: Array<any>;
}

export interface IAudit extends IBaseAudit {
    filter?: any;
    resourceId?: any;
    reqBody?: string;
    auditType?: string;
    action?: string;
    oldValue?: string;
    newValue?: string;
    extraDetails?: string;
    message?: string;
    entity?: string;
}

export interface IBaseAudit {
    userId: string;
    userName: string;
    creationContext: string;
    tenantId: string;
    operationId: string;
    workflowId?: string;
    resourceId?: string;
    
}

export interface IUserInfo {
    createdByEmail?: string;
    createdByName?: string;
    updatedByEmail?: string;
    updatedByName?: string;

}

export interface IWorkflowResp {
    statusCode: number,
    audits: Array<Partial<IBaseAudit>>,
    response: { data?: any, message: string, workflowId?: string; }
}

export interface IWorkflowArg {
    creationContext: {
        createdByEmail: string;
        createdByName: string;
        creationContext: string;
    };
    reqBody: any;
    tenantId: string;
    workflowId: string;
    workflow: any;
}

export interface IReqInfo {
    authorizationInfo: { orgId: string, branchId: string, designation: string }
    userInfo: IDToken,
    query: any;
    path: any,
    body: any,
    accessInfo:{ operationId:string }
}

export interface IDynamoResults {
    items: Record<string,any>[];
    totalCount: any;
}

export interface IUpdateEntityReqInfo {
    authorizationInfo: { orgId: string, branchId: string, designation: string }
    userInfo: IDToken,
    query: any;
    path: any,
    body: {
        entity: string, filter: any,
        attributesToUpdate?: any,
        attributeToUpdate?: any,
        incrementBy?: number,
        clearAll?: any,
        branchId?: string
    },
    accessInfo:{ operationId:string }
}

export interface IDeleteEntityReqInfo {
    authorizationInfo: { orgId: string, branchId: string, designation: string }
    userInfo: IDToken,
    query: any;
    path: any,
    body: {
        entity: string,
        filters: Array<any>
    },
    accessInfo:{ operationId:string }
}