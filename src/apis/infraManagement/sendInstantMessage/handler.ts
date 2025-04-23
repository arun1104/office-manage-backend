import { HTTP_RESOURCES, BAD_REQUEST } from "@constants";
import { MessageTypes } from "@enums";
import { IHandler, IReqInfo } from "@interfaces";
import { RedisClient } from "@n-oms/multi-tenant-shared";
import { WhatsappService } from "src/shared/services/whatsapp/service";
import { z } from "zod";
const SMS_VENDOR_TEMPLATE_ID = "1707172563450819693";
const SMS_SENDER_ID = "QGET";
const SMS_TATA_TEL_PE_ID = "1601169170609446052";

const templates = {
  vendorWelcomeMessage:
    "Dear Partner, Welcome to Q-Get! Start earning maximum income with us. To log into your account, click on the link https://www.q-get.in",
};
const tataTeleApiUrl =
  "https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs";
export class SendInstantMessage implements IHandler {
  operation: string;
  redisClient: RedisClient;
  operationId: string;
  resource: string;
  validations: any[];
  whatsappService: WhatsappService;
  constructor() {
    this.operation =
      HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.sendInstantMessage.operationType;
    this.operationId =
      HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.sendInstantMessage.name;
    this.resource =
      HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.sendInstantMessage.relativepath;
    this.handler = this.handler.bind(this);
    this.validations = [
      z.object({
        action: z.nativeEnum(MessageTypes),
        phone: z.string(),
      }),
    ];
    this.redisClient = new RedisClient();
    this.whatsappService = new WhatsappService({
      baseURL: process.env.WHATS_APP_API_URL,
      apiKey: process.env.WHATS_APP_API_KEY,
    });
  }

  async handler(req: IReqInfo, res: any) {
    const { action, phone } = req.body;
    try {
      switch (action) {
        case MessageTypes.NEW_VENDOR_ONBOARDING_SHARE_LINK_SMS:
          await this.sendVendorWelcomeMessage({ to: phone });
          // Commenting to restrat server
          await this.whatsappService.sendMessage({
            to: phone,
            parameters: [phone, "https://q-get.in"],
            campaignName: "Vendor Welcome Message",
          });
          res.status(200).send({ message: "Sent message successfully" });
          return;
        default:
          res
            .status(BAD_REQUEST.invalidReqPayload.statusCode)
            .send({ message: BAD_REQUEST.invalidReqPayload.message });
      }
    } catch (err) {
      console.log(`Error in ${this.operationId}`, err);
      res
        .status(
          HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache
            .outcomes.flushError.statusCode
        )
        .send({
          message:
            HTTP_RESOURCES.INFRA_MANAGEMENT.operationIdList.flushRedisCache
              .outcomes.flushError.message,
        });
    }
  }

  async sendVendorWelcomeMessage({ to }: { to: string }) {
    const template = templates.vendorWelcomeMessage;
    const templateId = SMS_VENDOR_TEMPLATE_ID;
    const url = this.createMessageUrl({
      to,
      message: template,
      templateId,
    });

    return await this.send(url);
  }

  async send(input: RequestInfo | URL) {
    return await fetch(input);
  }

  createMessageUrl(input) {
    const SMS_TATA_TEL_USERNAME = process.env.SMS_TATA_TEL_USERNAME;
    const SMS_TATA_TEL_PASSWORD = process.env.SMS_TATA_TEL_PASSWORD;
    const { message, templateId, to } = input;
    const encodedMessage = encodeURIComponent(message);
    const url = `${tataTeleApiUrl}?channel=2.1&recipient=${to}&contentType=3.1&dr=false&msg=${encodedMessage}&user=${SMS_TATA_TEL_USERNAME}&pswd=${SMS_TATA_TEL_PASSWORD}&sender=${SMS_SENDER_ID}&PE_ID=${SMS_TATA_TEL_PE_ID}&Template_ID=${templateId}`;
    return url;
  }
}
