import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Gift, Person, Return, Image, Reminder, SyncQueueItem } from '@/types';
import { logger } from '@/utils/logger';

// IndexedDBスキーマ定義
export interface IwailistDB extends DBSchema {
  gifts: {
    key: string;
    value: Gift;
    indexes: {
      'userId': string;
      'personId': string;
      'receivedDate': Date;
      'returnStatus': string;
      'category': string;
    };
  };
  persons: {
    key: string;
    value: Person;
    indexes: {
      'userId': string;
      'name': string;
    };
  };
  returns: {
    key: string;
    value: Return;
    indexes: {
      'giftId': string;
    };
  };
  images: {
    key: string;
    value: Image;
    indexes: {
      'entityId': string;
      'entityType': string;
    };
  };
  reminders: {
    key: string;
    value: Reminder;
    indexes: {
      'userId': string;
      'giftId': string;
      'reminderDate': Date;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'status': string;
      'timestamp': Date;
    };
  };
}

// データベース接続
export async function getDB(): Promise<IDBPDatabase<IwailistDB>> {
  return openDB<IwailistDB>('IwailistDB', 1, {
    upgrade(db) {
      // gifts ストア
      const giftStore = db.createObjectStore('gifts', { keyPath: 'id' });
      giftStore.createIndex('userId', 'userId');
      giftStore.createIndex('personId', 'personId');
      giftStore.createIndex('receivedDate', 'receivedDate');
      giftStore.createIndex('returnStatus', 'returnStatus');
      giftStore.createIndex('category', 'category');
      
      // persons ストア
      const personStore = db.createObjectStore('persons', { keyPath: 'id' });
      personStore.createIndex('userId', 'userId');
      personStore.createIndex('name', 'name');
      
      // returns ストア
      const returnStore = db.createObjectStore('returns', { keyPath: 'id' });
      returnStore.createIndex('giftId', 'giftId');
      
      // images ストア
      const imageStore = db.createObjectStore('images', { keyPath: 'id' });
      imageStore.createIndex('entityId', 'entityId');
      imageStore.createIndex('entityType', 'entityType');
      
      // reminders ストア
      const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
      reminderStore.createIndex('userId', 'userId');
      reminderStore.createIndex('giftId', 'giftId');
      reminderStore.createIndex('reminderDate', 'reminderDate');
      
      // syncQueue ストア
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('status', 'status');
      syncStore.createIndex('timestamp', 'timestamp');
    }
  });
}

// データベース初期化
export async function initializeDB(): Promise<void> {
  try {
    await getDB();
    // 本番環境ではログを出力しない
    logger.info('IndexedDB initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
}
