// src/consumers/ConsumerRegistry.ts
import { SQSConsumer } from "./sqsConsumer";

export class ConsumerRegistry {
    private consumers: { [key: string]: SQSConsumer } = {};

    registerConsumer(queueName: string, consumer: SQSConsumer) {
        this.consumers[queueName] = consumer;
    }

    getConsumer(queueName: string): SQSConsumer | undefined {
        return this.consumers[queueName];
    }

    async startAllConsumers() {
        const consumerPromises = Object.values(this.consumers).map(consumer => consumer.pollQueue());
        try {
        await Promise.all(consumerPromises);
           console.log('started all queue consumers') 
        } catch (error) {
            console.error('Could not start queue consumers') 
        }
    }
}
