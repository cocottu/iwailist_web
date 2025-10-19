/**
 * 同期状態インジケーター
 */
import React from 'react';
import { useSync } from '../../hooks/useSync';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const SyncIndicator: React.FC = () => {
  const { isSyncing, lastSyncTime, pendingOperations, isOnline, sync, error } = useSync();

  // Firebase無効の場合は表示しない
  if (!isOnline && pendingOperations === 0) {
    return null;
  }

  const getStatusText = () => {
    if (isSyncing) {
      return '同期中...';
    }
    if (!isOnline) {
      return 'オフライン';
    }
    if (pendingOperations > 0) {
      return `${pendingOperations}件の変更を同期待ち`;
    }
    if (lastSyncTime) {
      return `最終同期: ${formatDistanceToNow(lastSyncTime, { locale: ja, addSuffix: true })}`;
    }
    return '同期準備完了';
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (isSyncing) return 'bg-blue-500';
    if (!isOnline || pendingOperations > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center space-x-3">
          {/* ステータスインジケーター */}
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}>
              {isSyncing && (
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
              )}
            </div>
          </div>

          {/* ステータステキスト */}
          <div className="flex-1">
            <p className="text-sm text-gray-700">{getStatusText()}</p>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error.message}</p>
            )}
          </div>

          {/* 同期ボタン */}
          {!isSyncing && isOnline && (
            <button
              onClick={sync}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncIndicator;
