import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSync } from '../../hooks/useSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { isFirebaseEnabled } from '../../lib/firebase';

const navigationItems = [
  { path: '/', label: 'ホーム', icon: '🏠' },
  { path: '/gifts', label: '贈答品', icon: '🎁' },
  { path: '/persons', label: '人物', icon: '👤' },
  { path: '/returns', label: 'お返し', icon: '↩️' },
  { path: '/reminders', label: 'リマインダー', icon: '⏰' },
  { path: '/statistics', label: '統計', icon: '📊' },
  { path: '/data-management', label: 'データ管理', icon: '💾' },
  { path: '/settings', label: '設定', icon: '⚙️' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { isSyncing, lastSyncTime, pendingOperations, sync } = useSync();
  const isOnline = useOnlineStatus();
  const firebaseEnabled = isFirebaseEnabled();

  const canSync = isAuthenticated && !!user && isOnline && firebaseEnabled;

  const syncUnavailableReason: string | null = (() => {
    if (!firebaseEnabled) return '同期を利用できません（設定未完了）';
    if (!isAuthenticated || !user) return 'ログインが必要です';
    if (!isOnline) return 'オフラインのため同期不可';
    return null;
  })();

  // ドロップダウンメニューの外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  // ESCキーでモバイルメニューを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // メニューが開いている時は背景のスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // メニュー項目をクリックしたらモバイルメニューを閉じる
  const handleMobileMenuClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  
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
            <Link
              to="/data-management"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/data-management')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              データ管理
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/settings')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              設定
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* デスクトップ用：同期ステータス/ボタン領域 */}
            <div className="hidden md:flex items-center gap-2">
              {/* オンライン/オフライン状態インジケーター */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-600">
                  {isOnline ? 'オンライン' : 'オフライン'}
                </span>
              </div>

              {/* 同期不可理由 */}
              {syncUnavailableReason && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                  <span className="whitespace-nowrap">{syncUnavailableReason}</span>
                </div>
              )}

              {/* 同期ボタン（利用可能時のみ表示） */}
              {canSync && (
                <button
                  onClick={() => sync()}
                  disabled={isSyncing}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSyncing
                      ? 'bg-blue-50 text-blue-600 cursor-wait'
                      : pendingOperations > 0
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
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
                  <span>
                    {isSyncing
                      ? '同期中'
                      : pendingOperations > 0
                      ? `${pendingOperations}件`
                      : lastSyncTime
                      ? `最終: ${formatDistanceToNow(lastSyncTime, { locale: ja, addSuffix: true })}`
                      : '同期済み'}
                  </span>
                </button>
              )}
            </div>

            {/* デスクトップ用：ユーザーメニュー */}
            {isAuthenticated && user && (
            <div className="hidden md:block relative ml-6" ref={dropdownRef}>
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

            {/* モバイル用ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="メニューを開く"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニューオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* モバイルメニュー */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-16 left-0 right-0 bottom-0 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="px-4 py-6">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleMobileMenuClick(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <svg
                      className="w-5 h-5 ml-auto text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* 同期ステータス（モバイルメニュー内） */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="px-4 mb-4 space-y-3">
              {/* オンライン/オフライン状態 */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? 'オンライン' : 'オフライン'}
                </span>
              </div>

              {/* 同期不可理由 */}
              {syncUnavailableReason && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                  <span>{syncUnavailableReason}</span>
                </div>
              )}

              {/* 同期ボタン（利用可能時のみ表示） */}
              {canSync && (
                <button
                  onClick={() => {
                    sync();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isSyncing}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isSyncing
                      ? 'bg-blue-50 text-blue-600 cursor-wait'
                      : pendingOperations > 0
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                  aria-label="データ同期"
                >
                  <svg
                    className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
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
                  <span>
                    {isSyncing
                      ? '同期中...'
                      : pendingOperations > 0
                      ? `同期待ち: ${pendingOperations}件`
                      : lastSyncTime
                      ? `最終同期: ${formatDistanceToNow(lastSyncTime, { locale: ja, addSuffix: true })}`
                      : 'データを同期'}
                  </span>
                </button>
              )}
            </div>

            {/* ユーザー情報とログアウト（モバイルメニュー内） */}
            {isAuthenticated && user && (
              <>
                <div className="px-4 mb-4">
                  <p className="text-sm font-medium text-gray-900">{user.displayName || 'ユーザー'}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await signOut();
                      setIsMobileMenuOpen(false);
                    } catch (error) {
                      console.error('ログアウトエラー:', error);
                      alert('ログアウトに失敗しました');
                    }
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
