/**
 * お問い合わせ履歴ページ
 * ユーザーが自分のお問い合わせ履歴を確認・返信できる
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Contact, ContactStatus } from '@/types';
import {
  getUserContacts,
  addReply,
  getCategoryLabel,
  getStatusLabel,
  getStatusColorClass,
} from '@/services/contactService';
import { isFirebaseEnabled } from '@/lib/firebase';
import { Loading, EmptyState } from '@/components/ui';

export default function ContactHistory() {
  const { user, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const firebaseEnabled = isFirebaseEnabled();

  useEffect(() => {
    if (isAuthenticated && user && firebaseEnabled) {
      loadContacts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, firebaseEnabled]);

  const loadContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserContacts(user.uid);
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast.error('お問い合わせ履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (contactId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleReplySubmit = async (contactId: string) => {
    const replyText = replyTexts[contactId]?.trim();
    if (!replyText || !user) return;

    setSubmittingReply(contactId);

    try {
      await addReply(contactId, user.uid, replyText, false);
      setReplyTexts((prev) => ({ ...prev, [contactId]: '' }));
      await loadContacts();
      toast.success('返信を送信しました');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('返信の送信に失敗しました');
    } finally {
      setSubmittingReply(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            お問い合わせ履歴を見るにはログインが必要です
          </p>
          <Link
            to="/login"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Loading size="lg" text="読み込み中..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              お問い合わせ履歴
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            過去のお問い合わせと運営者からの返信を確認できます
          </p>
        </div>

        {/* 新規お問い合わせボタン */}
        <div className="mb-6">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            新しいお問い合わせ
          </Link>
        </div>

        {/* お問い合わせ一覧 */}
        {contacts.length === 0 ? (
          <EmptyState
            message="お問い合わせ履歴がありません"
            icon={<ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => {
              const isExpanded = expandedIds.has(contact.id);
              const hasReplies = contact.replies.length > 0;
              const canReply = contact.status !== ContactStatus.CLOSED;

              return (
                <div
                  key={contact.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {/* ヘッダー部分（クリックで展開） */}
                  <button
                    onClick={() => toggleExpand(contact.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColorClass(
                            contact.status
                          )}`}
                        >
                          {getStatusLabel(contact.status)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getCategoryLabel(contact.category)}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {contact.message.substring(0, 50)}
                        {contact.message.length > 50 && '...'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(contact.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}
                        {hasReplies && (
                          <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                            · 返信 {contact.replies.length}件
                          </span>
                        )}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* 展開時の詳細 */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {/* お問い合わせ内容 */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          お問い合わせ内容
                        </p>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {contact.message}
                        </p>
                      </div>

                      {/* 返信一覧 */}
                      {hasReplies && (
                        <div className="px-6 py-4 space-y-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            やりとり
                          </p>
                          {contact.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`p-3 rounded-lg ${
                                reply.isAdmin
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 ml-4'
                                  : 'bg-gray-100 dark:bg-gray-700 mr-4'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-xs font-medium ${
                                    reply.isAdmin
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {reply.isAdmin ? '運営者' : 'あなた'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(reply.createdAt, 'M/d HH:mm', { locale: ja })}
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm">
                                {reply.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 返信フォーム */}
                      {canReply && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            <textarea
                              value={replyTexts[contact.id] || ''}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [contact.id]: e.target.value,
                                }))
                              }
                              placeholder="返信を入力..."
                              rows={2}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleReplySubmit(contact.id)}
                              disabled={
                                !replyTexts[contact.id]?.trim() ||
                                submittingReply === contact.id
                              }
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                            >
                              {submittingReply === contact.id ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                              ) : (
                                <PaperAirplaneIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* クローズ済みの場合 */}
                      {!canReply && (
                        <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700/50 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            このお問い合わせは完了しています
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 戻るリンク */}
        <div className="mt-8">
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
