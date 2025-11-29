/**
 * お問い合わせページ
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input } from '@/components/ui';
import { toast } from 'sonner';

type ContactCategory = 'bug' | 'feature' | 'other';

interface ContactFormData {
  name: string;
  email: string;
  category: ContactCategory;
  message: string;
  privacyAgreed: boolean;
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: 'other',
    message: '',
    privacyAgreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | boolean | ContactCategory
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // メールアドレスの形式チェック（入力されている場合のみ）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // 本文は必須
    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容を入力してください';
    }

    // プライバシーポリシーへの同意は必須
    if (!formData.privacyAgreed) {
      newErrors.privacyAgreed = 'プライバシーポリシーへの同意が必要です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('入力内容を確認してください');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const webhookUrl = import.meta.env.VITE_SLACK_CONTACT_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Slack Webhook URLが設定されていません');
      }

      // Slack Webhook用のメッセージを整形
      const categoryLabels: Record<ContactCategory, string> = {
        bug: 'バグ報告',
        feature: '機能要望',
        other: 'その他',
      };

      const slackMessage = {
        text: 'お問い合わせが届きました',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📧 お問い合わせ',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*種別:*\n${categoryLabels[formData.category]}`,
              },
              {
                type: 'mrkdwn',
                text: `*お名前:*\n${formData.name || '未入力'}`,
              },
              {
                type: 'mrkdwn',
                text: `*メールアドレス:*\n${formData.email || '未入力'}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*お問い合わせ内容:*\n\`\`\`${formData.message}\`\`\``,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `送信日時: ${new Date().toLocaleString('ja-JP')}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        throw new Error(`送信に失敗しました: ${response.statusText}`);
      }

      toast.success('お問い合わせを送信しました。ありがとうございます。');
      
      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        category: 'other',
        message: '',
        privacyAgreed: false,
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(
        error instanceof Error
          ? `送信に失敗しました: ${error.message}`
          : '送信に失敗しました。しばらくしてから再度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<ContactCategory, string> = {
    bug: 'バグ報告',
    feature: '機能要望',
    other: 'その他',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <EnvelopeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              お問い合わせ
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            ご質問・お問い合わせ・不具合報告などがございましたら、以下のフォームよりご連絡ください。
          </p>
        </div>

        {/* フォーム */}
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            {/* お名前 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                お名前 <span className="text-gray-400">（任意）</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="山田 太郎"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                メールアドレス <span className="text-gray-400">（任意）</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                返信が必要な場合は、メールアドレスをご入力ください。
              </p>
            </div>

            {/* お問い合わせ種別 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                お問い合わせ種別
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  handleInputChange('category', e.target.value as ContactCategory)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="bug">バグ報告</option>
                <option value="feature">機能要望</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 本文 */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={8}
                placeholder="お問い合わせ内容を入力してください"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.message
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.message}
                </p>
              )}
            </div>

            {/* プライバシーポリシーへの同意 */}
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.privacyAgreed}
                  onChange={(e) =>
                    handleInputChange('privacyAgreed', e.target.checked)
                  }
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <Link
                    to="/legal/privacy"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    target="_blank"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.privacyAgreed && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.privacyAgreed}
                </p>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </div>
          </form>
        </Card>

        {/* 確認モーダル */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                送信内容の確認
              </h2>
              <div className="space-y-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">種別:</span>{' '}
                  {categoryLabels[formData.category]}
                </div>
                {formData.name && (
                  <div>
                    <span className="font-medium">お名前:</span> {formData.name}
                  </div>
                )}
                {formData.email && (
                  <div>
                    <span className="font-medium">メールアドレス:</span>{' '}
                    {formData.email}
                  </div>
                )}
                <div>
                  <span className="font-medium">お問い合わせ内容:</span>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded whitespace-pre-wrap">
                    {formData.message}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  送信する
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
