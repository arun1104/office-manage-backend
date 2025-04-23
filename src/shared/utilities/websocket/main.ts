import { WebsocketMessaging } from "@n-oms/multi-tenant-shared";
import { DynamoDAL } from "@utilities";
import { IWebsocketMessageToClient } from "@interfaces";

export class WebsocketUtility {
  dynamoClient: DynamoDAL;
  constructor() {
    this.dynamoClient = new DynamoDAL();
  }

  async sendMessagesToUsers(
    userIdList: Array<string>,
    message: IWebsocketMessageToClient
  ) {
    console.log("userIdList", userIdList);
    for (const userId of userIdList) {
      try {
        const connectionIdList: any = await this.getConnectionIdFromDynamo(
          userId
        );
        console.log("connectionIdList", connectionIdList);
        for (const connection of connectionIdList) {
          const connectionId = connection.connectionId;
          await WebsocketMessaging.sendMessageToWebsocketInApiGateway({
            connectionId,
            message,
          });
          console.log(
            "message sent to ",
            userId,
            "using connection id",
            connectionId
          );
        }
      } catch (error) {
        console.log("Error pushing message to websocket", error);
      }
    }
  }

  async getConnectionIdFromDynamo(userId) {
    const params: any = {
      keyCondition: "pk = :v1 AND begins_with(#sk, :v2)",
      expressionAttributeValues: {
        ":v1": { S: `websockets#users#${userId}` },
        ":v2": { S: "active" },
      },
      expressionAttributeNames: {
        "#sk": "sk",
      },
      tableName: "",
      isAscendingOrder: false,
    };
    const response = await this.dynamoClient.getRowsFromDynamoDB(params);
    return response.items;
  }
}
