export const OPERATION_ID_LIST = {
  getConfiguration: "getConfiguration",
  flushRedisCache: "flushRedisCache",
  manageFiles: "manageFiles",
  getUserList: "getUserList",
  getOrgInfo: "getOrgInfo",
  createBranch: "createBranch",
  createDepartment: "createDepartment",
  createTeam: "createTeam",
  createAuditClient: "createAuditClient",
  createEmployee: "createEmployee",
  getEmployees: "getEmployees",
  getOrgBranches: "getOrgBranches",
  getDepartmentsOfBranch: "getDepartmentsOfBranch",
  getTeamsOfDepartments: "getTeamsOfDepartments",
  getInvestorsList: "getInvestorsList",
  addInvestor: "addInvestor",
  addInvestment: "addInvestment",
  getInvestmentsList: "getInvestmentsList",
  createGrievance: "createGrievance",
  getGrievances: "getGrievances",
  replaceConfiguration: "replaceConfiguration",
  createExpense: "createExpense",
  createIncome: "createIncome",
  updateIncome: "updateIncome",
  getExpenses: "getExpenses",
  getIncomes: "getIncomes",
  createProjectEntity: "createProjectEntity",
  getProjectEntityList: "getProjectEntityList",
  createClient: "createClient",
  getClientList: "getClientList",
  createPayment: "createPayment",
  uploadFile: "uploadFile",
  downloadFile: "downloadFile",
  getPayments: "getPayments",
  getVendors: "getVendors",
  createVendor: "createVendor",
  updateTags: "updateTags",
  getTags: "getTags",
  updateSelf: "updateSelf",
  updateProjectEntity: "updateProjectEntity",
  updateEmployee: "updateEmployee",
  updateTenant: "updateTenant",
  sendMessage: "sendMessage",
  viewMessages: "viewMessages",
  updateCount: "updateCount",
  onboardUser: "onboardUser",
  createHardware: "createHardware",
  getHardwares: "getHardwares",
  updateClient: "updateClient",
  addPaymentAccount: "addPaymentAccount",
  addMembership: "addMembership",
  getPaymentAccounts: "getPaymentAccounts",
  getMemberships: "getMemberships",
  updatePaymentAccount: "updatePaymentAccount",
  updateMembership: "updateMembership",
  getAudits: "getAudits",
  addIntegration: "addIntegration",
  getIntegrations: "getIntegrations",
  triggerIntegration: "triggerIntegration",
  updatePayment: "updatePayment",
  updateGrievance: "updateGrievance",
  updateVendor: "updateVendor",
  updateExpense: "updateExpense",
  createJobOpening: "createJobOpening",
  getJobOpenings: "getJobOpenings",
  updateJobOpening: "updateJobOpening",
  createCandidate: "createCandidate",
  getCandidates: "getCandidates",
  updateCandidate: "updateCandidate",
  updateHardware: "updateHardware",
  advanceSearchAndFiltering: "advanceSearchAndFiltering",
  updateUserAccount: "updateUserAccount",
  createTraining: "createTraining",
  getTrainings: "getTrainings",
  updateTraining: "updateTraining",
  createLeaveRecord: "createLeaveRecord",
  getLeaveRecords: "getLeaveRecords",
  updateLeaveRecord: "updateLeaveRecord",
  updateCollection: "updateCollection",
  addOrgEntity: "addOrgEntity",
  updateOrgEntity: "updateOrgEntity",
  createSummary: "createSummary",
  getSummary: "getSummary",
  documentToText: "documentToText",
  generateTaskPeriodicity: "generateTaskPeriodicity",
  getPeriodsOfTask: "getPeriodsOfTask",
  updatePeriodOfTask: "updatePeriodOfTask",
  taskAssignment: "taskAssignment",
  analytics: "analytics",
  getDynamoEntities: "getDynamoEntities",
  createInvoice: "createInvoice",
  getInvoice: "getInvoice",
  updateInvoice: "updateInvoice",
  getVendorDashboardData: "getVendorDashboardData",
  updateVendorRequest: "updateVendorRequest",
  updateNotifications: "updateNotifications",
  sendInstantMessage: "sendInstantMessage",
  manageCalendarEvents: "manageCalendarEvents",
  dashboards: "dashboards",
  manageTaskLifeCycle: "manageTaskLifeCycle",
  deleteUserLeads: "deleteUserLeads",
  deleteVendor: "deleteVendor",
  processLocations: "processLocations",
  deleteUser: "deleteUser",
  deletePrimaryTask: "deletePrimaryTask",
  deleteGenericTask: "deleteGenericTask",
  deleteInvoice: "deleteInvoice",
  deleteOrgEntities: "deleteOrgEntities",
  manageLeave: "manageLeave",
  manageAttendance: "manageAttendance",
  deleteProjectEntity: "deleteProjectEntity",
  cmsCrud: "cmsCrud",
  presignedUrl: "presignedUrl",
};

export const Entity_Creation_Helper_Constants = {
  DYNAMIC_PARENT: "parent_from_req_body",
};
export const MONGO_COLLECTION_NAMES = {
  users: "users",
  tenants: "tenants",
  branches: "branches",
  teams: "teams",
  departments: "departments",
  auditClients: "auditClients",
  employees: "employees",
  investors: "investors",
  investments: "investments",
  grievances: "grievances",
  project_entities: "project_entities",
  clients: "clients",
  payments: "payments",
  expenses: "expenses",
  incomes: "incomes",
  files: "files",
  vendors: "vendors",
  tags: "tags",
  messages: "messages",
  audits: "audits",
  notifications: "notifications",
  counts: "counts",
  hardwares: "hardwares",
  payment_accounts: "payment_accounts",
  memberships: "memberships",
  integrations: "integrations",
  candidates: "candidates",
  jobOpenings: "jobOpenings",
  trainings: "trainings",
  leaveRecords: "leaveRecords",
  orgEntities: "org_entities",
  summary: "summary",
  userInputs: "user_inputs",
  genericTasks: "generic_tasks",
  invoices: "invoices",
  ledgers: "ledgers",
  taskClientAssociation: "taskClientAssociation",
  reports: "reports",
  blogs: "blogs",
  bookings: "bookings",
};

