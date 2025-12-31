/**
 * 運営者情報ページ
 * 個人運営のWebアプリケーションとして最低限必要な情報を表示
 */

import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function LegalOperator() {
  // 最終更新日
  const lastUpdated = '2025年1月1日';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BuildingOfficeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              運営者情報
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            本サービスの運営に関する情報
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* サービス情報 */}
          <section className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              サービス情報
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  サービス名
                </dt>
                <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                  祝いリスト（Iwailist）
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  サービス概要
                </dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  祝い品（贈答品）の受け取りとお返しを管理するWebアプリケーションです。
                  結婚祝い、出産祝い、お見舞いなど、様々な祝い品を記録・管理することができます。
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  サービスURL
                </dt>
                <dd className="mt-1 text-blue-600 dark:text-blue-400">
                  {window.location.origin}
                </dd>
              </div>
            </dl>
          </section>

          {/* 運営者情報 */}
          <section className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              運営者について
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <p className="text-blue-800 dark:text-blue-200">
                本サービスは<strong>個人により運営</strong>されています。
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              個人運営のため、運営者の詳細情報（氏名・住所等）の公開は控えさせていただいております。
              お問い合わせにつきましては、下記のお問い合わせページよりご連絡ください。
            </p>
          </section>

          {/* お問い合わせ */}
          <section className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              サービスに関するお問い合わせ、ご要望、不具合のご報告などは、
              下記のお問い合わせページよりお願いいたします。
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <EnvelopeIcon className="w-5 h-5" />
              お問い合わせページへ
            </Link>
          </section>

          {/* 関連リンク */}
          <section className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              関連ページ
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </section>

          {/* 更新日 */}
          <section className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>最終更新日: {lastUpdated}</span>
            </div>
          </section>
        </div>

        {/* 戻るリンク */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/legal/terms"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            利用規約 →
          </Link>
          <Link
            to="/legal/privacy"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            プライバシーポリシー →
          </Link>
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
