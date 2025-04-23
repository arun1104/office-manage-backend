import { IWorkflowArg, IBaseAudit,IAudit } from "@interfaces";
import { MONGO_COLLECTION_NAMES,AUDIT_ACTIONS } from "@constants";
import { AuditTypes } from "@enums";
import * as util from 'util';
export class AuditHelper {

    static async createReadOnlyEntries({ input, mongoDal }: { input: Array<any>, mongoDal: { mongoCreate: { insertMany: any } } }) {
        try {
            await mongoDal.mongoCreate.insertMany({ resource: MONGO_COLLECTION_NAMES.audits, data: input })
        } catch (error) {
            console.log('Error while adding audits', error);
        }
    }

    static getBaseWorkflowAudit({ args, resourceId }: {
        args: IWorkflowArg,
        resourceId: string
    }) {
        return {
            userId: args.creationContext.createdByEmail,
            userName: args.creationContext.createdByName,
            creationContext: args.creationContext.creationContext,
            tenantId: args.tenantId,
            operationId: args.workflow,
            workflowId: args.workflowId,
            resourceId
        }
    }

    static getEntityBaseAudit(arg:IAudit) {
        return {
            ...arg.filter,
            entity: arg.entity,
            createdOn: Date.now().toString(),
            userId: arg.userId,
            userName: arg.userName,
            creationContext: arg.creationContext,
            tenantId: arg.tenantId,
            operationId: arg.operationId,
            resourceId:arg.resourceId
        }
    }

    static getEntityUpdateInitiateAudit({ baseAudit, reqBody,filter }) {
        return {
            ...baseAudit,
            ...filter,
            createdOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.update_initiated,
            reqBody
        }
    }

    static getEntityDeleteInitiateAudit({ baseAudit, reqBody,filter }) {
        return {
            ...baseAudit,
            ...filter,
            createdOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.delete_initiated,
            reqBody
        }
    }

    static getEntityFatalErrorAudit(errorAudit: IAudit) {
        const extraDetails = errorAudit.extraDetails ? (
            typeof errorAudit.extraDetails === 'string' ? errorAudit.extraDetails : util.inspect(errorAudit.extraDetails, { showHidden: true, depth: null })
        ) : '';
        return {
            ...errorAudit,
            extraDetails,
            auditType: AuditTypes.FATAL_ERROR,
        }
    }

    static getEntityUpdateAudit({ baseAudit, oldValue, newValue,filter, resourceId }) {
        return {
            ...baseAudit,
            ...filter,
            updatedOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.updated,
            oldValue,
            newValue,
            resourceId,
        }
    }

    static putResourceBackupToBeDeleteInAudit({ baseAudit, resourceToBeDeleted, resourceId }) {
        return {
            ...baseAudit,
            resourceToBeDeleted,
            resourceId,
            updatedOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.backup,
        }
    }

    static getEntityDeleteAudit({ baseAudit, filters }) {
        return {
            ...baseAudit,
            filters,
            updatedOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.deleted,
        }
    }

    static getWorkflowUpdateAudit({ baseAudit, action,oldValue, newValue,filter, resourceId }) {
        return {
            ...baseAudit,
            ...filter,
            action,
            updatedOn: Date.now().toString(),
            oldValue,
            newValue,
            resourceId
        }
    }

    static getEntityCreateAudit(arg:IAudit,resourceId:string) {
        return {
            entity: arg.entity,
            createdOn: Date.now().toString(),
            userId: arg.userId,
            userName: arg.userName,
            creationContext: arg.creationContext,
            tenantId: arg.tenantId,
            operationId: arg.operationId,
            action: AUDIT_ACTIONS.ENTITY.created,
            newValue: arg.newValue,
            resourceId,
        }
    }

    static getEntityCreateInitiateAudit({ baseAudit, reqBody }) {
        return {
            ...baseAudit,
            createdOn: Date.now().toString(),
            action: AUDIT_ACTIONS.ENTITY.create_initiated,
            reqBody
        }
    }

    static getWorkflowInitiatedAudit({ baseAudit, reqBody, action }: {
        baseAudit: IBaseAudit,
        reqBody: any, action: string
    }) {
        return {
            ...baseAudit,
            reqBody: JSON.stringify(reqBody),
            action,
            auditType: AuditTypes.INFO
        }
    }

    static getWorkflowExpectedErrorAudit({ baseAudit, message }: {
        baseAudit: IBaseAudit,
        message: string,
        extraDetails?: string
    }) {
        return {
            ...baseAudit,
            message,
            auditType: AuditTypes.EXPECTED_ERROR
        }
    }

    static getWorkflowWarningAudit({ baseAudit, message }: {
        baseAudit: IBaseAudit,
        message: string
    }) {
        return {
            ...baseAudit,
            message,
            auditType: AuditTypes.WARNING
        }
    }

    static getWorkflowNewResourceInfoAudit({ baseAudit, action, newValue, extraDetails, resourceId }: {
        baseAudit: IBaseAudit,
        action: string, newValue: string, extraDetails?: string,resourceId?:string
    }) {
        return {
            ...baseAudit,
            newValue,
            action,
            auditType: AuditTypes.INFO,
            extraDetails,
            resourceId
        }
    }

    static getWorkflowFatalErrorAudit({ baseAudit, message, extraDetails }: {
        baseAudit: IBaseAudit,
        message: string, extraDetails: string
    }) {
         extraDetails = extraDetails ? (
            typeof extraDetails === 'string' ? extraDetails : util.inspect(extraDetails, { showHidden: true, depth: null })
        ) : ''
        return {
            ...baseAudit,
            message,
            auditType: AuditTypes.FATAL_ERROR,
            extraDetails
        }
    }
}