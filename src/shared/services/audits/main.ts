import { AuditHelper } from "@utilities";

export class AuditService {
  static  initiateAuditing({
    userId,
    userName,
    creationContext,
    tenantId,
    operationId,
    reqBody,
  }) {
    const audits = [];
    const baseAudit = AuditHelper.getEntityBaseAudit({
      userId,
      userName,
      creationContext,
      tenantId,
      operationId,
      entity: reqBody.entity,
    });
    audits.push(
      AuditHelper.getEntityCreateInitiateAudit({
        baseAudit,
        reqBody: JSON.stringify(reqBody),
      })
    );
    return { audits, baseAudit };
  }

  static async addAuditEntries({
    audits,
    baseAudit,
    newEntity,
    reqBody,
    rules,
    mongoDal,
  }) {
    audits.push(
      AuditHelper.getEntityCreateAudit(
        {
          ...baseAudit,
          newValue: JSON.stringify(newEntity),
        },
        reqBody[rules.primaryKey]
      )
    );
    AuditHelper.createReadOnlyEntries({
      input: audits,
      mongoDal,
    });
  }
}
