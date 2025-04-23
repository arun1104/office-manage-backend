import { MONGO_COLLECTION_NAMES } from "@constants";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import { randomBytes } from "crypto";
import { withModelWrapper } from "serverless/libs/utils/handler";
import { WebsocketService } from "serverless/libs/websocket/service";
import { v4 as uuidv4 } from "uuid";
import { getSqsEventBody } from "../libs/utils/sqs";
import { RealTimeMessageBody } from "./types";

export class RealTimeMessageHandler {
  private readonly mongoDal: MongoDBClient;
  websocketService: WebsocketService;
  constructor() {
    this.mongoDal = new MongoDBClient();
    this.websocketService = new WebsocketService();
    this.handler = this.handler.bind(this);
    this.prepareMessageObject = this.prepareMessageObject.bind(this);
    this.saveVendorMessage = this.saveVendorMessage.bind(this);
    this.sendWebsocketMessage = this.sendWebsocketMessage.bind(this);
    this.prepareVendorMessageObject = this.prepareVendorMessageObject.bind(this);
    this.getUsersWithRole = this.getUsersWithRole.bind(this);
  }

  async handler(event: any) {
    console.log("event", event);
    for (const record of event.Records) {
      console.log("record", record);
      const body: any = getSqsEventBody<RealTimeMessageBody>(record.body);
      body.entityId = uuidv4();
      body.entity = MONGO_COLLECTION_NAMES.orgEntities;
      body.entityType = "realTimeMessage";
      if (!body || !body.tenantId) {
        return;
      }

      const messageObj = this.prepareMessageObject(body);

      try {
        const result = await this.mongoDal.mongoCreate.createItem({
          resource: MONGO_COLLECTION_NAMES.orgEntities,
          data: messageObj,
        });

        await this.sendWebsocketMessage(body.tenantId, body);
        console.log("Message saved to db", result);

        if (body.userType === "vendor") {
          await this.saveVendorMessage(body);
        }
        return
      } catch (error) {
        console.error("Error while saving message to db", error);
      }
    }
  }

  async getUsersWithRole(role) {
    const users = await this.mongoDal.mongoRead.getItemList({
      resource: MONGO_COLLECTION_NAMES.users,
      queryObj: { userRoles: role },
    });
    console.log("users with roles", users);
    return users;
  }

  async sendWebsocketMessage(orgId, reqBody) {
    const orgInfo = await this.mongoDal.mongoRead.getItemThatMatchesAllFilters({
      resource: MONGO_COLLECTION_NAMES.tenants,
      filters: [{ tenantId: orgId }],
    });
    console.log("orgInfo", orgInfo);
    const userRoleForWebsocket = orgInfo.websocketConfiguration.chatSupportRole;
    if (userRoleForWebsocket) {
      const usersWithRoleToSendWebsocketMessage: any = await this.getUsersWithRole(
        userRoleForWebsocket
      );
      const usersToSendWebsocketMessage = usersWithRoleToSendWebsocketMessage.results.map(
        (e: any) => e.email
      );
      console.log("users to send to websocket", usersToSendWebsocketMessage);
      console.log("reqBody", JSON.stringify(reqBody));
      const messageToSend = {
        type: "notification",
        message: reqBody.message,
        resourceId: reqBody.entityId,
        resource: reqBody.entity,
        urgency: "normal",
        vendorId: reqBody?.vendorId,
        phoneNumber: reqBody.senderId,
      };
      console.log("websocket messages", JSON.stringify(messageToSend));
      return await this.websocketService
        .sendWebSocketMessageToUsers({
          users: usersToSendWebsocketMessage,
          message: messageToSend,
        })
    } else {
      console.log("No role provided for websocket commnication.");
    }
  }

  private prepareMessageObject(body: any) {
    return {
      entity: "org_entities",
      entityType: "realTimeMessage",
      entityId: body.entityId,
      tenantId: body?.tenantId,
      message: body?.message,
      messageType: body?.messageType,
      messageStatus: "DELIVERED",
      userId: body?.senderId,
      sendAt: body?.sendAt,
      userType: body?.userType,
      userInfo: body?.userInfo,
    };
  }

  async saveVendorMessage(body: RealTimeMessageBody) {
    const messageObj = this.prepareVendorMessageObject(body);
    try {
      const result = await this.mongoDal.mongoCreate.createItem({
        resource: MONGO_COLLECTION_NAMES.messages,
        data: messageObj,
      });
      console.log("Saved vendor message to db", result);
    } catch (error) {
      console.error("Error while saving message to db", error);
    }
  }

  private prepareVendorMessageObject(body: RealTimeMessageBody) {
    return {
      tenantId: body.tenantId,
      messageId: `${body.tenantId}-${body.userInfo.vendorId}-${randomBytes(
        16
      ).toString("hex")}`,
      messageThreadId: body.userInfo.vendorId,
      messageMediaType: "text",
      messageFlow: "Incoming",
      attachments: [],
      text: body.message,
      userReferences: [],
      entity: "messages",
      receivers: [],
      isActive: true,
      isDeleted: false,
      creationContext: "API",
      uid: randomBytes(16).toString("hex"),
    };
  }
}

const realTimeMessageHandler = new RealTimeMessageHandler();

module.exports.sqsHandler = withModelWrapper(realTimeMessageHandler.handler, {
  orgEntities: true,
  messages: true,
  tenants: true,
  users: true,
});
