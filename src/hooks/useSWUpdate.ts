import { useState, useEffect, useRef } from 'react';

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    let intervalId: number | null = null;
    let cleanupRegistration: (() => void) | null = null;
    let cleanupStateChange: (() => void) | null = null;

    const setupServiceWorker = async (): Promise<void> => {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        if (!isMountedRef.current) {
          return;
        }

        console.log('✅ Service Worker が登録されました');

        const handleUpdateFound = (): void => {
          const newWorker = registration.installing;
          if (!newWorker) {
            return;
          }

          cleanupStateChange?.();

          const handleStateChange = (): void => {
            if (!isMountedRef.current) {
              return;
            }
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 新しいバージョンが利用可能です');
              setNeedRefresh(true);
            }
          };

          newWorker.addEventListener('statechange', handleStateChange);
          cleanupStateChange = () => {
            if (typeof newWorker.removeEventListener === 'function') {
              newWorker.removeEventListener('statechange', handleStateChange);
            }
          };
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        cleanupRegistration = () => {
          if (typeof registration.removeEventListener === 'function') {
            registration.removeEventListener('updatefound', handleUpdateFound);
          }
        };

        if (registration.active) {
          console.log('📴 オフラインで利用可能になりました');
          setOfflineReady(true);
        }

        intervalId = window.setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        if (isMountedRef.current) {
          console.error('❌ Service Worker の登録に失敗しました:', error);
        }
      }
    };

    void setupServiceWorker();

    // Service Worker登録の監視
    return () => {
      isMountedRef.current = false;
      cleanupStateChange?.();
      cleanupRegistration?.();
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const updateServiceWorker = async (reloadPage = false): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      if (reloadPage) {
        window.location.reload();
      }
      
      if (isMountedRef.current) {
        setNeedRefresh(false);
      }
    }
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  };
}
