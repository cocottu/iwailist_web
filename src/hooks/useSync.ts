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

  // オンライン復帰時に自動同期
  useEffect(() => {
    if (isOnline && user) {
      sync().catch(console.error);
    }
  }, [isOnline, user]);

  // 手動同期
  const sync = useCallback(async () => {
    if (!user) {
      setError(new Error('ユーザーがログインしていません'));
      return;
    }

    setError(null);
    try {
      const result = await syncManager.triggerSync(user.uid);
      if (!result.success) {
        setError(new Error('同期に失敗しました'));
      }
      setSyncStatus(syncManager.getSyncStatus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('同期エラー');
      setError(error);
    }
  }, [user]);

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
