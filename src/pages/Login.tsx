/**
 * ログインページ
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseEnabled, getFirebaseConfigStatus } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // リダイレクト処理中かチェック（初期表示時からローディングを表示するため）
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authRedirectPending') === 'true';
    }
    return false;
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 開発環境でFirebase設定をコンソールに出力
  useEffect(() => {
    if (import.meta.env.DEV) {
      getFirebaseConfigStatus();
    }
  }, []);

  // ログイン済みの場合はダッシュボードへ自動遷移
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 認証状態の確認が完了したらローディングを解除
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // 認証状態確認中またはリダイレクト処理中はローディング画面を表示
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Googleでログイン中...' : '認証状態を確認中...'}
          </p>
        </div>
      </div>
    );
  }

  // Firebase無効時の表示
  if (!isFirebaseEnabled()) {
    const configStatus = getFirebaseConfigStatus();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              祝い品管理アプリ
            </h2>
            <p className="mt-4 text-gray-600">
              Firebase設定が完了していません。環境変数を設定してください。
            </p>
            
            {import.meta.env.DEV && (
              <div className="mt-6 text-left">
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {showDebugInfo ? '▼' : '▶'} デバッグ情報を{showDebugInfo ? '非表示' : '表示'}
                </button>
                
                {showDebugInfo && (
                  <div className="bg-gray-100 p-4 rounded text-xs text-left overflow-auto max-h-64">
                    <p className="font-bold mb-2">環境変数の状態:</p>
                    <ul className="space-y-1">
                      {Object.entries(configStatus.status).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span className="text-gray-700">{key}:</span>
                          <span className={value.includes('✓') ? 'text-green-600' : 'text-red-600'}>
                            {value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {configStatus.missing.length > 0 && (
                      <div className="mt-4">
                        <p className="font-bold text-red-600">不足している環境変数:</p>
                        <ul className="list-disc list-inside">
                          {configStatus.missing.map((varName) => (
                            <li key={varName} className="text-red-600">{varName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="mt-4 text-gray-600">
                      詳細は <code className="bg-white px-1">docs/FIREBASE_SETUP.md</code> を参照してください
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="mt-6"
            >
              オフラインモードで続ける
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('[DEBUG] Login: handleGoogleLogin called');
    setError('');
    setLoading(true);

    try {
      console.log('[DEBUG] Login: Calling signInWithGoogle...');
      console.log('Initiating Google login redirect...');
      await signInWithGoogle();
      console.log('[DEBUG] Login: This line should not be reached');
      // signInWithRedirect()はページをリダイレクトするため、この行には到達しない
      // 認証完了後、ページが再読み込みされてダッシュボードに自動的に移動する
      // loading状態はリダイレクトによってリセットされる
    } catch (err) {
      console.error('[DEBUG] Login: Google login error:', err);
      console.error('Google login failed:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">ログイン</h2>
          <p className="mt-2 text-sm text-gray-600">
            祝い品管理アプリへようこそ
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="email"
              label="メールアドレス"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              placeholder="example@example.com"
            />

            <Input
              type="password"
              label="パスワード"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              パスワードを忘れた場合
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            ログイン
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">または</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            loading={loading}
            className="w-full"
            title="Googleアカウントでログイン（新しいページに移動します）"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </Button>
          
          {loading && (
            <div className="text-center text-sm text-gray-600 mt-2">
              Googleの認証ページに移動します...
            </div>
          )}

          <div className="text-center">
            <span className="text-sm text-gray-600">アカウントをお持ちでない方</span>
            {' '}
            <Link
              to="/signup"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              新規登録
            </Link>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              className="text-sm"
            >
              オフラインモードで続ける
            </Button>
          </div>
        </form>

        {/* 法務リンクフッター */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link to="/legal/terms" className="hover:text-gray-700 hover:underline">
              利用規約
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/legal/privacy" className="hover:text-gray-700 hover:underline">
              プライバシーポリシー
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/legal/operator" className="hover:text-gray-700 hover:underline">
              運営者情報
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
