/**
 * データ同期フック
 */
import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '../services/syncManager';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';
import { SyncStatus } from '../types/firebase';

interface UseSyncReturn extends SyncStatus {
  sync: () => Promise<void>;
  retrySync: () => Promise<void>;
  clearSyncQueue: () => void;
  error: Error | null;
}

export const useSync = (): UseSyncReturn => {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getSyncStatus());
  const [error, setError] = useState<Error | null>(null);

  // 同期状態を定期的に更新
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 手動同期
  const sync = useCallback(async () => {
    if (!user) {
      // Firebase無効時はエラーを表示しない
      console.log('User not logged in, skipping sync');
      return;
    }

    setError(null);
    try {
      const result = await syncManager.triggerSync(user.uid);
      if (!result.success) {
        // 具体的なエラーメッセージを生成
        const errorMessages = result.errors.map(e => e.error.message).join(', ');
        const message = errorMessages 
          ? `同期に失敗しました: ${errorMessages}`
          : '同期に失敗しました';
        setError(new Error(message));
      } else if (result.errors.length > 0) {
        // 一部失敗した場合
        const errorMessages = result.errors.map(e => e.error.message).join(', ');
        setError(new Error(`一部のデータの同期に失敗しました: ${errorMessages}`));
      }
      setSyncStatus(syncManager.getSyncStatus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('同期処理中に予期しないエラーが発生しました');
      setError(error);
    }
  }, [user]);

  // オンライン復帰時に自動同期
  useEffect(() => {
    if (isOnline && user) {
      // 自動同期は意図的な動作なので、setState warningを無視
      void sync().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, user]);

  // リトライ
  const retrySync = useCallback(async () => {
    await sync();
  }, [sync]);

  // 同期キューをクリア
  const clearSyncQueue = useCallback(() => {
    syncManager.clearSyncQueue();
    setSyncStatus(syncManager.getSyncStatus());
  }, []);

  return {
    ...syncStatus,
    sync,
    retrySync,
    clearSyncQueue,
    error,
  };
};
