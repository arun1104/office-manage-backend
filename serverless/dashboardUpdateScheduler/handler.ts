import mongoose from "mongoose";
import { PeriodUtilities } from "@utilities";

// interface IDashboardStats {
//   date: string;
//   dailyScans: number;
//   monthlyScans: number;
//   dailyNewUsers: number;
//   monthlyNewUsers: number;
//   timestamp: Date;
// }

export class DashboardStatsHandler {
  periodUtilities: PeriodUtilities;
  sourceConnection: mongoose.Connection;
  destConnection: mongoose.Connection;

  constructor() {
    this.periodUtilities = new PeriodUtilities();
    this.handler = this.handler.bind(this);
  }

  async initializeConnections() {
    try {
      // Connect to source database
      this.sourceConnection = await mongoose.createConnection(process.env.SOURCE_MONGO_URL);
      console.log("Connected to source database");
      
      // Connect to destination database
      this.destConnection = await mongoose.createConnection(process.env.mongoUrl);
      console.log("Connected to destination database");
      
      // Register models on both connections
      this.registerModels();
    } catch (error) {
      console.error("Error connecting to databases:", error);
      throw error;
    }
  }

  registerModels() {
    try {
      
      const sourceScansSchema = new mongoose.Schema({
        createdAt: { type: Date, required: true }
      }, { strict: false });
      
      const sourceUsersSchema = new mongoose.Schema({
        createdAt: { type: Date, required: true }
      }, { strict: false });
      
      this.sourceConnection.model("scans", sourceScansSchema);
      this.sourceConnection.model("users", sourceUsersSchema);

      
      const dashboardSchema = new mongoose.Schema({
        tenantId: { type: String, required: true, index: true },
      }, { strict: false, timestamps: true });
      const tenantsSchema = new mongoose.Schema({});
      this.destConnection.model("dashboards", dashboardSchema,"dashboards");
      this.destConnection.model("tenants", tenantsSchema,"tenants");
      console.log("Models registered successfully");
    } catch (error) {
      console.error("Error registering models:", error);
      throw error;
    }
  }

  async handler() {
    try {
      console.log("Starting handler execution");
      await this.initializeConnections();
      
      // Calculate current stats
     // const stats = await this.calculateDailyAndMonthlyStats();
     const dayWiseDataScans = await this.getDateBasedGrouping({ resource:'scans', days:30, dateAttributeName:'createdAt', filter:{} })
     const monthWiseDataScans = await this.getMonthBasedGrouping({ resource:'scans', months:12, dateAttributeName:'createdAt', filter:{} }) 
     const dayWiseDataUsers = await this.getDateBasedGrouping({ resource:'users', days:30, dateAttributeName:'createdAt', filter:{} })
     const monthWiseDataUsers = await this.getMonthBasedGrouping({ resource:'users', months:12, dateAttributeName:'createdAt', filter:{} }) 
     console.log("dayWiseDataScans", dayWiseDataScans,"monthWiseDataScans",monthWiseDataScans,"dayWiseDataUsers",dayWiseDataUsers,"monthWiseDataUsers",
        monthWiseDataUsers);

    const tenantId = await this.getQgetTenantId(process.env.accountId,'tenants');
    console.log("tenants", tenantId)

      // Store stats in destination database
      await this.storeDashboardStats({tenantId,monthWiseDataUsers,dayWiseDataUsers,dayWiseDataScans,monthWiseDataScans,createdOn: Date.now(),dashboardType:'q-get-dashboard'});
      
      // Close connections
      await this.sourceConnection.close();
      await this.destConnection.close();
      console.log("Database connections closed");
    } catch (error) {
      console.log("Error in handler:", error);
      throw error;
    }
  }

  async calculateDailyAndMonthlyStats() {
    try {
      // today's date
      const today = this.periodUtilities.get_TodayS_DateStringIn_YYYYMMDD_format("UTC");
      
      // start and end timestamp
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // start timestamp for current month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);


      const scansModel = this.sourceConnection.model("scans");
      const usersModel = this.sourceConnection.model("users");

      
      const dailyScans = await scansModel.countDocuments({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd
        }
      });

      const dailyNewUsers = await usersModel.countDocuments({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd
        }
      });

      
      const monthlyScans = await scansModel.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lte: todayEnd
        }
      });

      const monthlyNewUsers = await usersModel.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lte: todayEnd
        }
      });

      console.log("Daily counts:", { dailyScans, dailyNewUsers });
      console.log("Monthly counts:", { monthlyScans, monthlyNewUsers });

      return {
        date: today,
        dailyScans,
        monthlyScans,
        dailyNewUsers,
        monthlyNewUsers,
        dashBoardType:"q-get_dashboard",
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      throw error;
    }
  }

  async storeDashboardStats(stats) {
    try {
     console.log(stats);
      const dashboardModel = await this.destConnection.model("dashboards");
      await dashboardModel.create(stats);
      console.log("Created new dashboard stats for today");
    } catch (error) {
      console.log("Error storing dashboard stats:", error);
      throw error;
    }
  }
  
  //
  async getQgetTenantId(accountId, resource){
    const model = await this.destConnection.model(resource);
    let orgData = await model.findOne({accountId});
    orgData = JSON.parse(JSON.stringify(orgData));
    console.log('tenantId',orgData.orgIdMap["qget"])
    return orgData.orgIdMap["qget"];
  }

  async getDateBasedGrouping({ resource, days, dateAttributeName, filter }) {
    try {
      const model = await this.sourceConnection.model(resource);
      const dateRangeFilter = {
        [dateAttributeName]: {
          $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000), // Last 'days' days
          $lt: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // Less than tomorrow
        }
      };
  
      const aggregationPipeline: any[] = [
        {
          $match: {
            $and: [dateRangeFilter, filter]
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: `$${dateAttributeName}`,
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];
  
      const result = await model.aggregate(aggregationPipeline).exec();
      return result;
    } catch (error) {
      console.error('Error while grouping by date', error);
    }
  }
  

  async getMonthBasedGrouping({ resource, months, dateAttributeName, filter }) {
    try {
        const model = await this.sourceConnection.model(resource);
  
      const dateRangeFilter = {
        [dateAttributeName]: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - months, 1), // Start date (months ago)
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // End date (next month)
        },
      };
  
      const aggregationParams: any[] = [
        {
          $match: {
            $and: [dateRangeFilter, filter], // Combine the date range and additional filter
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m-%Y", date: `$${dateAttributeName}` } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: {
              $concat: [
                {
                  $switch: {
                    branches: [
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "01"] }, then: "Jan" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "02"] }, then: "Feb" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "03"] }, then: "Mar" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "04"] }, then: "Apr" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "05"] }, then: "May" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "06"] }, then: "Jun" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "07"] }, then: "Jul" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "08"] }, then: "Aug" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "09"] }, then: "Sep" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "10"] }, then: "Oct" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "11"] }, then: "Nov" },
                      { case: { $eq: [{ $substr: ["$_id", 0, 2] }, "12"] }, then: "Dec" },
                    ],
                    default: "",
                  },
                },
                "-",
                { $substr: ["$_id", 3, -1] },
              ],
            },
            count: 1,
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];
  
      const result = await model.aggregate(aggregationParams).exec();
      return result;
    } catch (error) {
      console.error('Error fetching monthly data', error);
    }
  }
}


const dashboardStatsHandler = new DashboardStatsHandler();
module.exports.sqsHandler = dashboardStatsHandler.handler;