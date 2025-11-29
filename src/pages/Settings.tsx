/**
 * 設定ページ
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

type SettingsTab = 'notifications' | 'general';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Cog6ToothIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              設定
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            アプリケーションの設定を管理します
          </p>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            通知設定
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            一般設定
          </button>
        </div>

        {/* コンテンツ */}
        {activeTab === 'notifications' && <NotificationSettings />}
        
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                一般設定
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    法的事項
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/legal/operator"
                      className="block px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        運営者情報
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        本サービスの運営者に関する情報
                      </div>
                    </Link>
                    <Link
                      to="/legal/privacy"
                      className="block px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        プライバシーポリシー
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        個人情報の取り扱いについて
                      </div>
                    </Link>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    サポート
                  </h3>
                  <Link
                    to="/contact"
                    className="block px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      お問い合わせ
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ご質問・お問い合わせ・不具合報告
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
