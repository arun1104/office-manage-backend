export const REDIS_KEYS = {
    REDIS_TASK_CONFIG_KEYS:{
        taskCategory: 'taskCategory',
        taskStatus: 'taskStatus',
        taskPeriod: 'taskPeriod',
        taskPeriodicityList: 'taskPeriodicityList',
        activeTaskList:'activeTaskList',
        taskDocType: 'taskDocType', 
        taskConfig: 'taskConfig', 
        taskUpdateReasons: 'taskUpdateReasons', 
    },
    REDIS_USER_CONFIG_KEYS: {
        userList: 'userList',
        userRoles: 'userRoles',
        userDesignations: 'userDesignations',
    },
    REDIS_CLIENT_CONFIG_KEYS :{
        clientCategory: 'clientCategory',
        clientList: 'clientList'
    },
    REDIS_REPORTING_CONFIG_KEYS :{
        reports: 'reports',
        completedReports: 'completedReports',
    },
    REDIS_ANALYTICS_CONFIG_KEYS: {
        dateRangeAnalyticsFilter: 'dateRangeAnalyticsFilter',
        analyticsFilter: 'analyticsFilter',
        completedAnalyticsFilter: 'completedAnalyticsFilter',
    }
}