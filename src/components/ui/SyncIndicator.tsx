/**
 * 同期状態インジケーター
 * Sonnerのカスタムトーストとして実装
 */
import { useEffect } from 'react';
import { useSync } from '../../hooks/useSync';
import { toast } from 'sonner';

const SyncIndicator = () => {
  const { isSyncing, lastSyncTime, pendingOperations, isOnline, sync, error } = useSync();

  // 同期状態の通知
  useEffect(() => {
    // Firebase無効の場合は表示しない
    if (!isOnline && pendingOperations === 0) {
      return;
    }

    let toastId: string | number | undefined;

    // 同期中
    if (isSyncing) {
      toastId = toast.loading('同期中...', {
        duration: Infinity,
      });
      return () => {
        if (toastId) toast.dismiss(toastId);
      };
    }

    // エラー
    if (error) {
      toastId = toast.error('同期エラー', {
        description: error.message,
        duration: 5000,
      });
      return () => {
        if (toastId) toast.dismiss(toastId);
      };
    }

    // オフライン
    if (!isOnline) {
      toastId = toast.warning('オフライン', {
        description: 'ネットワークに接続されていません',
        duration: Infinity,
      });
      return () => {
        if (toastId) toast.dismiss(toastId);
      };
    }

    // 同期待ち
    if (pendingOperations > 0) {
      toastId = toast.custom(
        (t) => (
          <div className="bg-white rounded-lg shadow-lg border border-yellow-200 p-3 w-full">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {pendingOperations}件の変更を同期待ち
                </p>
              </div>
              <button
                onClick={() => {
                  sync();
                  toast.dismiss(t);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                aria-label="手動同期"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="閉じる"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
      return () => {
        if (toastId) toast.dismiss(toastId);
      };
    }

    // 「同期準備完了」の通知は削除 - ヘッダーの同期ボタンで状態を表示
  }, [isSyncing, lastSyncTime, pendingOperations, isOnline, error, sync]);

  return null;
};

export default SyncIndicator;