export const DYNAMO_ENTITIES = {
  PRIMARY_TASK: "primaryTask",
};
export const HTTP_METHODS = {
  PUT: "put",
  POST: "post",
  DELETE: "delete",
  PATCH: "patch",
  GET: "get",
};

export const OPERATIONS = {
  CREATE: "create",
  READ: "read",
  REPLACE: "replace",
  DELETE: "delete",
  UPDATE: "update",
  INVOKE: "invoke",
};

export const RESPOSE_CODES = {
  CREATE: 201,
  READ: 200,
  UPDATE_SUCCESS: 200,
  DELETE: 204,
  DUPLICATE: 409,
  UPDATE_SUCCESS_NO_CONTENT: 204,
  UNKNOWN_ERROR: 500,
  BAD_INPUT: 400,
  UNAUTHORIZED: 401,
  RESOURCE_NOT_FOUND: 404,
};

export const COMMON_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  BAD_REQUEST: "Bad Request",
  ROUTE_NOT_REGISTERED: "Check if Route is registered",
  FLAG_NOT_ENABLED: "Flag not enabled",
  ALREADY_EXISTS: "Already present",
};

export const HTTP_RESOURCES = {
  WORKFLOW: {
    name: "workflows",
    label: "Work Flow",
    relativepath: "workflows",
    operationIdList: {
      onboardUser: {
        name: OPERATION_ID_LIST.onboardUser,
        label: "User Onboarding",
        operationType: OPERATIONS.INVOKE,
        outcomes: {
          onboardedSuccessfully: {
            name: "User_Onboarded_Succssfully",
            statusCode: RESPOSE_CODES.UPDATE_SUCCESS,
            message: "User onboarded succssfully",
          },
        },
      },
      userAccountUpdate: {
        name: OPERATION_ID_LIST.updateUserAccount,
        label: "User Account Update",
        operationType: OPERATIONS.INVOKE,
      },
      createSummary: {
        name: OPERATION_ID_LIST.createSummary,
        label: "Summary creation",
        operationType: OPERATIONS.INVOKE,
      },
      documentToText: {
        name: OPERATION_ID_LIST.documentToText,
        label: "Document to text conversion",
        operationType: OPERATIONS.INVOKE,
      },
      generateTaskPeriodicity: {
        name: OPERATION_ID_LIST.generateTaskPeriodicity,
        label: "Generate, regenerate or update periods",
        operationType: OPERATIONS.INVOKE,
      },
      taskAssignment: {
        name: OPERATION_ID_LIST.taskAssignment,
        label: "Assign,Update task of a client to assignees and reviewers",
        operationType: OPERATIONS.INVOKE,
      },
      manageTaskLifeCycle: {
        name: OPERATION_ID_LIST.manageTaskLifeCycle,
        label: "Manage life cycle of a task",
        operationType: OPERATIONS.INVOKE,
      },
      processLocations: {
        name: OPERATION_ID_LIST.processLocations,
        label: "process lat long locations",
        operationType: OPERATIONS.INVOKE,
      },
      manageLeave: {
        name: OPERATION_ID_LIST.manageLeave,
        label: "Manage User leaves",
        operationType: OPERATIONS.INVOKE,
      },
      analytics: {
        name: OPERATION_ID_LIST.analytics,
        label: "Analyse data",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  ENTITY: {
    name: "entities",
    label: "Entities",
    relativepath: "entities",
    entityList: {
      integrations: {
        name: MONGO_COLLECTION_NAMES.integrations,
        operationId: OPERATION_ID_LIST.getIntegrations,
      },
      summary: {
        name: MONGO_COLLECTION_NAMES.summary,
        operationId: OPERATION_ID_LIST.getSummary,
      },
      audits: {
        name: MONGO_COLLECTION_NAMES.audits,
        operationId: OPERATION_ID_LIST.getAudits,
      },
      payment_accounts: {
        name: MONGO_COLLECTION_NAMES.payment_accounts,
        operationId: OPERATION_ID_LIST.viewMessages,
      },
      memberships: {
        name: MONGO_COLLECTION_NAMES.memberships,
        operationId: OPERATION_ID_LIST.viewMessages,
      },
      messages: {
        name: MONGO_COLLECTION_NAMES.messages,
        operationId: OPERATION_ID_LIST.viewMessages,
      },
      users: {
        name: MONGO_COLLECTION_NAMES.users,
        operationId: OPERATION_ID_LIST.getUserList,
      },
      tenants: {
        name: MONGO_COLLECTION_NAMES.tenants,
        operationId: OPERATION_ID_LIST.getOrgInfo,
        populate: [{ path: "branches" }],
      },
      branches: {
        name: MONGO_COLLECTION_NAMES.branches,
        operationId: OPERATION_ID_LIST.getOrgBranches,
        populate: [{ path: "tenantInfo" }],
      },
      departments: {
        name: MONGO_COLLECTION_NAMES.departments,
        operationId: OPERATION_ID_LIST.getDepartmentsOfBranch,
        populate: [{ path: "branchInfo" }],
      },
      investors: {
        name: MONGO_COLLECTION_NAMES.investors,
        operationId: OPERATION_ID_LIST.getInvestorsList,
      },
      investments: {
        name: MONGO_COLLECTION_NAMES.investments,
        operationId: OPERATION_ID_LIST.getInvestmentsList,
      },
      employees: {
        name: MONGO_COLLECTION_NAMES.employees,
        operationId: OPERATION_ID_LIST.getEmployees,
      },
      grievances: {
        name: MONGO_COLLECTION_NAMES.grievances,
        operationId: OPERATION_ID_LIST.getGrievances,
      },
      project_entities: {
        name: MONGO_COLLECTION_NAMES.project_entities,
        operationId: OPERATION_ID_LIST.getProjectEntityList,
        populate: [{ path: "parentInfo", model: "project_entities" }],
      },
      clients: {
        name: MONGO_COLLECTION_NAMES.clients,
        operationId: OPERATION_ID_LIST.getClientList,
      },
      expenses: {
        name: MONGO_COLLECTION_NAMES.expenses,
        operationId: OPERATION_ID_LIST.getExpenses,
      },
      incomes: {
        name: MONGO_COLLECTION_NAMES.incomes,
        operationId: OPERATION_ID_LIST.getIncomes,
      },
      payments: {
        name: MONGO_COLLECTION_NAMES.payments,
        operationId: OPERATION_ID_LIST.getPayments,
      },
      vendors: {
        name: MONGO_COLLECTION_NAMES.vendors,
        operationId: OPERATION_ID_LIST.getVendors,
      },
      files: {
        name: MONGO_COLLECTION_NAMES.files,
        operationId: OPERATION_ID_LIST.downloadFile,
        isDynamicParent: true,
        isConditionalPopulate: true,
        populate: [{ path: "parentInfo", model: "dynamic" }],
      },
      tags: {
        name: MONGO_COLLECTION_NAMES.tags,
        operationId: OPERATION_ID_LIST.getTags,
      },
      hardwares: {
        name: MONGO_COLLECTION_NAMES.hardwares,
        operationId: OPERATION_ID_LIST.getHardwares,
      },
      candidates: {
        name: MONGO_COLLECTION_NAMES.candidates,
        operationId: OPERATION_ID_LIST.getCandidates,
      },
      jobOpenings: {
        name: MONGO_COLLECTION_NAMES.jobOpenings,
        operationId: OPERATION_ID_LIST.getJobOpenings,
      },
      trainings: {
        name: MONGO_COLLECTION_NAMES.trainings,
        operationId: OPERATION_ID_LIST.getTrainings,
      },
      leaveRecords: {
        name: MONGO_COLLECTION_NAMES.leaveRecords,
        operationId: OPERATION_ID_LIST.getLeaveRecords,
      },
      invoices: {
        name: MONGO_COLLECTION_NAMES.invoices,
        operationId: OPERATION_ID_LIST.getInvoice,
      },
      vendorDashboard: {
        name: "vendorDashboard",
        operationId: OPERATION_ID_LIST.getVendorDashboardData,
      },
    },
    operationType: OPERATIONS.READ,
  },
  NEW_ENTITY: {
    name: "new_entity",
    label: "New Entity",
    relativepath: "new_entity",
    entityList: {
      integrations: {
        name: MONGO_COLLECTION_NAMES.integrations,
        operationId: OPERATION_ID_LIST.addIntegration,
        rules: {
          primaryKey: "integrationId",
          primaryKeyFormat: ["uid"],
        },
      },
      payment_accounts: {
        name: MONGO_COLLECTION_NAMES.payment_accounts,
        operationId: OPERATION_ID_LIST.addPaymentAccount,
        rules: {
          primaryKey: "paymentAccountId",
          primaryKeyFormat: ["uid"],
        },
      },
      memberships: {
        name: MONGO_COLLECTION_NAMES.memberships,
        operationId: OPERATION_ID_LIST.addMembership,
        rules: {
          primaryKey: "membershipId",
          primaryKeyFormat: ["uid"],
        },
      },
      messages: {
        name: MONGO_COLLECTION_NAMES.messages,
        operationId: OPERATION_ID_LIST.sendMessage,
        rules: {
          primaryKey: "messageId",
          primaryKeyFormat: ["messageThreadId", "uid"],
          sendWebsocketMessage: true,
        },
      },
      branches: {
        name: MONGO_COLLECTION_NAMES.branches,
        operationId: OPERATION_ID_LIST.createBranch,
        rules: {
          parent: MONGO_COLLECTION_NAMES.tenants,
          parentQueryAttributeName: "tenantId",
          pushChildrenToParent: true,
          attachParent: true,
          newAttributeNameForParentReference: "tenantInfo",
          uniqueAttributes: ["branchName"],
          primaryKey: "branchId",
          primaryKeyFormat: ["branchName", "location"],
        },
      },
      departments: {
        name: MONGO_COLLECTION_NAMES.departments,
        operationId: OPERATION_ID_LIST.createDepartment,
        rules: {
          parent: MONGO_COLLECTION_NAMES.branches,
          parentQueryAttributeName: "branchId",
          newAttributeNameForParentReference: "branchInfo",
          isTenantIdAlreadyPartOfPrimaryKey: true,
          pushChildrenToParent: true,
          attachParent: true,
          primaryKey: "departmentId",
          primaryKeyFormat: ["branchId", "departmentName"],
        },
      },
      teams: {
        name: MONGO_COLLECTION_NAMES.teams,
        operationId: OPERATION_ID_LIST.createTeam,
        rules: {
          parent: MONGO_COLLECTION_NAMES.departments,
          parentQueryAttributeName: "departmentId",
          newAttributeNameForParentReference: "departmentInfo",
          isTenantIdAlreadyPartOfPrimaryKey: true,
          pushChildrenToParent: true,
          attachParent: true,
          primaryKey: "teamId",
          primaryKeyFormat: ["departmentId", "teamName"],
        },
      },
      employees: {
        name: MONGO_COLLECTION_NAMES.employees,
        operationId: OPERATION_ID_LIST.createEmployee,
        rules: {
          uniqueAttributes: ["email", "userId"],
          primaryKey: "employeeId",
          primaryKeyFormat: ["name", "phoneNumber"],
        },
      },
      grievances: {
        name: MONGO_COLLECTION_NAMES.grievances,
        operationId: OPERATION_ID_LIST.createGrievance,
        rules: {
          primaryKey: "grievanceId",
          primaryKeyFormat: ["uid"],
        },
      },
      expenses: {
        name: MONGO_COLLECTION_NAMES.expenses,
        operationId: OPERATION_ID_LIST.createExpense,
        rules: {
          primaryKey: "expenseId",
          primaryKeyFormat: ["uid"],
        },
      },
      incomes: {
        name: MONGO_COLLECTION_NAMES.incomes,
        operationId: OPERATION_ID_LIST.createIncome,
        rules: {
          primaryKey: "incomeId",
          primaryKeyFormat: ["uid"],
        },
      },
      investors: {
        name: MONGO_COLLECTION_NAMES.investors,
        operationId: OPERATION_ID_LIST.addInvestor,
        rules: {
          primaryKey: "investorId",
          primaryKeyFormat: ["email"],
          uniqueAttributes: ["email"],
        },
      },
      investments: {
        name: MONGO_COLLECTION_NAMES.investments,
        operationId: OPERATION_ID_LIST.addInvestment,
        rules: {
          primaryKey: "investmentId",
          primaryKeyFormat: ["investorId", "financialYear", "period"],
        },
      },
      project_entities: {
        name: MONGO_COLLECTION_NAMES.project_entities,
        operationId: OPERATION_ID_LIST.createProjectEntity,
        rules: {
          parent: MONGO_COLLECTION_NAMES.tenants,
          parentQueryAttributeName: "entityId",
          haveSubEntity: true,
          topSubEntity: "projects",
          newAttributeNameForParentReference: "parentInfo",
          pushChildrenToParent: false,
          isTenantIdAlreadyPartOfPrimaryKey: true,
          attachParent: true,
          primaryKey: "entityId",
          primaryKeyFormat: ["uid"],
          prefixAndCounterAttribute: true,
        },
      },
      org_entities: {
        name: MONGO_COLLECTION_NAMES.orgEntities,
        operationId: OPERATION_ID_LIST.addOrgEntity,
        rules: {
          primaryKey: "entityId",
          primaryKeyFormat: ["uid"],
          triggerEvent: true,
          entitiesMapForCountPrefix: {
            petrolPumpCustomers: "petrolPumpCustomers",
            petrolPumpBills: "petrolPumpBillingEntry"
          }
        },
      },
      clients: {
        name: MONGO_COLLECTION_NAMES.clients,
        operationId: OPERATION_ID_LIST.createClient,
        rules: {
          primaryKey: "clientId",
          primaryKeyFormat: ["name", "contactNo"],
          prefixAndCounterAttribute: "clientId",
          globalSearchKeys: [
            "name",
            "contactNo",
            "panNumber",
            "gstIn",
            "email",
          ],
        },
      },
      payments: {
        name: MONGO_COLLECTION_NAMES.payments,
        operationId: OPERATION_ID_LIST.createPayment,
        rules: {
          primaryKey: "paymentId",
          primaryKeyFormat: ["clientId", "projectId", "uid"],
        },
      },
      files: {
        name: MONGO_COLLECTION_NAMES.files,
        operationId: OPERATION_ID_LIST.uploadFile,
        rules: {
          parent: Entity_Creation_Helper_Constants.DYNAMIC_PARENT,
          primaryKey: "fileId",
          pushChildrenToParent: true,
          newAttributeNameForParentReference: "parentInfo",
          attachParent: true,
          primaryKeyFormat: ["uid"],
        },
      },
      vendors: {
        name: MONGO_COLLECTION_NAMES.vendors,
        operationId: OPERATION_ID_LIST.createVendor,
        rules: {
          primaryKey: "vendorId",
          primaryKeyFormat: ["vendorName", "phoneNumber"],
          triggerEvent: true,
          prefixAndCounterAttribute: "vendorId",
          globalSearchKeys: [
            "vendorName",
            "phoneNumber",
            "fullNameAsPerAadhaar",
            "email",
          ],
        },
      },
      tags: {
        name: MONGO_COLLECTION_NAMES.tags,
        operationId: OPERATION_ID_LIST.updateTags,
        rules: {
          uniqueAttributes: ["tagId"],
        },
      },
      hardwares: {
        name: MONGO_COLLECTION_NAMES.hardwares,
        operationId: OPERATION_ID_LIST.createHardware,
        rules: {
          primaryKey: "hardwareId",
          primaryKeyFormat: ["uid"],
        },
      },
      candidates: {
        name: MONGO_COLLECTION_NAMES.candidates,
        operationId: OPERATION_ID_LIST.createCandidate,
        rules: {
          uniqueAttributes: ["email"],
          primaryKey: "candidateId",
          primaryKeyFormat: ["uid"],
        },
      },
      jobOpenings: {
        name: MONGO_COLLECTION_NAMES.jobOpenings,
        operationId: OPERATION_ID_LIST.createJobOpening,
        rules: {
          primaryKey: "jobId",
          primaryKeyFormat: ["uid"],
        },
      },
      trainings: {
        name: MONGO_COLLECTION_NAMES.trainings,
        operationId: OPERATION_ID_LIST.createTraining,
        rules: {
          primaryKey: "trainingId",
          primaryKeyFormat: ["uid"],
        },
      },
      leaveRecords: {
        name: MONGO_COLLECTION_NAMES.leaveRecords,
        operationId: OPERATION_ID_LIST.createLeaveRecord,
        rules: {
          primaryKey: "leaveId",
          primaryKeyFormat: ["uid"],
        },
      },
      invoices: {
        name: MONGO_COLLECTION_NAMES.invoices,
        operationId: OPERATION_ID_LIST.createInvoice,
        rules: {
          primaryKey: "invoiceId",
          primaryKeyFormat: ["uid"],
          uniqueAttributes: ["invoiceId"],
          triggerEvent: true,
          prefixAndCounterAttribute: "invoiceNo",
          globalSearchKeys: ["invoiceNo"],
        },
      },
    },
    operationType: OPERATIONS.CREATE,
  },
  UPDATE_ENTITY: {
    name: "update_entity",
    label: "Update Entity",
    relativepath: "update_entity",
    entityList: {
      notifications: {
        name: MONGO_COLLECTION_NAMES.notifications,
        operationId: OPERATION_ID_LIST.updateNotifications,
        rules: {
          dynamoUpdate: true,
        },
      },
      integrations: {
        name: MONGO_COLLECTION_NAMES.integrations,
        operationId: OPERATION_ID_LIST.triggerIntegration,
        rules: {
          immutableAttributes: ["integrationId"],
        },
      },
      payment_accounts: {
        name: MONGO_COLLECTION_NAMES.payment_accounts,
        operationId: OPERATION_ID_LIST.updatePaymentAccount,
        rules: {
          immutableAttributes: ["paymentAccountId"],
        },
      },
      memberships: {
        name: MONGO_COLLECTION_NAMES.memberships,
        operationId: OPERATION_ID_LIST.updateMembership,
        rules: {
          immutableAttributes: ["membershipId"],
        },
      },
      employees: {
        name: MONGO_COLLECTION_NAMES.employees,
        operationId: OPERATION_ID_LIST.updateEmployee,
        rules: {
          immutableAttributes: ["employeeId"],
        },
      },
      users: {
        name: MONGO_COLLECTION_NAMES.users,
        operationId: OPERATION_ID_LIST.updateSelf,
        rules: {
          controlledUpdate: true,
          updatableAttributes: [
            "guardian",
            "bloodGroup",
            "profilePic",
            "maritalStatus",
            "spouseDetails",
            "alternativePhn",
          ],
        },
      },
      project_entities: {
        name: MONGO_COLLECTION_NAMES.project_entities,
        operationId: OPERATION_ID_LIST.updateProjectEntity,
        rules: {
          immutableAttributes: ["parentId", "entityId", "entityType"],
        },
      },
      counts: {
        name: MONGO_COLLECTION_NAMES.counts,
        operationId: OPERATION_ID_LIST.updateCount,
        rules: {
          immutableAttributes: ["count"],
        },
      },
      tenant: {
        name: MONGO_COLLECTION_NAMES.tenants,
        operationId: OPERATION_ID_LIST.updateTenant,
        rules: {
          controlledUpdate: true,
          updatableAttributes: [
            "profilePic",
            "maritalStatus",
            "spouseDetails",
            "alternativePhn",
          ],
        },
      },
      clients: {
        name: MONGO_COLLECTION_NAMES.clients,
        operationId: OPERATION_ID_LIST.updateClient,
        rules: {
          controlledUpdate: true,
          updatableAttributes: [
            "name",
            "location",
            "description",
            "category",
            "status",
            "tags",
          ],
          globalSearchKeys: [
            "name",
            "contactNo",
            "panNumber",
            "gstIn",
            "email",
          ],
          triggerEvent: true,
        },
      },
      payments: {
        name: MONGO_COLLECTION_NAMES.payments,
        operationId: OPERATION_ID_LIST.updatePayment,
        rules: {
          immutableAttributes: ["paymentFlow"],
        },
      },
      org_entities: {
        name: MONGO_COLLECTION_NAMES.orgEntities,
        operationId: OPERATION_ID_LIST.updateOrgEntity,
        rules: {
          immutableAttributes: ["entityId"],
        },
      },
      grievances: {
        name: MONGO_COLLECTION_NAMES.grievances,
        operationId: OPERATION_ID_LIST.updateGrievance,
        rules: {
          immutableAttributes: ["grievanceId", "userId", "createdDate"],
        },
      },
      vendors: {
        name: MONGO_COLLECTION_NAMES.vendors,
        operationId: OPERATION_ID_LIST.updateVendor,
        rules: {
          immutableAttributes: ["vendorId", "vendorAddedOnDate"],
          globalSearchKeys: [
            "vendorName",
            "phoneNumber",
            "fullNameAsPerAadhaar",
            "email",
          ],
        },
      },
      candidates: {
        name: MONGO_COLLECTION_NAMES.candidates,
        operationId: OPERATION_ID_LIST.updateCandidate,
        rules: {
          immutableAttributes: ["candidateId", "createdBy", "createdOn"],
        },
      },
      jobOpenings: {
        name: MONGO_COLLECTION_NAMES.jobOpenings,
        operationId: OPERATION_ID_LIST.updateJobOpening,
        rules: {
          immutableAttributes: ["jobId", "createdOn", "createdByUserId"],
        },
      },
      expenses: {
        name: MONGO_COLLECTION_NAMES.expenses,
        operationId: OPERATION_ID_LIST.updateExpense,
        rules: {
          immutableAttributes: ["expenseId"],
        },
      },
      incomes: {
        name: MONGO_COLLECTION_NAMES.incomes,
        operationId: OPERATION_ID_LIST.updateIncome,
        rules: {
          immutableAttributes: ["incomeId"],
        },
      },
      hardwares: {
        name: MONGO_COLLECTION_NAMES.hardwares,
        operationId: OPERATION_ID_LIST.updateHardware,
        rules: {
          immutableAttributes: ["hardwareId", "branchId", "tenantId"],
        },
      },
      trainings: {
        name: MONGO_COLLECTION_NAMES.trainings,
        operationId: OPERATION_ID_LIST.updateTraining,
        rules: {
          immutableAttributes: ["trainingId", "createdDate", "tenantId"],
        },
      },
      leaveRecords: {
        name: MONGO_COLLECTION_NAMES.leaveRecords,
        operationId: OPERATION_ID_LIST.updateLeaveRecord,
        rules: {
          immutableAttributes: [
            "tenantId",
            "employeeId",
            "leaveId",
            "fromDate",
            "applyDate",
          ],
        },
      },
      ledgers: {
        name: MONGO_COLLECTION_NAMES.ledgers,
        operationId: OPERATION_ID_LIST.updateVendorRequest,
        rules: {
          immutableAttributes: ["tenantId", "invoiceReqId", "vendorId"],
        },
        primaryKey: "invoiceReqId",
      },
      invoices: {
        name: MONGO_COLLECTION_NAMES.invoices,
        operationId: OPERATION_ID_LIST.updateInvoice,
        rules: {
          controlledUpdate: true,
          updatableAttributes: ["statusId", "status"],
          triggerEvent: true,
        },
      },
    },
  },
  DELETE_ENTITY: {
    name: "delete_entity",
    label: "Delete Entity",
    relativepath: "delete_entity",
    entityList: {
      userLeads: {
        name: "userLeads",
        operationId: OPERATION_ID_LIST.deleteUserLeads,
        rules: {},
      },
      vendors: {
        name: MONGO_COLLECTION_NAMES.vendors,
        operationId: OPERATION_ID_LIST.deleteVendor,
        rules: {
          takeBackupBeforeDelete: true,
        },
      },
      users: {
        name: MONGO_COLLECTION_NAMES.users,
        operationId: OPERATION_ID_LIST.deleteUser,
        rules: {
          takeBackupBeforeDelete: true,
        },
      },
      genericTasks: {
        name: MONGO_COLLECTION_NAMES.genericTasks,
        operationId: OPERATION_ID_LIST.deleteGenericTask,
        rules: {
          takeBackupBeforeDelete: true,
        },
      },
      invoices: {
        name: MONGO_COLLECTION_NAMES.invoices,
        operationId: OPERATION_ID_LIST.deleteInvoice,
        rules: {
          takeBackupBeforeDelete: true,
        },
      },
      org_entities: {
        name: MONGO_COLLECTION_NAMES.orgEntities,
        operationId: OPERATION_ID_LIST.deleteOrgEntities,
        rules: {},
      },
      primaryTask: {
        name: DYNAMO_ENTITIES.PRIMARY_TASK,
        operationId: OPERATION_ID_LIST.deletePrimaryTask,
        rules: {},
      },
      project_entities: {
        name: MONGO_COLLECTION_NAMES.project_entities,
        operationId: OPERATION_ID_LIST.deleteProjectEntity,
        rules: {},
      },
    },
  },
  CONFIGURATION: {
    name: "configuration",
    label: "Configurations",
    relativepath: "configurations",
    operationIdList: {
      replaceConfiguration: {
        name: "replaceConfiguration",
        label: "Update Configuration",
        operationType: OPERATIONS.REPLACE,
        outcomes: {
          replacedConfigurationSuccessfully: {
            name: "CONFIGURATION_UPDATED_SUCCESSFULLY",
            statusCode: RESPOSE_CODES.UPDATE_SUCCESS,
            message: "Configuration updated successfully",
          },
          configurationUpdateError: {
            name: "ERROR_CONFIGURATION_UNEXPECTED",
            statusCode: RESPOSE_CODES.UNKNOWN_ERROR,
            message: "Unable to update configuration.Internal server error.",
          },
        },
      },
      getConfiguration: {
        name: "getConfiguration",
        label: "Get Configuration",
        operationType: OPERATIONS.READ,
        outcomes: {
          configurationRetrievedSuccessfully: {
            name: "CONFIGURATION_RETRIEVED_SUCCESSFULLY",
            statusCode: RESPOSE_CODES.READ,
            message: "Configuration retrieved successfully",
          },
          configurationNotFound: {
            name: "CONFIGURATION_NOT_FOUND",
            statusCode: RESPOSE_CODES.READ,
            message: "Configuration not found",
          },
          configurationError: {
            name: "ERROR_GET_CONFIGURATION_UNEXPECTED",
            statusCode: RESPOSE_CODES.UNKNOWN_ERROR,
            message: "Unable to get configuration.Internal server error.",
          },
        },
      },
    },
  },
  INFRA_MANAGEMENT: {
    name: "infraManagement",
    label: "Infra Management",
    operationIdList: {
      flushRedisCache: {
        name: "flushRedisCache",
        label: "Flush RedisCache",
        operationType: OPERATIONS.INVOKE,
        relativepath: "infra_management/flush_redis",
        outcomes: {
          flushedForTenantSuccessfully: {
            name: "REDIS_FLUSHED_FOR_TENANT_SUCCESSFULLY",
            statusCode: RESPOSE_CODES.UPDATE_SUCCESS,
            message: "Redis flushed for a tenant successfully",
          },
          flushedForAllTenantsSuccessfully: {
            name: "REDIS_FLUSHED_FOR_ALL_TENANTS_SUCCESSFULLY",
            statusCode: RESPOSE_CODES.UPDATE_SUCCESS,
            message: "Redis flushed for all tenants successfully",
          },
          flushError: {
            name: "ERROR_FLUSHING_REDIS_UNEXPECTED",
            statusCode: RESPOSE_CODES.UNKNOWN_ERROR,
            message: "Unable to flush redis.Internal server error.",
          },
        },
      },
      updateCollection: {
        name: "updateCollection",
        operationId: OPERATION_ID_LIST.updateCollection,
        operationType: OPERATIONS.INVOKE,
        relativepath: "infra_management/update_collection",
      },
      sendInstantMessage: {
        name: "sendInstantMessage",
        operationId: OPERATION_ID_LIST.sendInstantMessage,
        operationType: OPERATIONS.INVOKE,
        relativepath: "infra_management/send_message",
      },
    },
  },
  FILES: {
    name: "files",
    label: "Files Management",
    relativepath: "files_management",
    operationIdList: {
      manageFiles: {
        name: "manageFiles",
        label: "Manage the files and folders",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  TASK_PERIODS: {
    name: "taskPeriods",
    label: "Task Periods",
    relativepath: "task_periods",
    operationIdList: {
      getPeriodsOfTask: {
        name: OPERATION_ID_LIST.getPeriodsOfTask,
        label: "Get periods of a task",
        operationType: OPERATIONS.READ,
      },
      updatePeriodOfTask: {
        name: OPERATION_ID_LIST.updatePeriodOfTask,
        label: "Update period of a task",
        operationType: OPERATIONS.REPLACE,
      },
    },
  },
  ADVANCE_SEARCH_FILTERING: {
    name: "advanceSearchAndFiltering",
    label: "Advance Search And Filtering",
    relativepath: "advance_search_filter",
    operationIdList: {
      advanceSearchAndFiltering: {
        name: OPERATION_ID_LIST.advanceSearchAndFiltering,
        label: "Advance Search And Filtering",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  CALENDAR_EVENTS: {
    name: "manageCalendarEvents",
    label: "Add Update Remove Calendar events",
    relativepath: "manage_calendar",
    operationIdList: {
      manageCalendarEvents: {
        name: OPERATION_ID_LIST.manageCalendarEvents,
        label: "Manage Calendar Events",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  DASHBOARDS: {
    name: "dashboards",
    label: "View dashboards",
    relativepath: "dashboards",
    operationIdList: {
      dashboards: {
        name: OPERATION_ID_LIST.manageCalendarEvents,
        label: "Manage Calendar Events",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  DYNAMO_ENTITIES: {
    name: "dynamoEntities",
    label: "Dynamo Entities",
    relativepath: "dynamo_entities",
    operationIdList: {
      getDynamoEntities: {
        name: OPERATION_ID_LIST.getDynamoEntities,
        label: "Get Task Client Associations",
        operationType: OPERATIONS.INVOKE,
      },
    },
  },
  CMS: {
    relativepath: "cms",
  },
  PRESIGNED_URL: {
    relativePath: "presignedUrl",
  },
};

export const BAD_REQUEST = {
  invalidReqPayload: {
    name: "ERROR_BAD_INPUT",
    statusCode: RESPOSE_CODES.BAD_INPUT,
    message: "Please check the request body",
  },
};

export const OPERATION_ID_MAP = {
  dashboards: {
    post: OPERATION_ID_LIST.dashboards,
  },
  manage_calendar: {
    post: OPERATION_ID_LIST.manageCalendarEvents,
  },
  advance_search_filter: {
    post: OPERATION_ID_LIST.advanceSearchAndFiltering,
  },
  dynamo_entities: {
    post: OPERATION_ID_LIST.getDynamoEntities,
  },
  configurations: {
    get: OPERATION_ID_LIST.getConfiguration,
    put: OPERATION_ID_LIST.replaceConfiguration,
  },
  "infra_management/flush_redis": {
    post: OPERATION_ID_LIST.flushRedisCache,
  },
  "infra_management/update_collection": {
    post: OPERATION_ID_LIST.updateCollection,
  },
  "infra_management/send_message": {
    post: OPERATION_ID_LIST.sendInstantMessage,
  },
  files_management: {
    post: OPERATION_ID_LIST.manageFiles,
  },
  task_periods: {
    get: OPERATION_ID_LIST.getPeriodsOfTask,
    put: OPERATION_ID_LIST.updatePeriodOfTask,
  },
  workflows: {
    createSummary: { post: OPERATION_ID_LIST.createSummary },
    onboardUser: { post: OPERATION_ID_LIST.onboardUser },
    updateUserAccount: { post: OPERATION_ID_LIST.updateUserAccount },
    documentToText: { post: OPERATION_ID_LIST.documentToText },
    generateTaskPeriodicity: {
      post: OPERATION_ID_LIST.generateTaskPeriodicity,
    },
    taskAssignment: { post: OPERATION_ID_LIST.taskAssignment },
    manageTaskLifeCycle: { post: OPERATION_ID_LIST.manageTaskLifeCycle },
    processLocations: { post: OPERATION_ID_LIST.processLocations },
    manageLeave: { post: OPERATION_ID_LIST.manageLeave },
    analytics: { post: OPERATION_ID_LIST.analytics },
  },
  entities: {
    audits: { get: OPERATION_ID_LIST.getAudits },
    integrations: { get: OPERATION_ID_LIST.getIntegrations },
    payment_accounts: { get: OPERATION_ID_LIST.getPaymentAccounts },
    memberships: { get: OPERATION_ID_LIST.getMemberships },
    users: { get: OPERATION_ID_LIST.getUserList },
    messages: { get: OPERATION_ID_LIST.viewMessages },
    tenants: { get: OPERATION_ID_LIST.getOrgInfo },
    branches: {
      get: OPERATION_ID_LIST.getOrgBranches,
    },
    departments: {
      get: OPERATION_ID_LIST.getDepartmentsOfBranch,
    },
    teams: {
      get: OPERATION_ID_LIST.getTeamsOfDepartments,
    },
    investors: {
      get: OPERATION_ID_LIST.getInvestorsList,
    },
    investments: {
      get: OPERATION_ID_LIST.getInvestmentsList,
    },
    employees: {
      get: OPERATION_ID_LIST.getEmployees,
    },
    grievances: {
      get: OPERATION_ID_LIST.getGrievances,
    },
    project_entities: {
      get: OPERATION_ID_LIST.getProjectEntityList,
    },
    clients: {
      get: OPERATION_ID_LIST.getClientList,
    },
    expenses: {
      get: OPERATION_ID_LIST.getExpenses,
    },
    incomes: {
      get: OPERATION_ID_LIST.getIncomes,
    },
    payments: {
      get: OPERATION_ID_LIST.getPayments,
    },
    vendors: {
      get: OPERATION_ID_LIST.getVendors,
    },
    files: {
      get: OPERATION_ID_LIST.downloadFile,
    },
    tags: {
      get: OPERATION_ID_LIST.getTags,
    },
    hardwares: {
      get: OPERATION_ID_LIST.getHardwares,
    },
    jobOpenings: {
      get: OPERATION_ID_LIST.getJobOpenings,
    },
    candidates: {
      get: OPERATION_ID_LIST.getCandidates,
    },
    trainings: {
      get: OPERATION_ID_LIST.getTrainings,
    },
    leaveRecords: {
      get: OPERATION_ID_LIST.getLeaveRecords,
    },
    invoices: {
      get: OPERATION_ID_LIST.getInvoice,
    },
    vendorDashboard: {
      get: OPERATION_ID_LIST.getVendorDashboardData,
    },
  },
  update_entity: {
    org_entities: { patch: OPERATION_ID_LIST.updateOrgEntity },
    integrations: { patch: OPERATION_ID_LIST.triggerIntegration },
    payment_accounts: { patch: OPERATION_ID_LIST.updatePaymentAccount },
    memberships: { patch: OPERATION_ID_LIST.updateMembership },
    employees: {
      patch: OPERATION_ID_LIST.updateEmployee,
    },
    users: {
      patch: OPERATION_ID_LIST.updateSelf,
    },
    counts: {
      patch: OPERATION_ID_LIST.updateCount,
    },
    project_entities: {
      patch: OPERATION_ID_LIST.updateProjectEntity,
    },
    clients: {
      patch: OPERATION_ID_LIST.updateClient,
    },
    payments: {
      patch: OPERATION_ID_LIST.updatePayment,
    },
    grievances: {
      patch: OPERATION_ID_LIST.updateGrievance,
    },
    vendors: {
      patch: OPERATION_ID_LIST.updateVendor,
    },
    expenses: {
      patch: OPERATION_ID_LIST.updateExpense,
    },
    incomes: {
      patch: OPERATION_ID_LIST.updateIncome,
    },
    hardwares: {
      patch: OPERATION_ID_LIST.updateHardware,
    },
    candidates: {
      patch: OPERATION_ID_LIST.updateCandidate,
    },
    jobOpenings: {
      patch: OPERATION_ID_LIST.updateJobOpening,
    },
    trainings: {
      patch: OPERATION_ID_LIST.updateTraining,
    },
    leaveRecords: {
      patch: OPERATION_ID_LIST.updateLeaveRecord,
    },
    ledgers: {
      patch: OPERATION_ID_LIST.updateVendorRequest,
    },
    invoices: {
      patch: OPERATION_ID_LIST.updateInvoice,
    },
    notifications: {
      patch: OPERATION_ID_LIST.updateNotifications,
    },
  },
  delete_entity: {
    userLeads: { delete: OPERATION_ID_LIST.deleteUserLeads },
    vendors: {
      delete: OPERATION_ID_LIST.deleteVendor,
    },
    users: {
      delete: OPERATION_ID_LIST.deleteUser,
    },
    invoices: {
      delete: OPERATION_ID_LIST.deleteInvoice,
    },
    org_entities: {
      delete: OPERATION_ID_LIST.deleteOrgEntities,
    },
    primaryTask: {
      delete: OPERATION_ID_LIST.deletePrimaryTask,
    },
    genericTasks: {
      delete: OPERATION_ID_LIST.deleteGenericTask,
    },
    project_entities: {
      delete: OPERATION_ID_LIST.deleteProjectEntity,
    },
  },
  new_entity: {
    integrations: { post: OPERATION_ID_LIST.addIntegration },
    org_entities: { post: OPERATION_ID_LIST.addOrgEntity },
    payment_accounts: { post: OPERATION_ID_LIST.addPaymentAccount },
    memberships: { post: OPERATION_ID_LIST.addMembership },
    messages: { post: OPERATION_ID_LIST.sendMessage },
    branches: {
      post: OPERATION_ID_LIST.createBranch,
    },
    departments: {
      post: OPERATION_ID_LIST.createDepartment,
    },
    teams: {
      post: OPERATION_ID_LIST.createTeam,
    },
    investors: {
      post: OPERATION_ID_LIST.addInvestor,
    },
    investments: {
      post: OPERATION_ID_LIST.addInvestment,
    },
    employees: {
      post: OPERATION_ID_LIST.createEmployee,
    },
    grievances: {
      post: OPERATION_ID_LIST.createGrievance,
    },
    project_entities: {
      post: OPERATION_ID_LIST.createProjectEntity,
    },
    clients: {
      post: OPERATION_ID_LIST.createClient,
    },
    expenses: {
      post: OPERATION_ID_LIST.createExpense,
    },
    incomes: {
      post: OPERATION_ID_LIST.createIncome,
    },
    payments: {
      post: OPERATION_ID_LIST.createPayment,
    },
    vendors: {
      post: OPERATION_ID_LIST.createVendor,
    },
    files: {
      post: OPERATION_ID_LIST.uploadFile,
    },
    tags: {
      post: OPERATION_ID_LIST.updateTags,
    },
    hardwares: {
      post: OPERATION_ID_LIST.createHardware,
    },
    candidates: {
      post: OPERATION_ID_LIST.createCandidate,
    },
    jobOpenings: {
      post: OPERATION_ID_LIST.createJobOpening,
    },
    trainings: {
      post: OPERATION_ID_LIST.createTraining,
    },
    leaveRecords: {
      post: OPERATION_ID_LIST.createLeaveRecord,
    },
    invoices: {
      post: OPERATION_ID_LIST.createInvoice,
    },
  },
  cms: {
    post: OPERATION_ID_LIST.cmsCrud,
  },
  presignedUrl: {
    post: OPERATION_ID_LIST.presignedUrl
  }
};
