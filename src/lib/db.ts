import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'tekua-offline-cache';
const DB_VERSION = 1;

export interface PendingAction {
  id: string;
  type: 'vote' | 'submit_task' | 'transfer';
  data: any;
  timestamp: number;
}

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Data cache (key-value)
      if (!db.objectStoreNames.contains('data-cache')) {
        db.createObjectStore('data-cache');
      }
      // Pending actions for sync
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
    },
  });
};

export const cacheData = async (key: string, data: any) => {
  const db = await initDB();
  await db.put('data-cache', data, key);
};

export const getCachedData = async (key: string) => {
  const db = await initDB();
  return db.get('data-cache', key);
};

export const enqueueAction = async (type: PendingAction['type'], data: any) => {
  const db = await initDB();
  const action: PendingAction = {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: Date.now(),
  };
  await db.put('pending-actions', action);
  return action.id;
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  const db = await initDB();
  return db.getAll('pending-actions');
};

export const removePendingAction = async (id: string) => {
  const db = await initDB();
  await db.delete('pending-actions', id);
};
