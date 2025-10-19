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
        await this.syncGifts(userId);
        await this.syncPersons(userId);
      }

      // 同期キューを処理
      await this.processSyncQueue(result);

      this.lastSyncTime = new Date();
      localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
    } catch (error) {
      console.error('Sync error:', error);
      result.success = false;
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
    // 実装は省略（実際の同期ロジック）
    console.log('Executing sync operation:', operation);
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
          await firestoreGiftRepository.create(userId, localGift);
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
          await firestorePersonRepository.create(userId, localPerson);
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
