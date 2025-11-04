/**
 * データ同期マネージャー
 * IndexedDB ⇔ Firestore の双方向同期を管理
 */
import { onSnapshot, collection, query, orderBy as firestoreOrderBy } from 'firebase/firestore';
import { GiftRepository } from '../database/repositories/giftRepository';
import { PersonRepository } from '../database/repositories/personRepository';
import { firestoreGiftRepository } from '../repositories/firebase/giftRepository';
import { firestorePersonRepository } from '../repositories/firebase/personRepository';
import { isFirebaseEnabled, db } from '../lib/firebase';
import { SyncOperation, SyncResult, SyncStatus } from '../types/firebase';
import { firestoreService } from './firestoreService';

const giftRepository = new GiftRepository();
const personRepository = new PersonRepository();

class SyncManager {
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private syncQueue: SyncOperation[] = [];
  private readonly SYNC_QUEUE_KEY = 'syncQueue';
  private unsubscribeGifts: (() => void) | null = null;
  private unsubscribePersons: (() => void) | null = null;
  private isFirstGiftsSnapshot = true;
  private isFirstPersonsSnapshot = true;

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
    const userId = (data && typeof data === 'object' && 'userId' in data ? String(data.userId) : null) || this.getCurrentUserId();
    if (!userId) {
      throw new Error('贈答品の同期にユーザーIDが必要です');
    }

