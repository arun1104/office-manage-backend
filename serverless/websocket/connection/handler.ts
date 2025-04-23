import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { DynamoDAL } from "@utilities";
import { JWT_KEYS } from "@constants";

export class WebsocketConnectionLambdaHandler {
  dynamoClient: DynamoDAL;
  constructor() {
    this.dynamoClient = new DynamoDAL();
    this.handler = this.handler.bind(this);
    this.getJWTKey = this.getJWTKey.bind(this);
    this.getPem = this.getPem.bind(this);
  }

  getJWTKey(kid) {
    console.log('ORG_NAME', process.env.ORG_NAME);
    const keys = JWT_KEYS[process.env.ORG_NAME].keys;
    console.log('keys', keys);
    return keys.find(e => e.kid === kid);
  }
  
   getPem(token) {
    const tokenSections = (token || '').split('.');
    const tokenHeaderString = Buffer.from(tokenSections[0], 'base64').toString('utf8');
     const tokenHeader = JSON.parse(tokenHeaderString);
     console.log('tokenHeader', tokenHeader);
    const jwk = this.getJWTKey(tokenHeader.kid);
    const pem = jwkToPem(jwk);
    return { pem, alg: tokenHeader.alg };
  }

  async handler(event) {
    console.log('event',event);
    const token = event.queryStringParameters.token;
     const idToken = token.split(' ')[1];
    try {
      const idTokenAlgoParams = this.getPem(idToken);
      const userInfo = jwt.verify(idToken, idTokenAlgoParams.pem, { algorithms: [idTokenAlgoParams.alg] });
      if (!userInfo) {
        return {"statusCode" : 401} 
      }
      const connectionId = event["requestContext"]["connectionId"];
      const ip = event["requestContext"]["identity"]["sourceIp"];
      const dbData:any = {
        connectionId,
        ip,
        userId: userInfo.email
      };
      const dynamoParam = this.getWebsocketConnectionRow(dbData);
      const row = { ...dbData, ...dynamoParam };
      console.log('row', row);
      await this.dynamoClient.putSingleRowInDynamoDB(row, {
        orgId: "multi-tenant-noms",
        branchId: "multi-tenant-noms", userInfo: {}
      })
      return {"statusCode" : 200}
    } catch (err) { 
      console.log('err', err);
    }
  }

  getWebsocketConnectionRow({ userId, connectionId }) {
   return  {
    pk: `websockets#users#${userId}`,
    sk: `active#${connectionId}`,
    gsi2Pk: connectionId,
    gsi2Sk: connectionId
  }
  }
}

const websocketConnectionLambdaHandler = new WebsocketConnectionLambdaHandler();
module.exports.connectionHandler = websocketConnectionLambdaHandler.handler;