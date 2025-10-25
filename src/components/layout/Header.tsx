import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSync } from '../../hooks/useSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isSyncing, lastSyncTime, pendingOperations, sync } = useSync();
  const isOnline = useOnlineStatus();

  // ドロップダウンメニューの外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">祝</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                祝い品管理
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ホーム
            </Link>
            <Link
              to="/gifts"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/gifts')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              贈答品
            </Link>
            <Link
              to="/returns"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/returns')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              お返し
            </Link>
            <Link
              to="/reminders"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/reminders')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              リマインダー
            </Link>
            <Link
              to="/persons"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/persons')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              人物
            </Link>
            <Link
              to="/statistics"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/statistics')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              統計
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* 同期ボタン - 認証済みの場合のみ表示 */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                {/* オンライン/オフライン状態インジケーター */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-600 hidden sm:inline">
                    {isOnline ? 'オンライン' : 'オフライン'}
                  </span>
                </div>
                
                {/* 同期ボタン */}
                <button
                  onClick={() => sync()}
                  disabled={isSyncing || !isOnline}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSyncing
                      ? 'bg-blue-50 text-blue-600 cursor-wait'
                      : !isOnline
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : pendingOperations > 0
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                  title={
                    isSyncing
                      ? '同期中...'
                      : !isOnline
                      ? 'オフライン - 同期できません'
                      : pendingOperations > 0
                      ? `${pendingOperations}件の変更を同期待ち`
                      : lastSyncTime
                      ? `最終同期: ${formatDistanceToNow(lastSyncTime, { locale: ja, addSuffix: true })}`
                      : '同期準備完了'
                  }
                  aria-label="データ同期"
                >
                  <svg
                    className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden md:inline">
                    {isSyncing
                      ? '同期中'
                      : pendingOperations > 0
                      ? `${pendingOperations}件`
                      : '同期済み'}
                  </span>
                </button>
              </div>
            )}

            {/* ユーザーメニュー */}
            {isAuthenticated && user && (
            <div className="relative ml-6" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
                aria-label="ユーザーメニュー"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'ユーザー'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ドロップダウンメニュー */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || 'ユーザー'}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                        setIsDropdownOpen(false);
                      } catch (error) {
                        console.error('ログアウトエラー:', error);
                        alert('ログアウトに失敗しました');
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
