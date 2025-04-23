import { DYNAMO_TABLES } from "@constants";
import { IDynamoKeys, ITaskPeriodInputForRepeating,ITaskPeriodInputForNonRepeating } from "@interfaces";
import { RequestMappers } from "@n-oms/multi-tenant-shared";
export class TaskPeriodicityDynamoMapper {
     tableName: string;
    dynamoRowMapper: RequestMappers;
    constructor() {
        this.dynamoRowMapper = new RequestMappers();
        this.tableName = this.setTableName();
    }

    public getKeysForPeriodicTask(input: ITaskPeriodInputForRepeating): IDynamoKeys {
        return {
            pk: this.setPkValue(input),
            sk: this.setSkValue(input),
            gsi1Pk: this.setGsi1PkValue(input),
            gsi2Pk: this.setGsi2PkValue(input),
            gsi1Sk: this.setGsi1SkValue(),
            gsi2Sk: this.setGsi2SkValue(input)
        };
    }

    public getKeysForNonRepeatingTask(input: ITaskPeriodInputForNonRepeating): IDynamoKeys {
        return {
            pk: this.setPkValue(input),
            sk: `${input.taskId}`
        };
    }

    private setGsi1SkValue(): number {
        return Date.now();
    }

    private setGsi2PkValue({ orgId }): string {
        return `org#${orgId}#taskPeriods`;
    }

    private setGsi2SkValue({ dueDateInNumber }): string {
        return `dueDateInNumber#${dueDateInNumber}`;
    }

    private setGsi1PkValue({ taskCreationDateInNumber, orgId }): string {
        return `org#${orgId}#taskPeriods#taskCreationDateInNumber#${taskCreationDateInNumber}`;
    }

    private setPkValue({ taskId, orgId, branchId }): string {
        return `org#${orgId}#branch#${branchId}#task#${taskId}#periodicity`;
    }

    private setSkValue({ periodicity, financialYear, periodSortKey }): string {
        return `${periodicity}#${financialYear}#${periodSortKey}`;
    }

     getPeriodListQueryparams({ taskId, orgId, branchId,periodicity,fy }) {
        return {
            tableName: this.tableName,
            keyCondition: "#pk = :pkValue AND begins_with(#sk, :skPrefix)",
            expressionAttributeValues: {
                ":pkValue": { "S": this.setPkValue({ taskId, orgId, branchId }) },
                ":skPrefix": { "S": `${periodicity}#${fy}` }
            },
            expressionAttributeNames: {
                "#pk": "pk",
                "#sk": "sk"
            },
            isAscendingOrder: false,
            limit: 12,
        };
    }
      
    getTaskPeriodicityListNearCurrentFY({ orgId, taskId, fy, fyBefore, branchId,fyAfter, periodicity }): any {
        return {
            keyCondition: "#pk = :v1 AND begins_with(#sk, :v2)",
            expressionAttributeValues: {
              ":v1": { S: this.setPkValue({ taskId, orgId, branchId }) },
              ":v2": { S: `${periodicity}` },
              ":v3": { S: fy },
              ":v4": { S: fyBefore },
              ":v5": { S: fyAfter },
            },
            expressionAttributeNames: {
                "#pk": "pk",
                "#sk": "sk",
            },
            filterExpression: "(financialYear = :v3) OR (financialYear = :v4) OR (financialYear = :v5)",
            tableName: this.tableName,
          }
    }

    private setTableName(): string {
        return process.env.DYNAMO_TABLES_MAIN || DYNAMO_TABLES.MAIN;
    }
}
