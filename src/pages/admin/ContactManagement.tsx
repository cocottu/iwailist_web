/**
 * お問い合わせ管理ページ（運営者専用）
 * 全てのお問い合わせを確認・返信・ステータス管理する
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  InboxIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Contact, ContactStatus, ContactCategory } from '@/types';
import {
  getAllContacts,
  addReply,
  updateContactStatus,
  getCategoryLabel,
  getStatusLabel,
  getStatusColorClass,
} from '@/services/contactService';
import { Loading, EmptyState } from '@/components/ui';

type FilterStatus = 'all' | ContactStatus;
type FilterCategory = 'all' | ContactCategory;

export default function ContactManagement() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // フィルター
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, statusFilter, categoryFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast.error('お問い合わせの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contacts];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    setFilteredContacts(filtered);
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
      await addReply(contactId, user.uid, replyText, true);
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

  const handleStatusChange = async (contactId: string, newStatus: ContactStatus) => {
    setUpdatingStatus(contactId);

    try {
      await updateContactStatus(contactId, newStatus);
      await loadContacts();
      toast.success('ステータスを更新しました');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('ステータスの更新に失敗しました');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 統計情報
  const stats = {
    total: contacts.length,
    open: contacts.filter((c) => c.status === ContactStatus.OPEN).length,
    inProgress: contacts.filter((c) => c.status === ContactStatus.IN_PROGRESS).length,
    closed: contacts.filter((c) => c.status === ContactStatus.CLOSED).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Loading size="lg" text="読み込み中..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <InboxIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              お問い合わせ管理
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            ユーザーからのお問い合わせを確認・返信します
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">全件数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">未対応</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.open}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">対応中</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-green-600 dark:text-green-400">完了</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.closed}</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">フィルター</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">すべて</option>
                <option value={ContactStatus.OPEN}>未対応</option>
                <option value={ContactStatus.IN_PROGRESS}>対応中</option>
                <option value={ContactStatus.CLOSED}>完了</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                種別
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">すべて</option>
                <option value={ContactCategory.BUG}>バグ報告</option>
                <option value={ContactCategory.FEATURE}>機能要望</option>
                <option value={ContactCategory.OTHER}>その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* お問い合わせ一覧 */}
        {filteredContacts.length === 0 ? (
          <EmptyState
            message={
              contacts.length === 0
                ? 'お問い合わせはありません'
                : 'フィルター条件に一致するお問い合わせがありません'
            }
            icon={<InboxIcon className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => {
              const isExpanded = expandedIds.has(contact.id);
              const hasReplies = contact.replies.length > 0;

              return (
                <div
                  key={contact.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {/* ヘッダー部分 */}
                  <button
                    onClick={() => toggleExpand(contact.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColorClass(
                            contact.status
                          )}`}
                        >
                          {getStatusLabel(contact.status)}
                        </span>
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {getCategoryLabel(contact.category)}
                        </span>
                        {contact.email && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📧 {contact.email}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {contact.message.substring(0, 80)}
                        {contact.message.length > 80 && '...'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <UserCircleIcon className="w-4 h-4" />
                          {contact.name || 'ゲスト'}
                        </span>
                        <span>
                          {format(contact.createdAt, 'yyyy/M/d HH:mm', { locale: ja })}
                        </span>
                        {hasReplies && (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            返信 {contact.replies.length}件
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </button>

                  {/* 展開時の詳細 */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {/* お問い合わせ内容 */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            お問い合わせ内容
                          </p>
                          {/* ステータス変更 */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">ステータス:</span>
                            <select
                              value={contact.status}
                              onChange={(e) =>
                                handleStatusChange(contact.id, e.target.value as ContactStatus)
                              }
                              disabled={updatingStatus === contact.id}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value={ContactStatus.OPEN}>未対応</option>
                              <option value={ContactStatus.IN_PROGRESS}>対応中</option>
                              <option value={ContactStatus.CLOSED}>完了</option>
                            </select>
                          </div>
                        </div>
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
                                  {reply.isAdmin ? '運営者' : 'ユーザー'}
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
                            placeholder="返信を入力...（運営者として返信）"
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
