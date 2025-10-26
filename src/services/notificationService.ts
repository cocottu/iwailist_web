/**
 * プッシュ通知サービス
 * Web Notifications APIを使用したブラウザ通知機能
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
}

export interface NotificationPermissionResult {
  permission: 'default' | 'granted' | 'denied';
  isSupported: boolean;
}

/**
 * ブラウザが通知をサポートしているか確認
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * 現在の通知許可状態を取得
 */
export function getNotificationPermission(): NotificationPermissionResult {
  const isSupported = isNotificationSupported();
  const permission = isSupported ? (window.Notification?.permission || 'denied') : 'denied';
  
  return {
    permission,
    isSupported,
  };
}

/**
 * 通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<'default' | 'granted' | 'denied'> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await window.Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * 通知を表示
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  const { permission, isSupported } = getNotificationPermission();

  if (!isSupported) {
    console.warn('Notifications are not supported');
    return;
  }

  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Service Workerが利用可能な場合はそれを使用
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/pwa-192x192.png',
      badge: options.badge || '/pwa-192x192.png',
      tag: options.tag || `notification-${Date.now()}`,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      // @ts-expect-error - vibrate is not in TypeScript type definition but is a valid Web API
      vibrate: [200, 100, 200], // バイブレーションパターン
      actions: [
        {
          action: 'open',
          title: '開く',
        },
        {
          action: 'close',
          title: '閉じる',
        },
      ],
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
    
    // フォールバック: 通常の通知
    if (window.Notification?.permission === 'granted') {
      new window.Notification(options.title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        tag: options.tag,
      });
    }
  }
}

/**
 * リマインダー通知を表示
 */
export async function showReminderNotification(
  giftName: string,
  reminderMessage: string,
  giftId: string
): Promise<void> {
  await showNotification({
    title: 'リマインダー',
    body: `${giftName}: ${reminderMessage}`,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `reminder-${giftId}`,
    data: {
      type: 'reminder',
      giftId,
    },
    requireInteraction: true,
  });
}

/**
 * お返し期限通知を表示
 */
export async function showReturnDeadlineNotification(
  giftName: string,
  daysLeft: number,
  giftId: string
): Promise<void> {
  const body = daysLeft === 0
    ? `${giftName}のお返し期限は今日です`
    : daysLeft < 0
    ? `${giftName}のお返し期限が${Math.abs(daysLeft)}日過ぎています`
    : `${giftName}のお返し期限まであと${daysLeft}日です`;

  await showNotification({
    title: 'お返し期限のお知らせ',
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `return-deadline-${giftId}`,
    data: {
      type: 'return-deadline',
      giftId,
      daysLeft,
    },
    requireInteraction: true,
  });
}

/**
 * スケジュール通知を設定（指定時刻に通知）
 */
export async function scheduleNotification(
  date: Date,
  options: NotificationOptions
): Promise<void> {
  const now = new Date();
  const delay = date.getTime() - now.getTime();

  if (delay <= 0) {
    // 既に過去の時刻の場合は即座に表示
    await showNotification(options);
    return;
  }

  // 最大遅延時間（約24日）を超える場合は警告
  const MAX_TIMEOUT = 2147483647; // 32ビット符号付き整数の最大値
  if (delay > MAX_TIMEOUT) {
    console.warn('Delay is too large for setTimeout, notification will not be scheduled');
    return;
  }

  // 指定時刻まで待機してから通知を表示
  setTimeout(async () => {
    await showNotification(options);
  }, delay);
}

/**
 * 通知設定を保存
 */
export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:mm形式
  reminderDaysBefore: number; // 何日前に通知するか
}

const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

/**
 * 通知設定を取得
 */
export function getNotificationSettings(): NotificationSettings {
  const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse notification settings:', error);
    }
  }

  // デフォルト設定
  return {
    enabled: false,
    reminderTime: '09:00',
    reminderDaysBefore: 3,
  };
}

/**
 * 通知設定を保存
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * 通知をクリア
 */
export async function clearNotification(tag: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications({ tag });
    
    notifications.forEach((notification) => {
      notification.close();
    });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
}

/**
 * すべての通知をクリア
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    
    notifications.forEach((notification) => {
      notification.close();
    });
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
  }
}
