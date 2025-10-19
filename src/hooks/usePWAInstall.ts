import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismissInstallPrompt: () => void;
}

/**
 * PWAインストール機能を提供するカスタムフック
 * @returns {UsePWAInstallReturn} PWAインストール関連の状態と関数
 */
export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // PWAが既にインストールされているかチェック
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        console.log('✅ PWAは既にインストールされています');
      }
    };

    checkInstalled();

    // beforeinstallpromptイベントをキャプチャ
    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトのインストールプロンプトを防ぐ
      e.preventDefault();
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      
      console.log('📱 PWAをインストール可能です');
    };

    // アプリがインストールされた時のイベント
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 PWAがインストールされました');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * インストールプロンプトを表示
   */
  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.warn('⚠️ インストールプロンプトが利用できません');
      return;
    }

    // インストールプロンプトを表示
    await deferredPrompt.prompt();

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ ユーザーがPWAのインストールを承認しました');
    } else {
      console.log('❌ ユーザーがPWAのインストールを拒否しました');
    }

    // プロンプトは一度しか使用できない
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  /**
   * インストールプロンプトを閉じる
   */
  const dismissInstallPrompt = (): void => {
    setIsInstallable(false);
    console.log('🚫 インストールプロンプトを閉じました');
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    dismissInstallPrompt
  };
}
