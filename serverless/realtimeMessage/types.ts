export type RealTimeMessageBody = {
    tenantId: string
    message: string
    messageType: string
    senderId: string
    sendAt: number
    userType: string
    userInfo: Record<string, unknown>
}