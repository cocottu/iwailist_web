/**
 * 運営者情報ページ
 */

import { Link } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui';

export default function LegalOperator() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BuildingOfficeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              運営者情報
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            本サービスの運営者に関する情報です
          </p>
        </div>

        {/* 運営者について */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            運営者について
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービス「祝い品管理」は、<strong className="font-semibold">cocottu</strong>による個人開発プロジェクトです。
            </p>
            <p className="leading-relaxed">
              贈答品の管理を効率化し、お返しのタイミングを逃さないようサポートすることを目的として開発されました。
            </p>
          </div>
        </Card>

        {/* 本サービスについて */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            本サービスについて
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              「祝い品管理」は、贈答品の記録・管理・お返しのタイミングを管理するためのWebアプリケーションです。
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                主な機能
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>贈答品の記録と管理</li>
                <li>人物情報の管理</li>
                <li>お返しの記録と履歴管理</li>
                <li>リマインダー機能</li>
                <li>統計・分析機能</li>
                <li>データのエクスポート・インポート</li>
                <li>クラウド同期（Firebase）</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 連絡先 */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            連絡先
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              ご質問・お問い合わせ・不具合報告などがございましたら、
              <Link
                to="/contact"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                お問い合わせページ
              </Link>
              よりご連絡ください。
            </p>
          </div>
        </Card>

        {/* 免責事項 */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            免責事項
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービスは、個人開発プロジェクトとして提供されています。
            </p>
            <p className="leading-relaxed">
              運営者は、本サービスの利用により生じた損害について、一切の責任を負いません。
              データのバックアップは、ユーザー自身の責任で行ってください。
            </p>
            <p className="leading-relaxed">
              本サービスの内容は、予告なく変更・中断・終了する場合があります。
            </p>
          </div>
        </Card>

        {/* 関連リンク */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            関連リンク
          </h2>
          <div className="space-y-2">
            <Link
              to="/legal/privacy"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              プライバシーポリシー
            </Link>
            <Link
              to="/contact"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              お問い合わせ
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
