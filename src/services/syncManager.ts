/**
 * データ同期マネージャー
 * IndexedDB ⇔ Firestore の双方向同期を管理
 */
import { GiftRepository } from '../database/repositories/giftRepository';
import { PersonRepository } from '../database/repositories/personRepository';
import { firestoreGiftRepository } from '../repositories/firebase/giftRepository';
import { firestorePersonRepository } from '../repositories/firebase/personRepository';
import { isFirebaseEnabled } from '../lib/firebase';
import { SyncOperation, SyncResult, SyncStatus } from '../types/firebase';

const giftRepository = new GiftRepository();
const personRepository = new PersonRepository();

class SyncManager {
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private syncQueue: SyncOperation[] = [];
  private readonly SYNC_QUEUE_KEY = 'syncQueue';

  constructor() {
    this.loadSyncQueue();
    this.setupOnlineListener();
  }

  /**
   * 同期キューをローカルストレージから読み込み
   */
  private loadSyncQueue(): void {
    const savedQueue = localStorage.getItem(this.SYNC_QUEUE_KEY);
    if (savedQueue) {
      try {
        this.syncQueue = JSON.parse(savedQueue);
      } catch (error) {
        console.error('Failed to load sync queue:', error);
        this.syncQueue = [];
      }
    }
  }

  /**
   * 同期キューをローカルストレージに保存
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * オンライン状態の監視
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('Network online - starting sync');
      this.executeSync().catch(console.error);
    });
  }

  /**
   * 同期操作をキューに追加
   */
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<void> {
    const syncOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };

    this.syncQueue.push(syncOp);
    this.saveSyncQueue();

