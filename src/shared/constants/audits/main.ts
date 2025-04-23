export const AUDIT_ACTIONS = {
    ENTITY: {
        created: 'ENTITY_CREATED',
        updated: 'ENTITY_UPDATED',
        deleted: 'ENTITY_DELETED',
        backup: 'ENTITY_BACKUP',
        update_initiated: 'ENTITY_UPDATE_INITIATED',
        delete_initiated: 'ENTITY_DELETE_INITIATED',
        create_initiated: 'ENTITY_CREATE_INITIATED',
    },
    USER_ONBOARDING: {
        initiated: 'USER_ONBOARDING_INITIATED',
        user_created_in_cognito: 'USER_CREATED_IN_COGNITO',
        user_created_in_mongo: 'USER_CREATED_IN_MONGO',
    },
    TASK_OPERATIONS: {
        initiated: 'TASK_OPERATIONS_INITIATED',
        task_added_in_dynamo: 'TASK_ADDED_IN_DYNAMO',
        task_already_present: 'Task already present',
        task_not_present: 'Task Association not found',
        task_updated_in_dynamo: 'TASK_UPDATED_IN_DYNAMO',
        task_added_to_stakeholders: 'TASK_ADDED_TO_STAKEHOLDERS',
        task_removed_from_stakeholders: 'TASK_REMOVED_FROM_STAKEHOLDERS',
        task_assigned: 'Task has been assigned successfully',
        task_moved_to_non_billable: 'Billing Status of task has been moved to Non Billable',
        task_moved_to_primary: 'Completed task has been moved to Primary',
        task_lifecycle_status_non_billable: 'Non Billable',
        task_lifecycle_status_non_billable_id: 'non-billable'
    },
    PERIODICITY: {
        periods_generation_initiated: 'PERIODS_GENERATION_INITIATED',
        periods_generated_for_periodically_repeating_task: 'PERIODS_GENERATED_FOR_PERIODICALLY_REPEATING_TASK',
        periods_generated_for_non_repeating_task: 'PERIODS_GENERATED_FOR_NON_REPEATING_TASK',
        periods_re_generated_for_periodically_repeating_task: 'PERIODS_RE_GENERATED_FOR_PERIODICALLY_REPEATING_TASK',
        periods_re_generated_for_non_repeating_task: 'PERIODS_RE_GENERATED_FOR_NON_REPEATING_TASK',
        periods_generation_input_stored_in_mongo: 'PERIODS_GENERATION_INPUT_STORED_IN_MONGO',
        periods_re_generation_input_stored_in_mongo: 'PERIODS_RE_GENERATION_INPUT_STORED_IN_MONGO',
        task_Attribute_update: 'TASK_ATTRIBUTE_UPDATED'
    },
    DOCUMENT_PROCESSING: {
        IMAGE_PROCESSING: {
            initiated: 'IMAGE_PROCESSING_INITIATED',
            retrieved_from_cache: 'IMAGE_DATA_RETRIEVED_FROM_CACHE',
            retrieved_from_cloud: 'IMAGE_DATA_RETRIEVED_FROM_AWS_REKOGNITION'
        }
       
    },
    SUMMARY: {
        initiated: 'SUMMARY_CREATION_INITIATED',
        summary_created: 'SUMMARY_CREATED',
    },
    USER_ACCOUNT_UPDATE: {
        initiated: 'USER_UPDATE_INITIATED',
        enabledUIAccess: 'ENABLED_UI_ACCESS',
        disabledUIAccess: 'DISABLED_UI_ACCESS',
        deactivated: 'USER_DEACTIVATED',
        activated: 'USER_ACTIVATED',
        deleted: 'USER_DELETED',
        permissionsUpdated: 'USER_PERMISSIONS_UPDATED',
        attributeUpdated: 'USER_ATTRIBUTES_UPDATED',
        user_created_in_cognito: 'USER_CREATED_IN_COGNITO',
    }
}

export const AUDIT_MESSAGES = {
    DOCUMENT_PROCESSING: {
        IMAGE_PROCESSING: {
        retrieved_from_cache: 'Retrieved image data from cache',
            retrieved_from_cloud: 'Retrieved image data from cloud service',
        },
        fatal_error_happened: 'Fatal error happened during image processing'
    },
    PERIOD_GENERATION: {
        fatal_error_happened: 'Fatal error happened during period generation',
        period_list_generated: 'Successfully generated period list',
        saved_periods_in_dynamo: 'Successfully saved period list in Dynamo',
        saved_period_input_in_mongo: 'Successfully saved period input in Mongo',
        updated_existing_period_input_in_mongo: 'Successfully updated existing period input in Mongo',
        period_list_re_generated: 'Successfully regenerated period list',
        task_attribute_updated: 'Successfully updated task attribute',
    },
    TASK_OPERATIONS: {
        fatal_error_happened: 'Fatal error happened during task assignment',
        task_assigned_successfully: 'Successfully assigned task',
        task_updated_successfully: 'Successfully updated task',
        saved_tasks_in_dynamo: 'Successfully tasks in Dynamo',
        task_already_present: 'Task already present',
    },
    USER_ACCOUNT_UPDATE: {
        user_updated_successfully: 'User updated successfully',
        user_exists_in_cognito: 'User exists in Cognito',
        user_does_not_exists_in_cognito: 'User not present in Cognito',
        user_does_not_exists_in_mongo: 'User not present in Mongo',
        user_creation_in_cognito_not_enabled: 'USER_CREATION_IN_COGNITO_ENABLED flag not enabled',
        fatal_error_happened: 'Fatal error happened during user account update. Please check workflow logs'

    },
    USER_ONBOARDING: {
        user_exists_already_in_cognito: 'User with same email already exists in Cognito',
        user_exists_already_in_mongo: 'User with same email already exists in Mongo',
        user_creation_in_cognito_not_enabled: 'USER_CREATION_IN_COGNITO_ENABLED flag not enabled',
        user_onboarded_successfully: 'User onboarded successfully',
        error_happened: 'Expected error happened during user onboarding.It could be because of user already present or flag not enabled.',
        fatal_error_happened: 'Fatal error happened during user onboarding. Please check workflow logs'
    },
    SUMMARY: {
        summary_created_successfully: 'Summary created successfully',
        error_happened: 'Expected error happened during summary creation.It could be because of data being incomplete',
        fatal_error_happened: 'Fatal error happened during summary creation. Please check workflow logs'
    },
    ENTITY: {
        update_failed: 'Error happened while updating entity',
        create_failed: 'Error happened while creating entity',
    },
    ANALYTICS: {
        success: 'Successfully retrieved data',
        failed: 'Failed to get data',
    },
    CMS:{
        ERRORS: {
            CREATE: 'Error happened while creation in cms',
            UPDATE: 'Error happened while updating in cms',
        }
    }
}

export const AUDIT_ENTITY_SUB_TYPES = {
    Financial_Task:"Financial Task"
}
