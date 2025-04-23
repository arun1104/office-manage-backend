export interface IWebsocketMessageToClient {
    type: string;
    message:string;
    resourceId:string;
    resource: string;
    urgency: string;
}