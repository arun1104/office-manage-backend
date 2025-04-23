import { MONGO_COLLECTION_NAMES } from "@constants";
import { MongoDBClient } from "@n-oms/multi-tenant-shared";
import mongoose from "mongoose";
import { DynamoDAL, TaskUtilities } from "@utilities";

export class TaskMessageCountUpdateLambdaHandler {
  dynamoDAL: DynamoDAL;
  mongoDal: MongoDBClient;

  constructor() {
    this.dynamoDAL = new DynamoDAL();
    this.mongoDal = new MongoDBClient();
    this.handler = this.handler.bind(this);
  }

  registerModals() {
    try {
      mongoose.model(
        MONGO_COLLECTION_NAMES.genericTasks,
        new mongoose.Schema({}, { timestamps: true, strict: false })
      );
    } catch (error) {
      console.log(error);
    }
  }

  async handler(event) {
    this.registerModals();
    for (const record of event.Records) {
      try {
        const message: any = JSON.parse(record.body);
        const taskAssociationId = message.messageThreadId;
        const sender = message.sentById;
        const branchId = message.branchId;
        const tenantId = message.tenantId;
        const reqContext = {
          id: taskAssociationId,
          orgId: tenantId,
          branchId,
        };
        const taskInfo = await TaskUtilities.getExistingTaskAssoc({
          reqContext,
          dynamoClient: this.dynamoDAL,
        });

        await this.incrementMessageCountForAssigneesAndReviewers(
          taskInfo,
          sender,
          branchId,
          tenantId
        );
      } catch (err) {
        console.log("Error in handler", err);
      }
    }
  }

  async incrementMessageCountForAssigneesAndReviewers(
    taskInfo,
    sender,
    branchId,
    tenantId
  ) {
    let assignees = taskInfo.assignees || [];
    let reviewers = taskInfo.reviewers || [];
    const taskId = taskInfo.taskAssociationId;

    assignees = assignees.filter((e) => e.userId !== sender);
    reviewers = reviewers.filter((e) => e.userId !== sender);

    for (const assignee of assignees) {
      const params = {
        tableName: "",
        keyCondition: "#pk = :pk AND #sk = :sk",
        expressionAttributeNames: {
          "#pk": "pk",
          "#sk": "sk",
        },
        expressionAttributeValues: {
          ":pk": {
            S: `assignees#org#${tenantId}#branch#${branchId}#primaryTasks`,
          },
          ":sk": { S: `${assignee.userId}#task#${taskId}` },
        },
        isAscendingOrder: true,
      };
      const assigneeTask = await this.dynamoDAL.getRowsFromDynamoDB(params);
      if (assigneeTask.items && assigneeTask.items.length > 0) {
        await this.dynamoDAL.incrementAttribute({
          pk: assigneeTask.items[0].pk,
          sk: assigneeTask.items[0].sk,
          attributeName: "messageCount",
          incrementBy: assigneeTask.items[0].messageCount + 1,
        });
      }
    }
    for (const reviewer of reviewers) {
      const params = {
        tableName: " ",
        keyCondition: "#pk = :pk AND #sk = :sk",
        expressionAttributeNames: {
          "#pk": "pk",
          "#sk": "sk",
        },
        expressionAttributeValues: {
          ":pk": {
            S: `reviewers#org#${tenantId}#branch#${branchId}#primaryTasks`,
          }, 
          ":sk": { S: `${reviewer.userId}#task#${taskId}` },
        },
        isAscendingOrder: true,
      };
      const reviewerTask = await this.dynamoDAL.getRowsFromDynamoDB(params);
    
      if (reviewerTask.items && reviewerTask.items.length > 0) {
        await this.dynamoDAL.incrementAttribute({
          pk: reviewerTask.items[0].pk,
          sk: reviewerTask.items[0].sk,
          attributeName: "messageCount",
          incrementBy: reviewerTask.items[0].messageCount + 1,
        });
      }
    }
  }
}

const taskMessageCountUpdateLambdaHandler =
  new TaskMessageCountUpdateLambdaHandler();
module.exports.sqsHandler = taskMessageCountUpdateLambdaHandler.handler;
