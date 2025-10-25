import { useEffect } from 'react';
import { usePWAInstall } from '@/hooks';
import { toast } from 'sonner';

/**
 * PWAインストールを促すプロンプト
 * Sonnerのカスタムトーストとして実装
 */
export function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissInstallPrompt } = usePWAInstall();

  useEffect(() => {
    if (!isInstallable) {
      return;
    }

    // インストール可能になったらトーストを表示
    const toastId = toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full">
          <div className="flex items-start gap-3">
            {/* アイコン */}
            <div className="flex-shrink-0">
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>

            {/* コンテンツ */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                アプリをインストール
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                ホーム画面に追加して、いつでも素早くアクセスできます
              </p>

              {/* ボタン */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await promptInstall();
                    toast.dismiss(t);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                  インストール
                </button>
                <button
                  onClick={() => {
                    dismissInstallPrompt();
                    toast.dismiss(t);
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  後で
                </button>
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => {
                dismissInstallPrompt();
                toast.dismiss(t);
              }}
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
        duration: Infinity, // 手動で閉じるまで表示
        position: 'bottom-center',
      }
    );

    // クリーンアップ
    return () => {
      toast.dismiss(toastId);
    };
  }, [isInstallable, promptInstall, dismissInstallPrompt]);

  return null;
}
