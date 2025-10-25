/**
 * 通知ユーティリティ (Sonnerベース)
 * alert()やconfirm()の代わりに使用する適切な通知システム
 */

import React from 'react';
import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * 通知マネージャー
 * Sonnerライブラリを使用した統一的な通知システム
 */
class NotificationManager {
  /**
   * 通知を表示
   */
  show(options: NotificationOptions): void {
    const { title, message, type = 'info', duration } = options;
    
    const toastOptions = {
      duration,
      description: title ? message : undefined,
    };

    switch (type) {
      case 'success':
        toast.success(title || message, toastOptions);
        break;
      case 'error':
        toast.error(title || message, toastOptions);
        break;
      case 'warning':
        toast.warning(title || message, toastOptions);
        break;
      case 'info':
        toast.info(title || message, toastOptions);
        break;
      default:
        toast(title || message, toastOptions);
    }
  }

  /**
   * 確認ダイアログ
   * Sonnerのカスタムトーストを使用した確認ダイアログ
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const { title, message, confirmText = 'OK', cancelText = 'キャンセル' } = options;
      
      toast(title || message, {
        description: title ? message : undefined,
        action: {
          label: confirmText,
          onClick: () => resolve(true),
        },
        cancel: {
          label: cancelText,
          onClick: () => resolve(false),
        },
        duration: Infinity, // 手動で閉じるまで表示
      });
    });
  }

  /**
   * 成功通知
   */
  success(message: string, title?: string): void {
    this.show({ message, title, type: 'success' });
  }

  /**
   * エラー通知
   */
  error(message: string, title?: string): void {
    this.show({ message, title, type: 'error' });
  }

  /**
   * 警告通知
   */
  warning(message: string, title?: string): void {
    this.show({ message, title, type: 'warning' });
  }

  /**
   * 情報通知
   */
  info(message: string, title?: string): void {
    this.show({ message, title, type: 'info' });
  }

  /**
   * カスタムトーストを表示
   * コールバック関数を渡してカスタムコンテンツを表示
   */
  custom(content: (id: string | number) => React.ReactElement, options?: { duration?: number }): string | number {
    return toast.custom(content, options);
  }

  /**
   * プロミストースト（読み込み中→成功/エラー）
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ): void {
    toast.promise(promise, messages);
  }

  /**
   * 読み込み中トーストを表示
   */
  loading(message: string): string | number {
    return toast.loading(message);
  }

  /**
   * 特定のトーストを閉じる
   */
  dismiss(toastId?: string | number): void {
    toast.dismiss(toastId);
  }
}

export const notifications = new NotificationManager();
