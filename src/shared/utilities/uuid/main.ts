import { v4 as uuidv4 } from 'uuid';
  
export function getUniqueId(): string {
    return `${Date.now().toString()}-${uuidv4()}`;
}
