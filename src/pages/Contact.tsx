/**
 * お問い合わせページ
 * ユーザーからのお問い合わせを送信するフォーム
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { ContactCategory, ContactFormData } from '@/types';
import { submitContact, getCategoryLabel } from '@/services/contactService';
import { isFirebaseEnabled } from '@/lib/firebase';

export default function Contact() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: user?.displayName || '',
    email: user?.email || '',
    category: ContactCategory.OTHER,
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData | 'privacy', string>>>({});

  const firebaseEnabled = isFirebaseEnabled();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData | 'privacy', string>> = {};

    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容を入力してください';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'お問い合わせ内容は10文字以上で入力してください';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!agreedToPrivacy) {
      newErrors.privacy = 'プライバシーポリシーに同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('ログインが必要です');
      navigate('/login');
      return;
    }

    if (!firebaseEnabled) {
      toast.error('Firebaseが有効になっていないため、お問い合わせを送信できません');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContact(user.uid, formData);
      setIsSubmitted(true);
      toast.success('お問い合わせを送信しました');
    } catch (error) {
      console.error('Failed to submit contact:', error);
      toast.error('お問い合わせの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 送信完了画面
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              お問い合わせを受け付けました
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              お問い合わせいただきありがとうございます。
              <br />
              内容を確認の上、必要に応じてご連絡いたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact/history"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                お問い合わせ履歴を見る
              </Link>
              <Link
                to="/"
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <EnvelopeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              お問い合わせ
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            サービスに関するご質問、ご要望、不具合のご報告などをお送りください
          </p>
        </div>

        {/* Firebase無効時の警告 */}
        {!firebaseEnabled && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Firebaseが設定されていません
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  お問い合わせ機能を利用するには、Firebaseの設定が必要です。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 未ログイン時の案内 */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              お問い合わせを送信するには
              <Link to="/login" className="font-medium underline mx-1">
                ログイン
              </Link>
              が必要です。
            </p>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            {/* お名前 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                お名前（任意）
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="山田 太郎"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                メールアドレス（任意）
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                返信が必要な場合はメールアドレスをご入力ください
              </p>
            </div>

            {/* お問い合わせ種別 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                お問い合わせ種別
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.values(ContactCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* お問い合わせ内容 */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                placeholder="お問い合わせ内容をご記入ください"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                  errors.message
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
              )}
            </div>

            {/* プライバシーポリシー同意 */}
            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => {
                    setAgreedToPrivacy(e.target.checked);
                    if (errors.privacy) {
                      setErrors((prev) => ({ ...prev, privacy: undefined }));
                    }
                  }}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <Link
                    to="/legal/privacy"
                    target="_blank"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します
                </span>
              </label>
              {errors.privacy && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.privacy}</p>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                to="/"
                className="px-6 py-2 text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated || !firebaseEnabled}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    送信中...
                  </>
                ) : (
                  '送信する'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* お問い合わせ履歴へのリンク */}
        {isAuthenticated && (
          <div className="mt-6 text-center">
            <Link
              to="/contact/history"
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
            >
              過去のお問い合わせ履歴を見る →
            </Link>
          </div>
        )}

        {/* 戻るリンク */}
        <div className="mt-6">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
