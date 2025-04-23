import { MONGO_COLLECTION_NAMES, Identifiers } from "@constants";
import { LeaveStatus, OrgEntityHierarchy } from "@enums";
import { getUniqueId } from "@utilities";
import { ILeaveAction } from "@interfaces";

export class LeaveAndAttendanceUtilities {
    
    public static async handleLeaveApproval({ orgId, branchId, leaveApplicationId, mongoDal, userInfo, reason }: ILeaveAction) {
        await mongoDal.mongoUpdate.patchItem({
            resource: MONGO_COLLECTION_NAMES.leaveRecords,
            filters: [{ tenantId: orgId, leaveId: leaveApplicationId, branchId }],
            attributesToUpdate: {
                actionTakenBy: userInfo.email,
                actionTakenByName: userInfo.name,
                status: LeaveStatus.APPROVED,
                reason
            }
        });

        await mongoDal.mongoUpdate.patchMultipleItems({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: orgId, leaveId: leaveApplicationId, entityType: Identifiers.LEAVE_RECORDS }],
            attributesToUpdate: {
                actionTakenBy: userInfo.email,
                actionTakenByName: userInfo.name,
                status: LeaveStatus.APPROVED
            }
        });
    }

    public static async handleLeaveRejection({ orgId, branchId, leaveApplicationId, mongoDal, userInfo, reason }) {
        await mongoDal.mongoUpdate.patchItem({
            resource: MONGO_COLLECTION_NAMES.leaveRecords,
            filters: [{ tenantId: orgId, leaveId: leaveApplicationId, branchId }],
            attributesToUpdate: {
                whoDidIt: userInfo.email,
                whoDidItName: userInfo.name,
                status: LeaveStatus.REJECTED,
                reason
            }
        });

        await mongoDal.mongoUpdate.patchMultipleItems({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [
                {
                    tenantId: orgId,
                    leaveId: leaveApplicationId,
                    entityType: Identifiers.LEAVE_RECORDS
                }
            ],
            attributesToUpdate: {
                whoDidIt: userInfo.email,
                whoDidItName: userInfo.name,
                status: LeaveStatus.REJECTED
            }
        });
    }

    public static async handleLeaveCancellation({ orgId, branchId, leaveApplicationId, mongoDal }: ILeaveAction) {
        await mongoDal.mongoDelete.deleteMany({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: orgId, leaveId: leaveApplicationId, branchId }],
            matchAny: true
        });
    }

    public static async createLeaveRecords({ leaveData, mongoDal, orgId, branchId, userInfo, leaveApplicationId }: ILeaveAction) {
        for (const day of leaveData.leaveDays) {
            const leaveAlreadyExisting = await mongoDal.mongoRead.getItemThatMatchesAllFilters({
                resource: MONGO_COLLECTION_NAMES.orgEntities,
                filters: [{ tenantId: orgId, createdBy: userInfo.email, branchId }
                ],
            })
            if (!leaveAlreadyExisting) {
                const leaveRecord = {
                    tenantId: orgId,
                    entityType: Identifiers.LEAVE_RECORDS,
                    entityId: getUniqueId(),
                    branchId: branchId,
                    leaveId: leaveApplicationId,
                    date: day,
                    hierarchy: OrgEntityHierarchy.BRANCH_LEVEL,
                    name:'LeaveRecords',
                    duration: leaveData.duration,
                    leaveReason: leaveData.leaveReason,
                    leaveType: leaveData.leaveType,
                    status: LeaveStatus.APPLIED,
                    createdBy: userInfo.email,
                    createdByName: userInfo.name,
                }
                await mongoDal.mongoCreate.createItem({ resource:MONGO_COLLECTION_NAMES.orgEntities, data:leaveRecord });
            }
        }
    }

    public static async validateLeaveDays({ orgId, branchId, leaveData, mongoDal }: ILeaveAction) {
        const orgLeaveDaysRes = await mongoDal.mongoRead.getItemThatMatchesAllFilters({
            resource: MONGO_COLLECTION_NAMES.orgEntities,
            filters: [{ tenantId: orgId, branchId }
            ],
        })
        const orgLeaveDays = orgLeaveDaysRes.configuredHolidays_InYYYYMMDD;
        leaveData.days = leaveData.days.filter(day => !orgLeaveDays.includes(day));
    }
}
