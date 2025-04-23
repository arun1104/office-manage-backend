import { MONGO_COLLECTION_NAMES } from "@constants";
import { ViewingLens } from "@enums";
import { ExcelUtility, MongoDBClient, S3 } from "@n-oms/multi-tenant-shared";
import { DynamoDAL, TaskUtilities } from "@utilities";
import mongoose from 'mongoose';
import { getSqsEventBody } from "serverless/libs/utils/sqs";
import { ReportMessageBody } from "./types";

export class ReportGenerationLambdaHandler {
  dynamoDAL: DynamoDAL;
  mongoDal: MongoDBClient;
  destConnection: mongoose.Connection;
  s3Client: S3;

  constructor() {
    this.dynamoDAL = new DynamoDAL();
    
    this.mongoDal = new MongoDBClient();
    this.handler = this.handler.bind(this);
    
    this.destConnection = mongoose.createConnection(process.env.mongoUrl, {});
    this.s3Client = new S3()
  }

  registerModels() {
    try {
      const reportSchema = new mongoose.Schema({
        totalPrimaryTasks: Number,
        totalCompletedTasks: Number,
        totalPendingTasks: Number,
        reportType: {
          type: String,
          default: 'CA_APP_FULL_REPORT'
        }
      }, { 
        timestamps: true, 
        strict: false 
      });
      

      this.destConnection.model(MONGO_COLLECTION_NAMES.reports, reportSchema);
    } catch (err) {
      console.error('Error registering models:', err);
    }
  }
  async handler(event) {
    console.log("event",event)
    this.registerModels();
  
    try {
      for (const record of event.Records) {
        // console.log("record",record)
        const messageBody:any = getSqsEventBody<ReportMessageBody>(record.body);
        // const messageBody = JSON.parse(record.body);
  
        
        const reqContext = {
          orgId: messageBody.orgId, 
          branchId: messageBody.branchId,
          id: messageBody.id 
        };
        
  
        console.log("reqContest",reqContext)
        
        const tasksResponse = await TaskUtilities.getTaskAssocList({
          reqContext,
          dynamoClient: this.dynamoDAL,
          viewingLens: ViewingLens.ALL_TASKS_OF_BRANCH,
          sortCondition: null,
          filter: null
        });
        // console.log("taskResponsr",tasksResponse)
  
        const totalPrimaryTasks = tasksResponse.totalCount || tasksResponse.items.length;
        const totalCompletedTasks = (tasksResponse.items as { statusId: string }[]).filter(task => task.statusId === 'completed').length;
        const totalSnoozedTasks = (tasksResponse.items as { statusId: string }[]).filter(task => task.statusId === 'snoozed').length;
        const totalNotStartedTasks = (tasksResponse.items as { statusId: string }[]).filter(task => task.statusId === 'not-started').length;
        const totalInReviewTasks = (tasksResponse.items as { statusId: string }[]).filter(task=>task.statusId === 'in-review').length
        const totalBlockedTasks = (tasksResponse.items as { statusId: string }[]).filter(task=>task.statusId === 'blocked').length
  
        console.log(
          "Total Primary tasks", totalPrimaryTasks, 
          "CompletedTasks", totalCompletedTasks, 
          "Snoozed Tasks", totalSnoozedTasks,
          "Tasks not completed",totalNotStartedTasks,
          "In review Tasks",totalInReviewTasks,
          "Blocked Tasks",totalBlockedTasks
      
        );
  
        return this.storeReportStats({
          totalPrimaryTasks,
          totalCompletedTasks,
          totalSnoozedTasks,
          totalNotStartedTasks,
          totalInReviewTasks,
          totalBlockedTasks
        });
      }
    } catch (error) {
      console.error("Error in report generation handler:", error);
      throw error;
    }
  

    // const totalPrimaryTasks = 30;
    // const totalCompletedTasks = 20;
    // const totalPendingTasks = 10;

    // console.log(
    //   "Total Primary tasks", totalPrimaryTasks, 
    //   "CompletedTasks", totalCompletedTasks, 
    //   "Pending Tasks", totalPendingTasks
    // );

    // return this.storeReportStats({
    //   totalPrimaryTasks,
    //   totalCompletedTasks,
    //   totalPendingTasks
    // });
  }

  async storeReportStats(stats) {
    try {
      // console.log("Data to be saved:", stats);

      const excelData = [
        {
          "Total Primary Tasks": stats.totalPrimaryTasks,
          "Completed Tasks": stats.totalCompletedTasks,
          "Snoozed Tasks": stats.totalSnoozedTasks,
          "Not Started Tasks": stats.totalNotStartedTasks,
          "In Review Tasks": stats.totalInReviewTasks,
          "Blocked Tasks": stats.totalBlockedTasks
        }
      ];
      const excelSheet = ExcelUtility.generateExcelBuffer(excelData, 'Dashboard Report');
      

      const s3Res = await this.s3Client.putGenericFile({
        bucket: 'n-oms-organization-config',
        key: `reports/dashboard_report_${Date.now()}.xlsx`,
        body: excelSheet,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      console.log('s3Res',JSON.stringify(s3Res))
      // console.log('excel',excelSheet)
      
      
      const ReportModel = this.destConnection.model(MONGO_COLLECTION_NAMES.reports);
      
      const savedReport = await ReportModel.create({
        ...stats,
        reportType: 'CA_APP_FULL_REPORT',
        excelFileS3Key: `reports/dashboard_report_${Date.now()}.xlsx`
      });

      

      console.log("Created new dashboard stats for today");
      return savedReport;
    } catch (error) {
      console.error("Error storing dashboard stats:", error);
      throw error;
    }
  }
}



module.exports.sqsHandler = new ReportGenerationLambdaHandler().handler;