    switch (type) {
      case 'create': {
        if (!data) {
          throw new Error('作成操作にはデータが必要です');
        }
        // IDを保持して作成
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const { id: giftId, userId: _userId, ...giftData } = data as any;
        if (giftId) {
          await firestoreGiftRepository.createWithId(userId, String(giftId), giftData);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await firestoreGiftRepository.create(userId, giftData as any);
        }
        break;
      }
      case 'update': {
        if (!data) {
          throw new Error('更新操作にはデータが必要です');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const userId = (data && typeof data === 'object' && 'userId' in data ? String(data.userId) : null) || this.getCurrentUserId();
    if (!userId) {
      throw new Error('人物の同期にユーザーIDが必要です');
    }

    switch (type) {
      case 'create': {
        if (!data) {
          throw new Error('作成操作にはデータが必要です');
        }
        // IDを保持して作成
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const { id: personId, userId: _userId, ...personData } = data as any;
        if (personId) {
          await firestorePersonRepository.createWithId(userId, String(personId), personData);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await firestorePersonRepository.create(userId, personData as any);
        }
        break;
      }
      case 'update': {
        if (!data) {
          throw new Error('更新操作にはデータが必要です');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (!isFirebaseEnabled()) {
      console.log('Firebase is not enabled, skipping gift sync');
      return;
    }

    try {
      // Firestoreから最新データ取得
      const remoteGifts = await firestoreGiftRepository.getAll(userId);

      // IndexedDBから現在のデータ取得
      const localGifts = await giftRepository.getAll(userId);

      // リモートとローカルを比較して同期
      for (const remoteGift of remoteGifts) {
        const localGift = localGifts.find((g) => g.id === remoteGift.id);

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
      // 既にFirestoreに同じIDで存在する可能性があるので、まず確認
      for (const localGift of localGifts) {
        const remoteGift = remoteGifts.find((g) => g.id === localGift.id);
        if (!remoteGift) {
          try {
            // 既存のドキュメントがあるかチェック
            const existing = await firestoreGiftRepository.get(userId, localGift.id);
            if (!existing) {
              // 存在しない場合のみ作成（IDを保持）
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, userId: _userId, ...giftData } = localGift;
              await firestoreGiftRepository.createWithId(userId, id, giftData);
            } else if (localGift.updatedAt > existing.updatedAt) {
              // 既に存在するがローカルの方が新しい場合は更新
              await firestoreGiftRepository.update(userId, localGift.id, localGift);
            }
          } catch (error) {
            console.error('Failed to sync local gift to Firestore:', error);
            // 個別のエラーは記録するが、全体の同期は続行
          }
        } else if (localGift.updatedAt > remoteGift.updatedAt) {
          // ローカルの方が新しい場合は更新
          await firestoreGiftRepository.update(userId, localGift.id, localGift);
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
    if (!isFirebaseEnabled()) {
      console.log('Firebase is not enabled, skipping person sync');
      return;
    }

    try {
      // Firestoreから最新データ取得
      const remotePersons = await firestorePersonRepository.getAll(userId);

      // IndexedDBから現在のデータ取得
      const localPersons = await personRepository.getAll(userId);

      // リモートとローカルを比較して同期
      for (const remotePerson of remotePersons) {
        const localPerson = localPersons.find((p) => p.id === remotePerson.id);

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
      // 既にFirestoreに同じIDで存在する可能性があるので、まず確認
      for (const localPerson of localPersons) {
        const remotePerson = remotePersons.find((p) => p.id === localPerson.id);
        if (!remotePerson) {
          try {
            // 既存のドキュメントがあるかチェック
            const existing = await firestorePersonRepository.get(userId, localPerson.id);
            if (!existing) {
              // 存在しない場合のみ作成（IDを保持）
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, userId: _userId, ...personData } = localPerson;
              await firestorePersonRepository.createWithId(userId, id, personData);
            } else if (localPerson.updatedAt > existing.updatedAt) {
              // 既に存在するがローカルの方が新しい場合は更新
              await firestorePersonRepository.update(userId, localPerson.id, localPerson);
            }
          } catch (error) {
            console.error('Failed to sync local person to Firestore:', error);
            // 個別のエラーは記録するが、全体の同期は続行
          }
        } else if (localPerson.updatedAt > remotePerson.updatedAt) {
          // ローカルの方が新しい場合は更新
          await firestorePersonRepository.update(userId, localPerson.id, localPerson);
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

  /**
   * リアルタイムリスナーを開始
   */
  startRealtimeSync(userId: string): void {
    if (!isFirebaseEnabled() || !db) {
      console.log('Firebase is not enabled, skipping realtime sync setup');
      return;
    }

    // 既存のリスナーを停止
    this.stopRealtimeSync();

    this.isFirstGiftsSnapshot = true;
    this.isFirstPersonsSnapshot = true;
    console.log('[SyncManager] Starting realtime sync for user:', userId);

    try {
      // 贈答品のリスナーを設定
      const giftsPath = firestoreService.getUserCollectionPath(userId, 'gifts');
      const giftsRef = collection(db, giftsPath);
      const giftsQuery = query(giftsRef, firestoreOrderBy('receivedDate', 'desc'));

      this.unsubscribeGifts = onSnapshot(
        giftsQuery,
        async (snapshot) => {
          console.log('[SyncManager] Gifts snapshot received:', snapshot.size, 'documents');
          
          // 初回読み込みをスキップ（既にtriggerSyncで処理済み）
          if (this.isFirstGiftsSnapshot) {
            console.log('[SyncManager] Skipping first gifts snapshot (initial load)');
            this.isFirstGiftsSnapshot = false;
            return;
          }
          
          // 自分の書き込みをスキップ
          if (snapshot.metadata.hasPendingWrites) {
            console.log('[SyncManager] Skipping gifts snapshot (pending writes)');
            return;
          }

          try {
            const changes = snapshot.docChanges();
            console.log('[SyncManager] Processing', changes.length, 'gift changes');

            for (const change of changes) {
              const giftId = change.doc.id;
              const data = change.doc.data();

              if (change.type === 'added' || change.type === 'modified') {
                // Firestoreの形式からGift型に変換
                const gift = {
                  id: giftId,
                  userId,
                  personId: data.personId,
                  giftName: data.giftName,
                  receivedDate: data.receivedDate.toDate(),
                  amount: data.amount,
                  category: data.category,
                  returnStatus: data.returnStatus,
                  memo: data.memo,
                  createdAt: data.createdAt.toDate(),
                  updatedAt: data.updatedAt.toDate(),
                };

                // IndexedDBに反映（既存チェックして更新または追加）
                const existing = await giftRepository.get(giftId);
                if (existing) {
                  // ローカルの方が新しい場合はスキップ
                  if (existing.updatedAt >= gift.updatedAt) {
                    console.log('[SyncManager] Local gift is newer, skipping update:', giftId);
                    continue;
                  }
                  await giftRepository.update(gift);
                  console.log('[SyncManager] Gift updated in IndexedDB:', giftId);
                } else {
                  await giftRepository.create(gift);
                  console.log('[SyncManager] Gift added to IndexedDB:', giftId);
                }
              } else if (change.type === 'removed') {
                // 削除された場合
                await giftRepository.delete(giftId, userId);
                console.log('[SyncManager] Gift deleted from IndexedDB:', giftId);
              }
            }

            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
          } catch (error) {
            console.error('[SyncManager] Error processing gifts snapshot:', error);
          }
        },
        (error) => {
          console.error('[SyncManager] Gifts snapshot error:', error);
        }
      );

      // 人物のリスナーを設定
      const personsPath = firestoreService.getUserCollectionPath(userId, 'persons');
      const personsRef = collection(db, personsPath);
      const personsQuery = query(personsRef, firestoreOrderBy('name', 'asc'));

      this.unsubscribePersons = onSnapshot(
        personsQuery,
        async (snapshot) => {
          console.log('[SyncManager] Persons snapshot received:', snapshot.size, 'documents');
          
          // 初回読み込みをスキップ（既にtriggerSyncで処理済み）
          if (this.isFirstPersonsSnapshot) {
            console.log('[SyncManager] Skipping first persons snapshot (initial load)');
            this.isFirstPersonsSnapshot = false;
            return;
          }
          
          // 自分の書き込みをスキップ
          if (snapshot.metadata.hasPendingWrites) {
            console.log('[SyncManager] Skipping persons snapshot (pending writes)');
            return;
          }

          try {
            const changes = snapshot.docChanges();
            console.log('[SyncManager] Processing', changes.length, 'person changes');

            for (const change of changes) {
              const personId = change.doc.id;
              const data = change.doc.data();

              if (change.type === 'added' || change.type === 'modified') {
                // Firestoreの形式からPerson型に変換
                const person = {
                  id: personId,
                  userId,
                  name: data.name,
                  furigana: data.furigana,
                  relationship: data.relationship,
                  contact: data.contact,
                  memo: data.memo,
                  createdAt: data.createdAt.toDate(),
                  updatedAt: data.updatedAt.toDate(),
                };

                // IndexedDBに反映
                const existing = await personRepository.get(personId);
                if (existing) {
                  // ローカルの方が新しい場合はスキップ
                  if (existing.updatedAt >= person.updatedAt) {
                    console.log('[SyncManager] Local person is newer, skipping update:', personId);
                    continue;
                  }
                  await personRepository.update(person);
                  console.log('[SyncManager] Person updated in IndexedDB:', personId);
                } else {
                  await personRepository.create(person);
                  console.log('[SyncManager] Person added to IndexedDB:', personId);
                }
              } else if (change.type === 'removed') {
                // 削除された場合
                await personRepository.delete(personId, userId);
                console.log('[SyncManager] Person deleted from IndexedDB:', personId);
              }
            }

            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
          } catch (error) {
            console.error('[SyncManager] Error processing persons snapshot:', error);
          }
        },
        (error) => {
          console.error('[SyncManager] Persons snapshot error:', error);
        }
      );

      console.log('[SyncManager] Realtime sync started successfully');
    } catch (error) {
      console.error('[SyncManager] Failed to start realtime sync:', error);
    }
  }

  /**
   * リアルタイムリスナーを停止
   */
  stopRealtimeSync(): void {
    console.log('[SyncManager] Stopping realtime sync');
    
    if (this.unsubscribeGifts) {
      this.unsubscribeGifts();
      this.unsubscribeGifts = null;
      console.log('[SyncManager] Gifts listener unsubscribed');
    }

    if (this.unsubscribePersons) {
      this.unsubscribePersons();
      this.unsubscribePersons = null;
      console.log('[SyncManager] Persons listener unsubscribed');
    }
  }

  /**
   * リアルタイム同期が実行中かどうか
   */
  isRealtimeSyncActive(): boolean {
    return this.unsubscribeGifts !== null || this.unsubscribePersons !== null;
  }
}

export const syncManager = new SyncManager();
