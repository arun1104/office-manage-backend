import {
    IntegrationTypes
} from "@enums";
import { ExcelIntegration } from "./excelIntegration";

export class IntegrationsRegister {
    static async triggerIntegration({ integrationInfo, mongoDal, tenantId, userInfo }) {
        try {
            switch (integrationInfo.integrationType) {
                case IntegrationTypes.EXCEL:
                    ExcelIntegration.start({ integrationInfo, mongoDal, tenantId, userInfo });
                    return;
            }
        } catch (err) {
            console.log(`Error in ${integrationInfo.integrationType}`, err);
        }
    }
}