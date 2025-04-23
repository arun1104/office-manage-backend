import { RequestMappers, DynamoDBClient, IGetItemParamsUsingPkSk, IGetFullListUpto10KQueryParams, ICountRows } from "@n-oms/multi-tenant-shared";
import { DYNAMO_TABLES } from "@constants";
import { IUserInfo, IDynamoResults } from "@interfaces";

export class DynamoDAL {
    tableName: string;
    dynamoRowMapper: RequestMappers;
    dynamoClient: DynamoDBClient;

    constructor() {
        this.tableName = this.setTableName();
        this.dynamoRowMapper = new RequestMappers();
        this.dynamoClient = new DynamoDBClient()
    }

    private setTableName(): string {
        return process.env.DYNAMO_TABLES_MAIN || DYNAMO_TABLES.MAIN;
    }

    public async putRowsInDynamoDB(input: any, context: { orgId: string, branchId: string, userInfo: any }) {
        input = input.map(e => ({
            ...e,
            createdOn: Date.now(),
            orgId: context.orgId,
            branchId: context.branchId,
            ...context.userInfo
        }));
        await this.dynamoClient.dynamoCreate.putBatchOfRows({
            tableName: this.tableName,
            data: this.dynamoRowMapper.batchReqMapper(input)
        });
    }

    public async putBatchOfRowsWithLimit(input: any, context: { orgId: string, branchId: string, userInfo: any }) {
        input = input.map(e => ({
            ...e,
            createdOn: Date.now(),
            orgId: context.orgId,
            branchId: context.branchId,
            ...context.userInfo
        }));
        await this.dynamoClient.dynamoCreate.putBatchOfRowsWithLimit({
            tableName: this.tableName,
            data: this.dynamoRowMapper.batchReqMapper(input)
        });
    }

    public async updateBatchOfRowsWithLimit(input: any) {
        input = input.map(e => ({
            ...e,
            updatedOn: Date.now(),
        }));
        await this.dynamoClient.dynamoCreate.putBatchOfRowsWithLimit({
            tableName: this.tableName,
            data: this.dynamoRowMapper.batchReqMapper(input)
        });
    }

    public async putUpdatedRowsInDynamoDB(rows) {
        await this.dynamoClient.dynamoCreate.putBatchOfRows({
            tableName: this.tableName,
            data: this.dynamoRowMapper.batchReqMapper(rows)
        });
    }

    public async putAndDeleteRowsInDynamoDB(rowsToPut: [], rowsToDelete: []) {
        let data: any = rowsToPut.length ? this.dynamoRowMapper.batchReqMapper(rowsToPut) : [];
        if (rowsToDelete.length) {
            data = data.concat(this.dynamoRowMapper.deleteBatchReqMapper(rowsToDelete))
        }
        await this.dynamoClient.dynamoDelete.deleteBatchOfRows({
            tableName: this.tableName,
            data
        });
    }

    public async putSingleRowInDynamoDB(input: any, context: { orgId: string, branchId: string, userInfo: any }) {
        input = {
            ...input,
            createdOn: Date.now(),
            orgId: context.orgId,
            branchId: context.branchId,
            ...context.userInfo
        }
        await this.dynamoClient.dynamoCreate.putSingleRow({
            tableName: this.tableName,
            row: input
        });
    }

    public async updateEntireRowInDynamoDB(input: any, userInfo: IUserInfo) {
        input = {
            ...input,
            updatedOn: Date.now(),
            updatedBy: userInfo.updatedByEmail,
            updatedByName: userInfo.updatedByName
        }
        await this.dynamoClient.dynamoCreate.putSingleRow({
            tableName: this.tableName,
            row: input
        });
    }

    public async getRowsFromDynamoDB(queryParams: IGetFullListUpto10KQueryParams):Promise<IDynamoResults> {
        queryParams.tableName = this.tableName;
        const dbRows = await this.dynamoClient.dynamoRead.getFullItemListUpto10KMax(queryParams);
        return dbRows;
    }

    public async patchRowInDynamoDB({keys, attributeName, newValueWithSchema}) {
        await this.dynamoClient.dynamoUpdate.patchAttribute({ tableName: this.tableName, keys, attributeName, newValueWithSchema });
    }

    public async getRowsCount(queryParams: ICountRows):Promise<number> {
        queryParams.tableName = this.tableName;
        const count = await this.dynamoClient.dynamoRead.getCountOfRows(queryParams);
        return count;
    }

    public async getRowsWithFilterFromDynamoDB(queryParams: IGetFullListUpto10KQueryParams):Promise<IDynamoResults> {
        queryParams.tableName = this.tableName;
        const dbRows = await this.dynamoClient.dynamoRead.getItemList(queryParams);
        return dbRows;
    }

    public async getSingleRowFromDynamoDB(queryParams: IGetItemParamsUsingPkSk) {
        queryParams.tableName = this.tableName;
        const dbRow = await this.dynamoClient.dynamoRead.getSingleItemWithPkAndSortKeys(queryParams);
        return dbRow;
    }

    public async getMultipleRowsUsingKeys(keys: Array<{ pk: string, sk: string }>) {
        const dynamoKeys = keys.map(key => ({
            pk: { S: key.pk },
            sk: { S: key.sk }
        }));
        const dbRows = await this.dynamoClient.dynamoRead.getMultipleRows({ keys:dynamoKeys, tableName: this.tableName }, false);
        return dbRows
    }

    async deleteItem({ pk, sk }) {
        const deleteItemParams = {
            tableName:this.tableName,
            keys: {
                pk, sk 
            }
          };
          await this.dynamoClient.dynamoDelete.deleteItem(deleteItemParams);
    }

    public async incrementAttribute(params: {
      pk: string;
      sk: string;
      attributeName: string;
      incrementBy: number;
    }): Promise<{ pk: string; sk: string }> {
      try {
          const { pk, sk, attributeName,incrementBy } = params;
          const updateParams = {
              tableName: '',
              attributeName: attributeName,            
              keys: {
                  "pk": { "S": pk },
                  "sk": { "S": sk }
              },
              newValueWithSchema: { N: `${incrementBy}` }
          };          
          await this.patchRowInDynamoDB(updateParams);
          return { pk, sk };
      } catch (error) {
          console.error('Error incrementing attribute:', {
              errorMessage: error.message,
              params,
              tableName: this.tableName
          });
          throw error;
      }
    }
}
