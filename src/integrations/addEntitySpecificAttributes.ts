import { MONGO_COLLECTION_NAMES } from "@constants";
export function addEntityAttributes({ mappedRow, entity }) {
 switch (entity) {
     case MONGO_COLLECTION_NAMES.memberships:
        mappedRow['type'] = 'basic';
        mappedRow['status'] = 'active';
         return;
 }
}