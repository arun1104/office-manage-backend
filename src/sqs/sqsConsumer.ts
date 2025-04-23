// src/consumers/SQSConsumer.ts
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

export abstract class SQSConsumer {
    private sqsClient: SQSClient;
    private queueUrl: string;
    private isPolling: boolean;

    constructor(queueUrl: string, region: string) {
        this.sqsClient = new SQSClient({ region });
        this.queueUrl = queueUrl;
        this.isPolling = true;
    }

    abstract handleMessage(message: any): Promise<void>;

    async pollQueue(): Promise<void> {
        while (this.isPolling) {
            const receiveParams = {
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
            };

            const receiveCommand = new ReceiveMessageCommand(receiveParams);

            try {
                const { Messages } = await this.sqsClient.send(receiveCommand);

                if (Messages && Messages.length > 0) {
                    for (const message of Messages) {
                        if (message.Body) {
                            try {
                                await this.handleMessage(JSON.parse(message.Body));
                                await this.deleteMessage(message.ReceiptHandle);
                            } catch (error) {
                                console.error('Error handling message:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error receiving messages:', error);
            }
        }
    }

    private async deleteMessage(receiptHandle: string): Promise<void> {
        const deleteParams = {
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        };

        const deleteCommand = new DeleteMessageCommand(deleteParams);
        await this.sqsClient.send(deleteCommand);
    }

    stopPolling() {
        this.isPolling = false;
    }
}
