/**
 * 利用規約ページ
 * サービスの利用条件について記載
 */

import { Link } from 'react-router-dom';
import { DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function LegalTerms() {
  // 最終更新日
  const lastUpdated = '2025年1月1日';
  const effectiveDate = '2025年1月1日';

  // 目次項目
  const tableOfContents = [
    { id: 'introduction', title: '第1条 総則' },
    { id: 'definitions', title: '第2条 定義' },
    { id: 'registration', title: '第3条 利用登録' },
    { id: 'account', title: '第4条 アカウント管理' },
    { id: 'prohibited', title: '第5条 禁止事項' },
    { id: 'service-changes', title: '第6条 サービスの変更・停止' },
    { id: 'disclaimer', title: '第7条 免責事項' },
    { id: 'intellectual-property', title: '第8条 知的財産権' },
    { id: 'user-data', title: '第9条 ユーザーデータ' },
    { id: 'termination', title: '第10条 退会・アカウント削除' },
    { id: 'changes', title: '第11条 規約の変更' },
    { id: 'governing-law', title: '第12条 準拠法・管轄' },
    { id: 'contact', title: '第13条 お問い合わせ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              利用規約
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            本サービスをご利用いただく際の利用条件について
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
              {/* 第1条 総則 */}
              <section id="introduction">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第1条 総則
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本利用規約（以下「本規約」といいます）は、祝いリスト（以下「本サービス」といいます）の
                    利用条件を定めるものです。
                  </p>
                  <p className="mt-3">
                    本サービスをご利用いただく場合、本規約に同意いただいたものとみなします。
                    本規約に同意いただけない場合は、本サービスをご利用いただけません。
                  </p>
                </div>
              </section>

              {/* 第2条 定義 */}
              <section id="definitions">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第2条 定義
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>本規約において使用する用語の定義は、以下のとおりとします。</p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li>
                      <strong>「本サービス」</strong>とは、当運営者が提供する「祝いリスト」という名称の
                      祝い品管理Webアプリケーションおよびこれに付随するサービスを指します。
                    </li>
                    <li>
                      <strong>「ユーザー」</strong>とは、本サービスを利用する全ての方を指します。
                    </li>
                    <li>
                      <strong>「登録ユーザー」</strong>とは、アカウント登録を完了したユーザーを指します。
                    </li>
                    <li>
                      <strong>「ユーザーデータ」</strong>とは、ユーザーが本サービスに登録した情報
                      （贈答品情報、人物情報等）を指します。
                    </li>
                  </ul>
                </div>
              </section>

              {/* 第3条 利用登録 */}
              <section id="registration">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第3条 利用登録
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      本サービスは、アカウント登録なしでもオフラインモードとしてご利用いただけます。
                    </li>
                    <li>
                      クラウド同期機能を利用する場合は、アカウント登録が必要です。
                    </li>
                    <li>
                      アカウント登録は、メールアドレスとパスワードによる登録、または
                      Googleアカウントによる認証のいずれかの方法で行うことができます。
                    </li>
                    <li>
                      登録にあたり、正確な情報を入力するものとします。
                    </li>
                    <li>
                      18歳未満の方は、保護者の同意を得た上で登録するものとします。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第4条 アカウント管理 */}
              <section id="account">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第4条 アカウント管理
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      ユーザーは、自己の責任においてアカウント情報を管理するものとします。
                    </li>
                    <li>
                      アカウント情報を第三者に利用させ、または貸与、譲渡、売買等をしてはなりません。
                    </li>
                    <li>
                      アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害については、
                      当運営者は一切の責任を負いません。
                    </li>
                    <li>
                      アカウントの不正利用が発覚した場合、速やかにお問い合わせよりご連絡ください。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第5条 禁止事項 */}
              <section id="prohibited">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第5条 禁止事項
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
                  <ul className="list-disc list-inside space-y-1 mt-3">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>本サービスのサーバーまたはネットワークに過度の負荷をかける行為</li>
                    <li>本サービスの運営を妨害するおそれのある行為</li>
                    <li>他のユーザーに成りすます行為</li>
                    <li>不正アクセスまたはこれを試みる行為</li>
                    <li>他のユーザーの情報を収集する行為</li>
                    <li>本サービスを商用目的で利用する行為（当運営者が認めた場合を除く）</li>
                    <li>本サービスの逆コンパイル、リバースエンジニアリングを行う行為</li>
                    <li>その他、当運営者が不適切と判断する行為</li>
                  </ul>
                </div>
              </section>

              {/* 第6条 サービスの変更・停止 */}
              <section id="service-changes">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第6条 サービスの変更・停止
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      当運営者は、事前の通知なく、本サービスの内容を変更または機能を追加することがあります。
                    </li>
                    <li>
                      当運営者は、以下の場合に本サービスの全部または一部の提供を停止することがあります。
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>システムの保守・点検を行う場合</li>
                        <li>地震、落雷、火災、停電等の不可抗力により提供が困難な場合</li>
                        <li>その他、当運営者がやむを得ないと判断した場合</li>
                      </ul>
                    </li>
                    <li>
                      本サービスの変更・停止によりユーザーに生じた損害について、当運営者は一切の責任を負いません。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第7条 免責事項 */}
              <section id="disclaimer">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第7条 免責事項
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      当運営者は、本サービスについて、その完全性、正確性、有用性、特定の目的への適合性等、
                      いかなる保証も行いません。
                    </li>
                    <li>
                      本サービスは「現状有姿」で提供されます。
                    </li>
                    <li>
                      当運営者は、本サービスの利用により生じた損害について、当運営者の故意または重過失による場合を除き、
                      一切の責任を負いません。
                    </li>
                    <li>
                      ユーザー間またはユーザーと第三者間のトラブルについて、当運営者は一切の責任を負いません。
                    </li>
                    <li>
                      本サービスは個人運営であるため、サポート対応に時間がかかる場合があります。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第8条 知的財産権 */}
              <section id="intellectual-property">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第8条 知的財産権
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      本サービスに関する著作権その他の知的財産権は、当運営者または権利を有する第三者に帰属します。
                    </li>
                    <li>
                      ユーザーは、本サービスのコンテンツを私的利用の範囲を超えて複製、転載、改変、
                      二次利用等することはできません。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第9条 ユーザーデータ */}
              <section id="user-data">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第9条 ユーザーデータ
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      ユーザーが本サービスに登録したデータの権利は、ユーザー本人に帰属します。
                    </li>
                    <li>
                      当運営者は、サービス提供に必要な範囲でユーザーデータを取り扱います。
                      詳細は<Link to="/legal/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">プライバシーポリシー</Link>をご確認ください。
                    </li>
                    <li>
                      オフラインモードで保存されたデータは、ユーザーのデバイス上にのみ保存され、
                      当運営者はアクセスできません。
                    </li>
                    <li>
                      ユーザーは、自己の責任においてデータのバックアップを行うものとします。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第10条 退会・アカウント削除 */}
              <section id="termination">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第10条 退会・アカウント削除
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      ユーザーは、お問い合わせよりアカウント削除をリクエストすることができます。
                    </li>
                    <li>
                      当運営者は、ユーザーが本規約に違反した場合、事前の通知なくアカウントを停止または
                      削除することができます。
                    </li>
                    <li>
                      アカウント削除後、クラウドに保存されたユーザーデータは速やかに削除されます。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第11条 規約の変更 */}
              <section id="changes">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第11条 規約の変更
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      当運営者は、必要と判断した場合、ユーザーへの事前の通知なく本規約を変更することができます。
                    </li>
                    <li>
                      変更後の規約は、本サービス上に表示した時点で効力を生じるものとします。
                    </li>
                    <li>
                      規約変更後も本サービスの利用を継続した場合、変更後の規約に同意したものとみなします。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第12条 準拠法・管轄 */}
              <section id="governing-law">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第12条 準拠法・管轄
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                    <li>
                      本サービスに関して紛争が生じた場合、当運営者の所在地を管轄する裁判所を
                      専属的合意管轄裁判所とします。
                    </li>
                  </ol>
                </div>
              </section>

              {/* 第13条 お問い合わせ */}
              <section id="contact">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  第13条 お問い合わせ
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <p>
                    本規約に関するお問い合わせは、お問い合わせページよりお願いいたします。
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
            to="/legal/privacy"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            プライバシーポリシー →
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
