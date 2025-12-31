/**
 * 設定ページ
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

type SettingsTab = 'notifications' | 'general' | 'about';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const { theme, setTheme } = useTheme();

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
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            通知設定
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            一般設定
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            アプリ情報
          </button>
        </div>

        {/* コンテンツ */}
        {activeTab === 'notifications' && <NotificationSettings />}
        
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              一般設定
            </h2>
            
            {/* テーマ設定 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  テーマ
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  アプリの表示テーマを選択します
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* ライトモード */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <SunIcon className={`w-8 h-8 ${
                      theme === 'light' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      ライト
                    </span>
                  </button>
                  
                  {/* ダークモード */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <MoonIcon className={`w-8 h-8 ${
                      theme === 'dark' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      ダーク
                    </span>
                  </button>
                  
                  {/* システム設定 */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <ComputerDesktopIcon className={`w-8 h-8 ${
                      theme === 'system' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      システム
                    </span>
                  </button>
                </div>
                
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  「システム」を選択すると、デバイスの設定に合わせて自動的に切り替わります
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  アプリ情報
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                祝いリストに関する情報とサポート
              </p>
            </div>

            <nav className="divide-y divide-gray-200 dark:divide-gray-700">
              <Link
                to="/legal/operator"
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">運営者情報</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                to="/legal/privacy"
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">プライバシーポリシー</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                to="/contact"
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">お問い合わせ</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </Link>
            </nav>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} 祝いリスト
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
