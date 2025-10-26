/**
 * 広告バナーコンポーネント
 * Google AdSense統合の準備
 */

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

/**
 * 広告バナーコンポーネント
 * 
 * 使用方法:
 * 1. Google AdSenseで広告ユニットを作成
 * 2. 広告IDとスロットIDを環境変数に設定
 * 3. このコンポーネントを配置したい場所に挿入
 * 
 * 環境変数:
 * - VITE_ADSENSE_CLIENT_ID: AdSenseクライアントID（ca-pub-XXXXXXXXXXXXXXXX）
 * - VITE_ADSENSE_SLOT: 広告スロットID
 */
export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adSenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const adSenseSlot = slot || import.meta.env.VITE_ADSENSE_SLOT;

  useEffect(() => {
    // AdSenseが設定されていない場合は何もしない
    if (!adSenseClientId || !adSenseSlot) {
      console.log('AdSense is not configured');
      return;
    }

    try {
      // AdSenseスクリプトが読み込まれているか確認
      if (typeof window !== 'undefined' && (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle) {
        // 広告を表示
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [adSenseClientId, adSenseSlot]);

  // AdSenseが設定されていない場合は開発用プレースホルダーを表示
  if (!adSenseClientId || !adSenseSlot) {
    if (import.meta.env.DEV) {
      return (
        <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 ${className}`}>
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              広告スペース（開発モード）
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              AdSense設定後に広告が表示されます
            </p>
          </div>
        </div>
      );
    }
    // 本番環境では何も表示しない
    return null;
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adSenseClientId}
        data-ad-slot={adSenseSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
