import { MongoDBClient } from "@n-oms/multi-tenant-shared";
export interface ILeaveAction {
    orgId: string;
    branchId: string;
    leaveApplicationId: string;
    mongoDal: MongoDBClient; 
    userInfo: { email: string; name: string };
    reason?: string;
    leaveData?: any;
}