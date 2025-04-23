export enum AttributeTypes {
    STRING = 'string',
    NUMBER = 'number',
    DECIMAL = 'decimal',
    ARRAY = 'array',
    BOOLEAN = 'boolean',
}

export enum Advance_Search_Filter_Options {
    GET_MANY = 'get_many',
    MATH_OPERATIONS = 'math_operations',
    SUBSTRING_SEARCH = 'substring_search',
    VALUE_SEARCH = 'value_search',
    RANGE_SEARCH = 'range_search',
    DELETE_MANY = 'delete_many',
    GET_PROJECTIONS = 'get_projections',
    UPDATE_MANY = 'update_many',
    MULTIPLE_FILTERS = 'multiple_filters',
    ADVANCE_SEARCH = 'advance_search',
}

export enum String_Search {
    PREFIX = 'starts_with',
    SUFFIX = 'ends_with',
    ALL = 'all',
    VALUE = 'value',
}

export enum DASHBOARD_ACTIONS {
    GET_CA_PRIMARY_TASK_DASHBOARD = 'GET_CA_PRIMARY_TASK_DASHBOARD',
    GET_CA_COMPLETED_TASK_DASHBOARD = 'GET_CA_COMPLETED_TASK_DASHBOARD',
    GET_VENDOR_DASHBOARD = 'GET_VENDOR_DASHBOARD',
    GET_INVOICE_DASHBOARD = 'GET_INVOICE_DASHBOARD',
    GET_PETROL_PUMP_DASHBOARD = 'GET_PETROL_PUMP_DASHBOARD',
    GET_CA_PER_RESOURCE_DASHBOARD = 'GET_CA_PER_RESOURCE_DASHBOARD',
}

export enum DASHBOARD_RESOURCES {
    CA_USER = 'CA_USER',
    CA_CLIENT = 'CA_CLIENT',
    CA_TASK = 'CA_TASK',
}