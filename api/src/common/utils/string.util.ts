import { v4 as uuidv4 } from 'uuid';

export const getUniqueName = (name: string) => `${name.toLowerCase()}-${uuidv4()}`;
