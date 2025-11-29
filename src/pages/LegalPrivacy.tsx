/**
 * プライバシーポリシーページ
 */

import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui';

export default function LegalPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              プライバシーポリシー
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            本サービスにおける個人情報の取り扱いについて
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            目次
          </h2>
          <nav className="space-y-2">
            <a
              href="#section-1"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              1. 収集する情報の種類
            </a>
            <a
              href="#section-2"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              2. 利用目的
            </a>
            <a
              href="#section-3"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              3. 情報の保存期間
            </a>
            <a
              href="#section-4"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              4. 第三者提供の有無
            </a>
            <a
              href="#section-5"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              5. 外部サービス利用状況
            </a>
            <a
              href="#section-6"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              6. 安全管理措置
            </a>
            <a
              href="#section-7"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              7. ユーザーからの問い合わせ窓口
            </a>
            <a
              href="#section-8"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              8. プライバシーポリシーの変更について
            </a>
          </nav>
        </Card>

        {/* 1. 収集する情報の種類 */}
        <Card id="section-1" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            1. 収集する情報の種類
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービスでは、以下の情報を収集・保存します。
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ユーザー登録情報
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>メールアドレス（認証用）</li>
                <li>表示名（任意）</li>
                <li>プロフィール画像（任意、Google認証を使用する場合）</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                アプリケーション利用情報
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>贈答品の記録（品名、金額、日付、カテゴリ、メモ等）</li>
                <li>人物情報（名前、関係性、メモ等）</li>
                <li>お返しの記録</li>
                <li>リマインダー情報</li>
                <li>画像データ（贈答品の写真等）</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ログ情報
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>アクセスログ（Firebase Authentication、Firestore の利用ログ）</li>
                <li>エラーログ（アプリケーションの動作状況）</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Cookie等の利用
              </h3>
              <p className="leading-relaxed">
                本サービスでは、認証セッション管理のため、Firebase AuthenticationがCookieを使用します。
                また、Google AdSenseを使用する場合、広告配信のためにCookieが使用される場合があります。
              </p>
            </div>
          </div>
        </Card>

        {/* 2. 利用目的 */}
        <Card id="section-2" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            2. 利用目的
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証・セッション管理</li>
              <li>データのクラウド同期</li>
              <li>不具合の修正・機能改善</li>
              <li>お問い合わせへの対応</li>
              <li>不正利用の防止</li>
            </ul>
          </div>
        </Card>

        {/* 3. 情報の保存期間 */}
        <Card id="section-3" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            3. 情報の保存期間
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              ユーザーがアカウントを削除するまで、または本サービスの提供を終了するまで、情報を保存します。
            </p>
            <p className="leading-relaxed">
              アカウント削除時には、関連するすべてのデータが削除されます。
            </p>
          </div>
        </Card>

        {/* 4. 第三者提供の有無 */}
        <Card id="section-4" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            4. 第三者提供の有無
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービスでは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
            </ul>
          </div>
        </Card>

        {/* 5. 外部サービス利用状況 */}
        <Card id="section-5" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            5. 外部サービス利用状況
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービスでは、以下の外部サービスを利用しています。
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Firebase（Google）
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Firebase Authentication: ユーザー認証</li>
                <li>Cloud Firestore: データベース</li>
                <li>Firebase Storage: 画像データの保存</li>
                <li>Firebase Hosting: アプリケーションの配信</li>
              </ul>
              <p className="mt-2 leading-relaxed">
                Firebaseのプライバシーポリシーについては、
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Firebase プライバシー
                </a>
                をご確認ください。
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Google AdSense（オプション）
              </h3>
              <p className="leading-relaxed">
                本サービスでは、Google AdSenseを使用して広告を配信する場合があります。
                Google AdSenseのプライバシーポリシーについては、
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Google プライバシーポリシー
                </a>
                をご確認ください。
              </p>
            </div>
          </div>
        </Card>

        {/* 6. 安全管理措置 */}
        <Card id="section-6" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            6. 安全管理措置
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本サービスでは、個人情報の保護のため、以下の安全管理措置を講じています。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Firebase Security Rulesによるアクセス制御</li>
              <li>HTTPS通信によるデータの暗号化</li>
              <li>認証トークンの適切な管理</li>
              <li>定期的なセキュリティアップデート</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              ただし、インターネット上のサービスであるため、完全なセキュリティを保証するものではありません。
            </p>
          </div>
        </Card>

        {/* 7. ユーザーからの問い合わせ窓口 */}
        <Card id="section-7" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            7. ユーザーからの問い合わせ窓口
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              個人情報の取り扱いに関するお問い合わせは、
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

        {/* 8. プライバシーポリシーの変更について */}
        <Card id="section-8" className="mb-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            8. プライバシーポリシーの変更について
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              本プライバシーポリシーは、法令の変更やサービスの改善に伴い、予告なく変更する場合があります。
            </p>
            <p className="leading-relaxed">
              変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
            <p className="leading-relaxed">
              最終更新日: 2025年1月
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
              to="/legal/operator"
              className="block text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              運営者情報
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
