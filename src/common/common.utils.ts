import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  const uniqueId = uuidv4();
  return uniqueId;
}
