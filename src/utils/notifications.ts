/**
 * 通知ユーティリティ
 * alert()やconfirm()の代わりに使用する適切な通知システム
 */

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

class NotificationManager {
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(options: NotificationOptions): void {
    if (!this.container) return;

    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${this.getBackgroundColor(options.type)};
      color: white;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;

    if (options.title) {
      const title = document.createElement('div');
      title.style.cssText = 'font-weight: bold; margin-bottom: 4px;';
      title.textContent = options.title;
      notification.appendChild(title);
    }

    const message = document.createElement('div');
    message.textContent = options.message;
    notification.appendChild(message);

    this.container.appendChild(notification);

    // 自動削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, options.duration || 3000);
  }

  private getBackgroundColor(type?: string): string {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  // 確認ダイアログの代替（簡易版）
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        options.title 
          ? `${options.title}\n\n${options.message}`
          : options.message
      );
      resolve(confirmed);
    });
  }

  // 成功通知
  success(message: string, title?: string): void {
    this.show({ message, title, type: 'success' });
  }

  // エラー通知
  error(message: string, title?: string): void {
    this.show({ message, title, type: 'error' });
  }

  // 警告通知
  warning(message: string, title?: string): void {
    this.show({ message, title, type: 'warning' });
  }

  // 情報通知
  info(message: string, title?: string): void {
    this.show({ message, title, type: 'info' });
  }
}

export const notifications = new NotificationManager();

// CSS アニメーションを追加
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
