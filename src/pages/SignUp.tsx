/**
 * サインアップページ
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseEnabled } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ログイン済みの場合はダッシュボードへ自動遷移
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Firebase無効時はログインページへ
  useEffect(() => {
    if (!isFirebaseEnabled()) {
      navigate('/login');
    }
  }, [navigate]);

  // 認証状態確認中はローディング画面を表示
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('Starting Google sign-up from SignUp page...');
      await signInWithGoogle();
      // リダイレクトの場合はこの行には到達しない
      navigate('/');
    } catch (err) {
      console.error('Google sign-up error:', err);
      // リダイレクト中のエラーは無視（正常な動作）
      if (err instanceof Error && err.message.includes('Redirecting')) {
        console.log('Redirecting to Google for authentication...');
        return;
      }
      setError(err instanceof Error ? err.message : '登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">新規登録</h2>
          <p className="mt-2 text-sm text-gray-600">
            アカウントを作成してクラウド同期を利用
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="text"
              label="表示名"
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              placeholder="山田 太郎"
            />

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
              helperText="6文字以上で設定してください"
            />

            <Input
              type="password"
              label="パスワード（確認）"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            登録
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
            onClick={handleGoogleSignUp}
            loading={loading}
            className="w-full"
            title="Googleアカウントで登録（新しいページに移動します）"
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
            Googleで登録
          </Button>
          
          {loading && (
            <div className="text-center text-sm text-gray-600 mt-2">
              Googleの認証ページに移動します...
            </div>
          )}

          <div className="text-center">
            <span className="text-sm text-gray-600">既にアカウントをお持ちの方</span>
            {' '}
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              ログイン
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
      </div>
    </div>
  );
};

export default SignUp;
