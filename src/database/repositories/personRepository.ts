import { getDB } from '../schema';
import { Person } from '@/types';
import { firestorePersonRepository } from '@/repositories/firebase/personRepository';
import { isFirebaseEnabled } from '@/lib/firebase';
import { SyncOperation } from '@/types/firebase';

type SyncOptions = {
  skipRemote?: boolean;
};

export class PersonRepository {
  async create(person: Person, options: SyncOptions = {}): Promise<void> {
    const db = await getDB();
    await db.add('persons', person);

    console.log('[PersonRepository] Person added to IndexedDB:', person.id);
    console.log('[PersonRepository] Firebase enabled:', isFirebaseEnabled());
    console.log('[PersonRepository] Person userId:', person.userId);
    console.log('[PersonRepository] Person id:', person.id);

    // Firestoreに同期（同じIDを使用）
    const isOnline = this.getOnlineStatus();
    if (this.shouldSyncWithFirestore(person.userId, options, isOnline)) {
      try {
        console.log('[PersonRepository] Syncing person to Firestore...');
        // IDを含む完全なオブジェクトをFirestoreに保存
        const { id, userId, ...personData } = person;
        await firestorePersonRepository.createWithId(userId, id, personData);
        console.log('[PersonRepository] Person successfully synced to Firestore:', id);
      } catch (error) {
        console.error('[PersonRepository] Failed to sync person to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
        await this.queueSyncOperationIfNeeded('create', person, options);
      }
    } else if (this.shouldQueueOfflineSync(options, person.userId, isOnline)) {
      await this.queueSyncOperation({
        type: 'create',
        collection: 'persons',
        documentId: person.id,
        data: person,
      });
    } else {
      console.warn(
        '[PersonRepository] Skipping Firestore sync - Firebase enabled:',
        isFirebaseEnabled(),
        ', isOnline:',
        isOnline,
        ', userId:',
        person.userId,
        ', id:',
        person.id
      );
    }
  }
  
  async get(id: string): Promise<Person | undefined> {
    const db = await getDB();
    return await db.get('persons', id);
  }
  
  async getAll(userId: string): Promise<Person[]> {
    const db = await getDB();
    return await db.getAllFromIndex('persons', 'userId', userId);
  }
  
  async update(person: Person, options: SyncOptions = {}): Promise<void> {
    const db = await getDB();
    await db.put('persons', person);

    // Firestoreに同期
    const isOnline = this.getOnlineStatus();
    if (this.shouldSyncWithFirestore(person.userId, options, isOnline) && person.userId) {
      try {
        await firestorePersonRepository.update(person.userId, person.id, person);
      } catch (error) {
        console.error('Failed to sync person update to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
        await this.queueSyncOperationIfNeeded('update', person, options);
      }
    } else if (this.shouldQueueOfflineSync(options, person.userId, isOnline)) {
      await this.queueSyncOperation({
        type: 'update',
        collection: 'persons',
        documentId: person.id,
        data: person,
      });
    } else {
      console.warn(
        '[PersonRepository] Skipping Firestore update sync - Firebase enabled:',
        isFirebaseEnabled(),
        ', isOnline:',
        isOnline,
        ', userId:',
        person.userId,
        ', id:',
        person.id
      );
    }
  }

  async delete(id: string, userId?: string, options: SyncOptions = {}): Promise<void> {
    const db = await getDB();
    await db.delete('persons', id);

    // Firestoreに同期
    const isOnline = this.getOnlineStatus();
    if (this.shouldSyncWithFirestore(userId, options, isOnline) && userId) {
      try {
        await firestorePersonRepository.delete(userId as string, id);
      } catch (error) {
        console.error('Failed to sync person deletion to Firestore:', error);
        // IndexedDBからは削除されているので、エラーは無視
        if (this.canQueueSync(options, userId)) {
          await this.queueSyncOperation({
            type: 'delete',
            collection: 'persons' as const,
            documentId: id,
            data: { userId: userId as string },
          });
        }
      }
    } else if (this.shouldQueueOfflineSync(options, userId, isOnline)) {
      await this.queueSyncOperation({
        type: 'delete',
        collection: 'persons' as const,
        documentId: id,
        data: { userId: userId as string },
      });
    } else {
      console.warn(
        '[PersonRepository] Skipping Firestore delete sync - Firebase enabled:',
        isFirebaseEnabled(),
        ', isOnline:',
        isOnline,
        ', userId:',
        userId,
        ', id:',
        id
      );
    }
  }
  
  async search(userId: string, searchText: string): Promise<Person[]> {
    const db = await getDB();
    const persons = await db.getAllFromIndex('persons', 'userId', userId);
    
    const searchLower = searchText.toLowerCase();
    return persons.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.furigana?.toLowerCase().includes(searchLower) ||
      p.memo?.toLowerCase().includes(searchLower)
    );
  }
  
  async getByName(userId: string, name: string): Promise<Person | undefined> {
    const db = await getDB();
    const persons = await db.getAllFromIndex('persons', 'userId', userId);
    return persons.find(p => p.name === name);
  }

  private getOnlineStatus(): boolean {
    if (typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  }

  private shouldSyncWithFirestore(userId: string | undefined, options: SyncOptions, isOnline: boolean): boolean {
    if (options.skipRemote) {
      return false;
    }
    if (!isFirebaseEnabled()) {
      return false;
    }
    if (!userId) {
      return false;
    }
    if (!isOnline) {
      return false;
    }
    return true;
  }

  private shouldQueueOfflineSync(options: SyncOptions, userId: string | undefined, isOnline: boolean): boolean {
    return this.canQueueSync(options, userId) && !isOnline;
  }

  private canQueueSync(options: SyncOptions, userId: string | undefined): boolean {
    if (options.skipRemote) {
      return false;
    }
    if (!userId) {
      return false;
    }
    if (!isFirebaseEnabled()) {
      return false;
    }
    return true;
  }

  private async queueSyncOperationIfNeeded(
    type: SyncOperation['type'],
    person: Person,
    options: SyncOptions
  ): Promise<void> {
    if (!this.canQueueSync(options, person.userId)) {
      return;
    }

    if (type === 'delete') {
      await this.queueSyncOperation({
        type,
        collection: 'persons' as const,
        documentId: person.id,
        data: { userId: person.userId },
      });
      return;
    }

    await this.queueSyncOperation({
      type,
      collection: 'persons' as const,
      documentId: person.id,
      data: person,
    });
  }

  private async queueSyncOperation(
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ): Promise<void> {
    try {
      const { syncManager } = await import('@/services/syncManager');
      await syncManager.addToSyncQueue(operation);
    } catch (error) {
      console.error('[PersonRepository] Failed to queue sync operation:', error);
    }
  }
}
