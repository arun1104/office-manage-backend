import { Dynamo_Index_Names } from "@enums";
import { DynamoDAL } from "@utilities";
export class WebsocketDisconnectLambdaHandler {
  dynamoClient: DynamoDAL;
  constructor() {
    this.dynamoClient = new DynamoDAL();
    this.handler = this.handler.bind(this);
  }
  async handler(event) {
    try {
      const connectionId = event["requestContext"]["connectionId"];
      const connectionData: any = await this.getConnectionRow(connectionId);
      console.log('connectionData', connectionData);
      await this.dynamoClient.deleteItem(connectionData);
      return {"statusCode" : 200}
    } catch (err) { 
      console.log('err', err);
    }
  }

  async getConnectionRow(connectionId){
    const params = {
      keyCondition: "gsi2Pk = :v1",
      expressionAttributeValues: {
        ":v1": { S: connectionId },
      },
      indexName: Dynamo_Index_Names.gsi2,
      isAscendingOrder: false,
      tableName: '',
    };
    const connectionList = await this.dynamoClient.getRowsFromDynamoDB(params);
    if (connectionList.totalCount) {
      return connectionList.items[0];
    }
  }
}

const websocketDisconnectLambdaHandler = new WebsocketDisconnectLambdaHandler();
module.exports.disconnectHandler = websocketDisconnectLambdaHandler.handler;