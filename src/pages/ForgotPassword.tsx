/**
 * パスワードリセットページ
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseEnabled } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ForgotPassword: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isFirebaseEnabled()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-600">
            Firebase設定が完了していません。
          </p>
          <Link to="/login" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            ログインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            パスワードリセット
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Input
              type="email"
              label="メールアドレス"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              placeholder="example@example.com"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              リセットメールを送信
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ログインページに戻る
              </Link>
            </div>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            <p className="font-medium">メールを送信しました</p>
            <p className="mt-2 text-sm">
              {email} にパスワードリセット用のメールを送信しました。
              メール内のリンクをクリックして、パスワードを再設定してください。
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm text-green-700 hover:text-green-600 font-medium"
            >
              ログインページに戻る
            </Link>
          </div>
        )}

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

export default ForgotPassword;
