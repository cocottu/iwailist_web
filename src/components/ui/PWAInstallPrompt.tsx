import { usePWAInstall } from '@/hooks';
import { Button } from './Button';

/**
 * PWAインストールを促すプロンプト
 */
export function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissInstallPrompt } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0">
          <svg 
            className="w-12 h-12 text-blue-500" 
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
            <Button
              onClick={promptInstall}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              インストール
            </Button>
            <Button
              onClick={dismissInstallPrompt}
              variant="outline"
              size="sm"
            >
              後で
            </Button>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={dismissInstallPrompt}
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
