/**
 * 通知設定コンポーネント
 */

import { useState, useEffect } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
  showNotification,
  NotificationSettings as Settings,
} from '@/services/notificationService';
import { BellIcon, BellSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function NotificationSettings() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<Settings>(getNotificationSettings());
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const { permission: currentPermission, isSupported: supported } = getNotificationPermission();
    setPermission(currentPermission);
    setIsSupported(supported);
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        // テスト通知を送信
        await showNotification({
          title: '通知が有効になりました',
          body: 'リマインダー通知を受け取れます',
        });
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSettingsChange = (key: keyof Settings, value: boolean | string | number) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      alert('通知の許可が必要です');
      return;
    }

    await showNotification({
      title: 'テスト通知',
      body: 'これはテスト通知です。実際のリマインダーはこのように表示されます。',
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellSlashIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              通知機能が利用できません
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              お使いのブラウザは通知機能をサポートしていません。
              最新のChrome、Firefox、Safari、Edgeをご利用ください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 通知許可状態 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BellIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              通知設定
            </h2>
          </div>
          
          {/* 許可状態バッジ */}
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">許可済み</span>
              </>
            ) : permission === 'denied' ? (
              <>
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">拒否</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">未設定</span>
            )}
          </div>
        </div>

        {/* 許可リクエスト */}
        {permission !== 'granted' && (
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                リマインダーの通知を受け取るには、ブラウザの通知許可が必要です。
                {permission === 'denied' && (
                  <span className="block mt-2 font-medium">
                    ブラウザの設定から通知を有効にしてください。
                  </span>
                )}
              </p>
            </div>
            
            {permission !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? '許可を要求中...' : '通知を許可する'}
              </button>
            )}
          </div>
        )}

        {/* 通知設定 */}
        {permission === 'granted' && (
          <div className="space-y-4">
            {/* 通知の有効/無効 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  通知を有効にする
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  リマインダーの通知を受け取る
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.enabled && (
              <>
                {/* 通知時刻 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    通知時刻
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleSettingsChange('reminderTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    リマインダーを確認する時刻
                  </p>
                </div>

                {/* 通知する日数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    何日前に通知するか
                  </label>
                  <select
                    value={settings.reminderDaysBefore}
                    onChange={(e) => handleSettingsChange('reminderDaysBefore', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="0">当日</option>
                    <option value="1">1日前</option>
                    <option value="3">3日前</option>
                    <option value="7">1週間前</option>
                    <option value="14">2週間前</option>
                    <option value="30">1ヶ月前</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    リマインダー期限の何日前に通知を受け取るか
                  </p>
                </div>

                {/* テスト通知ボタン */}
                <button
                  onClick={handleTestNotification}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  テスト通知を送信
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 使い方ガイド */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          通知機能について
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">•</span>
            <span>リマインダーの期限が近づくと通知が表示されます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">•</span>
            <span>お返し期限の通知も受け取れます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">•</span>
            <span>通知はブラウザが起動していなくても表示されます（PWAとしてインストール時）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">•</span>
            <span>通知をクリックすると該当のリマインダーが開きます</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
