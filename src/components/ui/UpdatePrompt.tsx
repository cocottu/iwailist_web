import { useEffect } from 'react';
import { useSWUpdate } from '@/hooks';
import { toast } from 'sonner';

/**
 * Service Worker更新を促すプロンプト
 * Sonnerのカスタムトーストとして実装
 */
export function UpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker } = useSWUpdate();

  // 新しいバージョンが利用可能な場合
  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    const toastId = toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full">
          <div className="flex items-start gap-3">
            {/* アイコン */}
            <div className="flex-shrink-0">
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
            </div>

            {/* コンテンツ */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                新しいバージョンが利用可能です
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                アプリを更新して最新機能をお使いください
              </p>
              <button
                onClick={async () => {
                  await updateServiceWorker(true);
                  toast.dismiss(t);
                }}
                className="w-full px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors"
              >
                今すぐ更新
              </button>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => toast.dismiss(t)}
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
      ),
      {
        duration: Infinity,
        position: 'bottom-center',
      }
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, [needRefresh, updateServiceWorker]);

  // オフライン対応完了の通知
  useEffect(() => {
    if (!offlineReady) {
      return;
    }

    toast.success('オフライン対応完了', {
      description: 'アプリをオフラインで利用できるようになりました',
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      duration: 5000,
    });
  }, [offlineReady]);

  return null;
}
