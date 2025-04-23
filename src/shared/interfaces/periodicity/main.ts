export interface ITaskPeriod {
    orgId: string;
    branchId: string;
    financialYear: string;
    taskId: string;
    taskName: string;
    periodString: string;
    periodRange: string;
    dueDateString: string;
    periodSortKey: string;
    taskCreationDateString: string;
    taskCreationDateInNumber: string;
    internalDueDateString: string;
    internalDueDateInNumber: string;
    dueDateInNumber: string;
    periodicity: string;
    financialYearList: string[];
    periodList: string[];
}

export interface IConfiguredTaskUserInput {
    taskId: string;
    branchId: string;
    periodicityInput: any;
    taskName: string;
    canBeDuplicated: boolean;
    effectiveYear: string;
    untilYear: string;
    periodicity: string;
    isPeriodicallyRepeating: boolean;
    createdByEmail: string;
    createdByName: string;
    updatedByEmail: string;
    updatedByName: string;
    isActive: boolean;
    identifier: string;
    defaultAssignees?: Array<{
        name: string;
        userId: string;
      }>;
    defaultReviewers?: Array<{
        name: string;
        userId: string;
      }>;
}
  
export interface ITaskPeriodsResponse {
    financialYears?: Array<string>;
    periodList?: Array<ITaskPeriod>;
}

export interface ITaskPeriodNonRepeating {
    orgId: string;
    branchId: string;
    financialYear: string;
    taskId: string;
    taskName: string;
    periodString: string;
    periodRange: string;
    periodicity: string;
    financialYearList: string[];
    periodList: string[];
}

export interface ITaskPeriodInputForRepeating {
    taskId: string;
    orgId: string;
    branchId: string;
    dueDateInNumber: string;
    taskCreationDateInNumber: string;
    periodicity: string;
    financialYear: string;
    periodSortKey: string;
}

export interface ITaskPeriodInputForNonRepeating {
    taskId: string;
    orgId: string;
    branchId: string;
}
