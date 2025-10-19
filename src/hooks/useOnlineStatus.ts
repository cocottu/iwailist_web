import { useState, useEffect } from 'react';

/**
 * オンライン/オフライン状態を検知するカスタムフック
 * @returns {boolean} オンライン状態（true: オンライン, false: オフライン）
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // オンライン状態になった時のハンドラー
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 オンラインになりました');
    };

    // オフライン状態になった時のハンドラー
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 オフラインになりました');
    };

    // イベントリスナーを登録
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
