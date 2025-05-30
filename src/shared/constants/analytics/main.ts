export const ANALYTICS_FILTERS = {
   TASK_COMPLETED: {
      META_FILTERS:['taskName', 'taskCategory', 'user', 'client']
   },
   PRIMARY_TASKS: ['department',
   'task',
   'recurrence',
   'assignee',
   'reviewer',
   'assigneeName',
   'reviewerName',
   'dueDate',
   'internalDueDate',
   'period',
   'client',
   'financialYear',
   'udin',
   'description',
   'status',
      'taskCategory'],
   PRIMARY_TASK_ANALYTICS_FILTER_MAPPING:{
         DEPARTMENT: 'department',
         TASK: 'task',
         RECURRENCE: 'recurrence',
         ASSIGNEE: 'assignee',
         REVIEWER: 'reviewer',
         ASSIGNEE_NAMES: 'assigneeName',
         REVIEWER_NAMES: 'reviewerName',
         DUE_DATE: 'dueDate',
         INTERNAL_DUE_DATE: 'internalDueDate',
         PERIOD: 'period',
         FINANCIAL_YEAR: 'financialYear',
         CLIENT: 'client',
         UDIN: 'udin',
         DESCRIPTION: 'description',
         STATUS: 'status',
         TASK_CATEGORY: 'taskCategory'
     },
   REDIS_KEY_TASK_COMPLETED_PROJECTED_VALUES: 'TASK_COMPLETED_PROJECTED_VALUES',
   REDIS_KEY_PRIMARY_TASK_LIST: 'REDIS_KEY_PRIMARY_TASK_LIST'
}