    // オンラインの場合は即座に同期実行
    if (navigator.onLine && isFirebaseEnabled()) {
      await this.executeSync();
    }
  }

  /**
   * 同期を実行
   */
  async executeSync(userId?: string): Promise<SyncResult> {
    if (!isFirebaseEnabled()) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [],
      };
    }

    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [],
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    try {
      // 双方向同期を実行
      if (userId) {
        try {
          await this.syncGifts(userId);
        } catch (error) {
          console.error('Gift sync failed:', error);
          result.errors.push({
            operation: {
              id: crypto.randomUUID(),
              type: 'update',
              collection: 'gifts',
              documentId: 'all',
              timestamp: new Date(),
              retryCount: 0,
              status: 'failed',
            },
            error: error instanceof Error ? error : new Error('贈答品の同期に失敗しました'),
            timestamp: new Date(),
          });
          result.failed++;
        }

        try {
          await this.syncPersons(userId);
        } catch (error) {
          console.error('Person sync failed:', error);
          result.errors.push({
            operation: {
              id: crypto.randomUUID(),
              type: 'update',
              collection: 'persons',
              documentId: 'all',
              timestamp: new Date(),
              retryCount: 0,
              status: 'failed',
            },
            error: error instanceof Error ? error : new Error('人物の同期に失敗しました'),
            timestamp: new Date(),
          });
          result.failed++;
        }
      }

      // 同期キューを処理
      await this.processSyncQueue(result);

      // すべてが失敗した場合のみ、同期失敗とする
      if (result.failed > 0 && result.processed === 0) {
        result.success = false;
      }

      this.lastSyncTime = new Date();
      localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
    } catch (error) {
      console.error('Sync error:', error);
      result.success = false;
      result.errors.push({
        operation: {
          id: crypto.randomUUID(),
          type: 'update',
          collection: 'gifts',
          documentId: 'unknown',
          timestamp: new Date(),
          retryCount: 0,
          status: 'failed',
        },
        error: error instanceof Error ? error : new Error('同期処理中に予期しないエラーが発生しました'),
        timestamp: new Date(),
      });
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * 同期キューを処理
   */
  private async processSyncQueue(result: SyncResult): Promise<void> {
    const pendingOps = this.syncQueue.filter((op) => op.status === 'pending');

    for (const operation of pendingOps) {
      try {
        operation.status = 'processing';
        await this.executeSyncOperation(operation);
        operation.status = 'completed';
        result.processed++;
      } catch (error) {
        console.error('Sync operation failed:', error);
        operation.status = 'failed';
        operation.retryCount++;
        operation.lastError = error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.errors.push({
          operation,
          error: error instanceof Error ? error : new Error('Unknown error'),
          timestamp: new Date(),
        });
      }
    }

    // 完了した操作を削除、失敗したものは保持（リトライ用）
    this.syncQueue = this.syncQueue.filter(
      (op) => op.status === 'pending' || (op.status === 'failed' && op.retryCount < 3)
    );
    this.saveSyncQueue();
  }

  /**
   * 同期操作を実行
   */
  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    const { type, collection, documentId, data } = operation;

    try {
      switch (collection) {
        case 'gifts':
          await this.executeSyncOperationForGifts(type, documentId, data);
          break;
        case 'persons':
          await this.executeSyncOperationForPersons(type, documentId, data);
          break;
        case 'returns':
          // お返しの同期は将来実装予定
          console.log('Returns sync not yet implemented');
          break;
        case 'images':
          // 画像の同期は将来実装予定
          console.log('Images sync not yet implemented');
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }
    } catch (error) {
      console.error(`Failed to execute sync operation for ${collection}:`, error);
      throw error;
    }
  }

  /**
   * 贈答品の同期操作を実行
   */
  private async executeSyncOperationForGifts(
    type: 'create' | 'update' | 'delete',
    documentId: string,
    data?: unknown
  ): Promise<void> {
    // ユーザーIDはdataから取得するか、localStorageから取得
    const userId = (data as any)?.userId || this.getCurrentUserId();
    if (!userId) {
      throw new Error('贈答品の同期にユーザーIDが必要です');
    }

    switch (type) {
      case 'create': {
        if (!data) {
          throw new Error('作成操作にはデータが必要です');
        }
        // idを除外してcreateメソッドに渡す
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _giftId, ...giftData } = data as any;
        await firestoreGiftRepository.create(userId, giftData as any);
        break;
      }
      case 'update': {
        if (!data) {
          throw new Error('更新操作にはデータが必要です');
        }
        await firestoreGiftRepository.update(userId, documentId, data as any);
        break;
      }
      case 'delete':
        await firestoreGiftRepository.delete(userId, documentId);
        break;
      default:
        throw new Error(`不明な操作タイプ: ${type}`);
    }
  }

  /**
   * 人物の同期操作を実行
   */
  private async executeSyncOperationForPersons(
    type: 'create' | 'update' | 'delete',
    documentId: string,
    data?: unknown
  ): Promise<void> {
    // ユーザーIDはdataから取得するか、localStorageから取得
    const userId = (data as any)?.userId || this.getCurrentUserId();
    if (!userId) {
      throw new Error('人物の同期にユーザーIDが必要です');
    }

    switch (type) {
      case 'create': {
        if (!data) {
          throw new Error('作成操作にはデータが必要です');
        }
        // idを除外してcreateメソッドに渡す
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _personId, ...personData } = data as any;
        await firestorePersonRepository.create(userId, personData as any);
        break;
      }
      case 'update': {
        if (!data) {
          throw new Error('更新操作にはデータが必要です');
        }
        await firestorePersonRepository.update(userId, documentId, data as any);
        break;
      }
      case 'delete':
        await firestorePersonRepository.delete(userId, documentId);
        break;
      default:
        throw new Error(`不明な操作タイプ: ${type}`);
    }
  }

  /**
   * 現在のユーザーIDを取得
   */
  private getCurrentUserId(): string | null {
    // AuthContextから取得するのが理想だが、ここではlocalStorageから取得
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.uid;
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
    return null;
  }

  /**
   * 贈答品の同期
   */
  private async syncGifts(userId: string): Promise<void> {
    try {
      // Firestoreから最新データ取得
      const remoteGifts = await firestoreGiftRepository.getAll(userId);

      // IndexedDBから現在のデータ取得
      const localGifts = await giftRepository.getAll(userId);

      // リモートとローカルを比較して同期
      for (const remoteGift of remoteGifts) {
        const localGift = localGifts.find((g: any) => g.id === remoteGift.id);

        if (!localGift) {
          // ローカルに存在しない → 追加
          await giftRepository.create(remoteGift);
        } else {
          // 競合解決（Last-Write-Wins）
          if (remoteGift.updatedAt > localGift.updatedAt) {
            await giftRepository.update(remoteGift);
          }
        }
      }

      // ローカルにあってリモートにない → アップロード
      for (const localGift of localGifts) {
        const remoteGift = remoteGifts.find((g: any) => g.id === localGift.id);
        if (!remoteGift) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...giftWithoutId } = localGift;
          await firestoreGiftRepository.create(userId, giftWithoutId as any);
        }
      }
    } catch (error) {
      console.error('Gift sync error:', error);
      throw error;
    }
  }

  /**
   * 人物の同期
   */
  private async syncPersons(userId: string): Promise<void> {
    try {
      // Firestoreから最新データ取得
      const remotePersons = await firestorePersonRepository.getAll(userId);

      // IndexedDBから現在のデータ取得
      const localPersons = await personRepository.getAll(userId);

      // リモートとローカルを比較して同期
      for (const remotePerson of remotePersons) {
        const localPerson = localPersons.find((p: any) => p.id === remotePerson.id);

        if (!localPerson) {
          // ローカルに存在しない → 追加
          await personRepository.create(remotePerson);
        } else {
          // 競合解決（Last-Write-Wins）
          if (remotePerson.updatedAt > localPerson.updatedAt) {
            await personRepository.update(remotePerson);
          }
        }
      }

      // ローカルにあってリモートにない → アップロード
      for (const localPerson of localPersons) {
        const remotePerson = remotePersons.find((p: any) => p.id === localPerson.id);
        if (!remotePerson) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...personWithoutId } = localPerson;
          await firestorePersonRepository.create(userId, personWithoutId as any);
        }
      }
    } catch (error) {
      console.error('Person sync error:', error);
      throw error;
    }
  }

  /**
   * 同期状態を取得
   */
  getSyncStatus(): SyncStatus {
    const lastSyncStr = localStorage.getItem('lastSyncTime');
    const lastSyncTime = lastSyncStr ? new Date(lastSyncStr) : null;

    return {
      isSyncing: this.isSyncing,
      lastSyncTime,
      pendingOperations: this.syncQueue.filter((op) => op.status === 'pending').length,
      isOnline: navigator.onLine,
    };
  }

  /**
   * 同期キューをクリア
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  /**
   * 手動同期をトリガー
   */
  async triggerSync(userId: string): Promise<SyncResult> {
    return this.executeSync(userId);
  }
}

export const syncManager = new SyncManager();
