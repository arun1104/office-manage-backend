import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDAL } from "@utilities";

// To avoid reinitialization of client.
let apiGatewayManagementApiClient: ApiGatewayManagementApiClient;

const getApiGatewayManagementApiClient = () => {
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: process.env.WEBSOCKET_URL,
    });
  }
  return apiGatewayManagementApiClient;
};

export class WebsocketService {
  private readonly apiGatewayManagementApiClient: ApiGatewayManagementApiClient;
  dynamoClient: DynamoDAL;

  constructor() {
    this.apiGatewayManagementApiClient = getApiGatewayManagementApiClient();
    this.dynamoClient = new DynamoDAL();
    this.sendWebSocketMessageToUsers = this.sendWebSocketMessageToUsers.bind(this)
    this.getConnectionIdFromDynamo = this.getConnectionIdFromDynamo.bind(this)
    this.publishToConnection = this.publishToConnection.bind(this)
    this.getConnectionIdsArray = this.getConnectionIdsArray.bind(this)
  }

  async sendWebSocketMessageToUsers({
    users,
    message,
  }: {
    users: string[];
    message: Record<string, unknown>;
  }) {
    try {
      const connectionIdsArray = await this.getConnectionIdsArray(users);
      console.log("connectionIdsArray", connectionIdsArray);
      const websocketPromises = connectionIdsArray.map(
        async (connectionId) =>
          await this.publishToConnection({ connectionId, message })
      );
      return await Promise.all(websocketPromises);
    } catch (error) {
      console.error("Error while sending message to connection", error);
    }
  }

  async getConnectionIdsArray(users: string[]) {
    const connectionIds = [];
    for (const userId of users) {
      const userConnectionIdList = await this.getConnectionIdFromDynamo(userId);
      const userConnectionIds = userConnectionIdList.map(
        (connection) => connection.connectionId
      );
      connectionIds.push(...userConnectionIds);
    }
    return connectionIds;
  }

  async publishToConnection({
    connectionId,
    message,
  }: {
    connectionId: string;
    message: Record<string, unknown>;
  }) {
    try {
      console.log("connectionId", connectionId);
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      });
      const response = await this.apiGatewayManagementApiClient.send(command);
      return response;
    } catch (error) {
      console.error("Error while sending message to connection", error);
      return;
    }
  }

  async getConnectionIdFromDynamo(userId: string) {
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
