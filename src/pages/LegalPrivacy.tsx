/**
 * プライバシーポリシーページ
 * 個人情報の取り扱いに関するポリシーを表示
 */

import { Link } from 'react-router-dom';
import { ShieldCheckIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function LegalPrivacy() {
  // 最終更新日
  const lastUpdated = '2025年1月1日';
  const effectiveDate = '2025年1月1日';

  // 目次項目
  const tableOfContents = [
    { id: 'introduction', title: '1. はじめに' },
    { id: 'collected-info', title: '2. 収集する情報' },
    { id: 'purpose', title: '3. 情報の利用目的' },
    { id: 'storage', title: '4. 情報の保存' },
    { id: 'third-party', title: '5. 第三者への提供' },
    { id: 'external-services', title: '6. 外部サービスの利用' },
    { id: 'security', title: '7. セキュリティ' },
    { id: 'user-rights', title: '8. ユーザーの権利' },
    { id: 'cookies', title: '9. Cookieについて' },
    { id: 'children', title: '10. 未成年者の利用' },
    { id: 'changes', title: '11. ポリシーの変更' },
    { id: 'contact', title: '12. お問い合わせ' },
  ];

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
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            <span>施行日: {effectiveDate} / 最終更新日: {lastUpdated}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 目次（デスクトップ用サイドバー） */}
          <nav className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">目次</h2>
              <ul className="space-y-2 text-sm">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* メインコンテンツ */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* モバイル用目次 */}
            <details className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
              <summary className="font-bold text-gray-900 dark:text-white cursor-pointer">
                目次を表示
              </summary>
              <ul className="mt-3 space-y-2 text-sm pl-4">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <div className="p-6 space-y-8">
              {/* 1. はじめに */}
              <section id="introduction">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  1. はじめに
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    祝いリスト（以下「本サービス」といいます）は、ユーザーの皆様のプライバシーを尊重し、
                    個人情報の保護に努めています。
                  </p>
                  <p className="mt-3">
                    本プライバシーポリシーは、本サービスにおける個人情報の収集、利用、保護について説明するものです。
                    本サービスをご利用いただくことで、本ポリシーに同意いただいたものとみなします。
                  </p>
                </div>
              </section>

              {/* 2. 収集する情報 */}
              <section id="collected-info">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  2. 収集する情報
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>本サービスでは、以下の情報を収集する場合があります。</p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    2.1 アカウント情報
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>メールアドレス</li>
                    <li>表示名（ニックネーム）</li>
                    <li>プロフィール画像（Google認証利用時）</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    2.2 ユーザーが入力する情報
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>贈答品に関する情報（品名、金額、日付、カテゴリ、メモ等）</li>
                    <li>人物に関する情報（氏名、フリガナ、関係性、連絡先等）</li>
                    <li>お返しに関する情報</li>
                    <li>写真データ（任意でアップロードされた場合）</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    2.3 自動的に収集される情報
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>アクセスログ（IPアドレス、アクセス日時等）</li>
                    <li>ブラウザ情報、デバイス情報</li>
                    <li>サービスの利用状況に関する情報</li>
                  </ul>
                </div>
              </section>

              {/* 3. 情報の利用目的 */}
              <section id="purpose">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  3. 情報の利用目的
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>収集した情報は、以下の目的で利用します。</p>
                  <ul className="list-disc list-inside space-y-1 mt-3">
                    <li>本サービスの提供・運営</li>
                    <li>ユーザー認証およびアカウント管理</li>
                    <li>ユーザーのデータの保存・同期</li>
                    <li>サービスの改善・新機能の開発</li>
                    <li>お問い合わせへの対応</li>
                    <li>重要なお知らせの送信</li>
                    <li>不正利用の防止</li>
                  </ul>
                </div>
              </section>

              {/* 4. 情報の保存 */}
              <section id="storage">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  4. 情報の保存
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    4.1 保存場所
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>ローカルストレージ</strong>: お使いのデバイスのブラウザ内（IndexedDB）に保存されます
                    </li>
                    <li>
                      <strong>クラウドストレージ</strong>: ログイン時はGoogle Firebase（Firestore, Storage）に保存されます
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    4.2 保存期間
                  </h3>
                  <p>
                    ユーザーが登録した情報は、アカウントが有効な間保存されます。
                    アカウントを削除した場合、関連するデータは速やかに削除されます。
                  </p>
                </div>
              </section>

              {/* 5. 第三者への提供 */}
              <section id="third-party">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  5. 第三者への提供
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本サービスでは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-3">
                    <li>ユーザーの同意がある場合</li>
                    <li>法令に基づく場合</li>
                    <li>人の生命、身体または財産の保護のために必要がある場合</li>
                    <li>サービスの運営に必要な範囲で業務委託先に提供する場合</li>
                  </ul>
                </div>
              </section>

              {/* 6. 外部サービスの利用 */}
              <section id="external-services">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  6. 外部サービスの利用
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>本サービスでは、以下の外部サービスを利用しています。</p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    6.1 Google Firebase
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Firebase Authentication</strong>: ユーザー認証</li>
                    <li><strong>Cloud Firestore</strong>: データベース</li>
                    <li><strong>Firebase Storage</strong>: 画像ファイルの保存</li>
                    <li><strong>Firebase Hosting</strong>: Webアプリケーションの配信</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    Firebaseのプライバシーポリシーについては、
                    <a
                      href="https://firebase.google.com/support/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Firebase Privacy Policy
                    </a>
                    をご確認ください。
                  </p>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    6.2 Google OAuth
                  </h3>
                  <p>
                    Googleアカウントでのログイン機能を提供しています。
                    Googleから取得する情報は、メールアドレス、表示名、プロフィール画像のみです。
                  </p>
                </div>
              </section>

              {/* 7. セキュリティ */}
              <section id="security">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  7. セキュリティ
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本サービスでは、ユーザーの情報を保護するために以下のセキュリティ対策を講じています。
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-3">
                    <li>HTTPS通信による暗号化</li>
                    <li>Firebase Security Rulesによるアクセス制御</li>
                    <li>ユーザーごとのデータ分離</li>
                    <li>定期的なセキュリティ見直し</li>
                  </ul>
                  <p className="mt-3">
                    ただし、インターネット上での情報伝送は完全に安全であることを保証するものではありません。
                  </p>
                </div>
              </section>

              {/* 8. ユーザーの権利 */}
              <section id="user-rights">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  8. ユーザーの権利
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>ユーザーには以下の権利があります。</p>
                  <ul className="list-disc list-inside space-y-1 mt-3">
                    <li>
                      <strong>データへのアクセス</strong>: 登録したデータはいつでも閲覧できます
                    </li>
                    <li>
                      <strong>データの修正</strong>: 登録したデータはいつでも編集できます
                    </li>
                    <li>
                      <strong>データの削除</strong>: 登録したデータはいつでも削除できます
                    </li>
                    <li>
                      <strong>データのエクスポート</strong>: データ管理機能よりデータをダウンロードできます
                    </li>
                    <li>
                      <strong>アカウントの削除</strong>: お問い合わせよりアカウント削除をリクエストできます
                    </li>
                  </ul>
                </div>
              </section>

              {/* 9. Cookieについて */}
              <section id="cookies">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Cookieについて
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本サービスでは、認証状態の維持やサービスの改善のためにCookieを使用する場合があります。
                  </p>
                  <p className="mt-3">
                    ブラウザの設定によりCookieを無効にすることができますが、
                    一部の機能が正常に動作しなくなる可能性があります。
                  </p>
                </div>
              </section>

              {/* 10. 未成年者の利用 */}
              <section id="children">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  10. 未成年者の利用
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本サービスは、原則として18歳以上の方を対象としています。
                    18歳未満の方がご利用になる場合は、保護者の同意を得た上でご利用ください。
                  </p>
                </div>
              </section>

              {/* 11. ポリシーの変更 */}
              <section id="changes">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  11. ポリシーの変更
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、
                    予告なく変更されることがあります。
                  </p>
                  <p className="mt-3">
                    重要な変更がある場合は、本サービス内でお知らせします。
                    変更後も本サービスを継続してご利用いただくことで、
                    変更後のポリシーに同意いただいたものとみなします。
                  </p>
                </div>
              </section>

              {/* 12. お問い合わせ */}
              <section id="contact">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  12. お問い合わせ
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本プライバシーポリシーに関するお問い合わせは、
                    お問い合わせページよりお願いいたします。
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      お問い合わせページへ
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            {/* 更新日フッター */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>最終更新日: {lastUpdated}</span>
              </div>
            </div>
          </div>
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
            to="/legal/operator"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            運営者情報 →
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
