import { MONGO_COLLECTION_NAMES } from "@constants";
import { RedisClient, MongoDBClient } from "@n-oms/multi-tenant-shared";
export class DashboardUtils {
  redisClient: RedisClient;
  mongoDal: MongoDBClient;
    constructor() {
      this.redisClient = new RedisClient();
      this.mongoDal = new MongoDBClient();
    }

    async getOrgInfo(orgId:string) {
      try {
        const redisKey = 'info';
          let result = await this.redisClient.get({ tenantId: orgId, key: redisKey, isJSON: true });
          if (!result) {
            result = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
              resource: MONGO_COLLECTION_NAMES.tenants,filters:[{tenantId:orgId}]
            })
              await this.redisClient.set({ tenantId: orgId, key: redisKey, isJSON: true, value: result });
          }
          return result;
        } catch (err) {
          console.log(err);
          return null;
        }
    }
}