/**
 * AdSenseスクリプトコンポーネント
 * ページのheadにAdSenseスクリプトを追加
 */

import { useEffect } from 'react';

export default function AdScript() {
  const adSenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!adSenseClientId || typeof window === 'undefined') {
      return;
    }

    // AdSenseスクリプトが既に読み込まれているか確認
    const existingScript = document.querySelector(
      `script[src*="adsbygoogle.js"]`
    );

    if (existingScript) {
      console.log('AdSense script already loaded');
      return;
    }

    // AdSenseスクリプトを動的に追加
    console.log('Loading AdSense script...');
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('AdSense script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
    };

    document.head.appendChild(script);

    // クリーンアップ
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [adSenseClientId]);

  return null;
}
