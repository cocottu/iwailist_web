import { useState } from 'react';
import { useSWUpdate } from '@/hooks';
import { Button } from './Button';

/**
 * Service Worker更新を促すプロンプト
 */
export function UpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker } = useSWUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!needRefresh && !offlineReady) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  return (
    <div className="fixed bottom-44 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0">
          {needRefresh ? (
            <svg 
              className="w-10 h-10 text-green-500" 
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
          ) : (
            <svg 
              className="w-10 h-10 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          )}
        </div>

        {/* コンテンツ */}
        <div className="flex-1">
          {needRefresh ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-1">
                新しいバージョンが利用可能です
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                アプリを更新して最新機能をお使いください
              </p>
              <Button
                onClick={handleUpdate}
                variant="primary"
                size="sm"
                className="w-full"
              >
                今すぐ更新
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 mb-1">
                オフライン対応完了
              </h3>
              <p className="text-sm text-gray-600">
                アプリをオフラインで利用できるようになりました
              </p>
            </>
          )}
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="閉じる"
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
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
