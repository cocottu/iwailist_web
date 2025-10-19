import { useState, useEffect } from 'react';

interface UseSWUpdateReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

/**
 * Service Worker更新機能を提供するカスタムフック
 * Vite PWA Pluginの仮想モジュールを使用
 * @returns {UseSWUpdateReturn} SW更新関連の状態と関数
 */
export function useSWUpdate(): UseSWUpdateReturn {
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);

  useEffect(() => {
    // Service Worker登録の監視
    if ('serviceWorker' in navigator) {
      // Service Workerの更新を検知
      navigator.serviceWorker.ready.then((registration) => {
        console.log('✅ Service Worker が登録されました');
        
        // 更新をチェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新しいバージョンが利用可能
                console.log('🔄 新しいバージョンが利用可能です');
                setNeedRefresh(true);
              }
            });
          }
        });

        // オフライン対応完了
        if (registration.active) {
          console.log('📴 オフラインで利用可能になりました');
          setOfflineReady(true);
        }

        // 定期的に更新をチェック（1時間ごと）
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }).catch((error: Error) => {
        console.error('❌ Service Worker の登録に失敗しました:', error);
      });
    }
  }, []);

  const updateServiceWorker = async (reloadPage = false): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      if (reloadPage) {
        window.location.reload();
      }
      
      setNeedRefresh(false);
    }
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  };
}
