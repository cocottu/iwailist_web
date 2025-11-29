# Phase 6 実装計画 📋

## 概要

Phase 6 では、アプリの信頼性と法令順守を高めるために、以下のページを追加します。

- 運営者情報ページ（最低限の表示）
- プライバシーポリシーページ
- お問い合わせページ（ユーザー向け）
- お問い合わせ管理ページ（運営者専用）

お問い合わせ機能は **Firestore に保存し、運営者とユーザーが双方向で返信できる** 仕組みとします。

---

## 実装優先順位と理由

### 🥇 優先度1: 運営者情報ページ
**想定工数**: 0.5〜1時間

**理由**:
- ✅ サイトの信頼性・透明性の根幹となる情報
- ✅ 静的コンテンツ中心で実装が容易
- ✅ 他のページ（プライバシーポリシー等）からの参照先になる

**実装内容**:
- ページパス: `/legal/operator`
- 表示項目（最低限）:
  - **アプリ名: 「祝いリスト」**
  - **「本サービスは個人により運営されています。」**
  - お問い合わせページへのリンク
- フッターおよびハンバーガーメニューからの導線追加

**UI/UX 方針**:
- シンプルで読みやすいレイアウト
- 個人運営であることを明記（詳細情報は最小限）
- モバイルで読みやすい余白と行間

---

### 🥈 優先度2: プライバシーポリシーページ
**想定工数**: 1〜2時間（文面準備込み）

**理由**:
- ✅ 個人情報・ログ情報の取り扱いを明示するため必須
- ✅ 将来的な機能拡張（広告・解析など）との整合性を取る必要がある

**実装内容（案）**:
- ページパス: `/legal/privacy`
- 構成例:
  - 1. 収集する情報の種類（ユーザー登録情報、ログ、Cookie 等の有無）
  - 2. 利用目的
  - 3. 情報の保存期間
  - 4. 第三者提供の有無
  - 5. 外部サービス利用状況（Firebase など）
  - 6. 安全管理措置
  - 7. ユーザーからの問い合わせ窓口（お問い合わせページへのリンク）
  - 8. プライバシーポリシーの変更について

**技術的検討**:
- 文言はコンポーネント内に静的定義（将来 i18n 対応する場合は抽出を想定）
- 長文スクロール時の **目次リンク（ページ内アンカー）** を検討

---

### 🥉 優先度3: お問い合わせページ（ユーザー向け）
**想定工数**: 2〜3時間

**理由**:
- ✅ ユーザーが不具合・要望を連絡するための重要な窓口
- ✅ 「運営者情報」「プライバシーポリシー」からの導線先になる
- ✅ Firestore に保存することで履歴管理と返信機能を実現

**実装内容**:
- ページパス: `/contact`
- 入力項目:
  - お名前（任意）
  - メールアドレス（任意）
  - お問い合わせ種別（バグ報告 / 機能要望 / その他）
  - 本文（必須）

**データ保存方法**:
- **Firestore の `contacts` コレクションに保存**
  - コレクション構造:
    ```
    contacts/{contactId}
      - userId: string (送信者のUID)
      - name?: string
      - email?: string
      - category: 'bug' | 'feature' | 'other'
      - message: string
      - status: 'open' | 'in_progress' | 'closed'
      - createdAt: Timestamp
      - updatedAt: Timestamp
      - replies: Array<{
          id: string
          userId: string
          isAdmin: boolean
          message: string
          createdAt: Timestamp
        }>
    ```
- 送信成功時は完了メッセージ表示
- ユーザーは自分のお問い合わせ一覧を確認でき、運営者の返信を見られる

**UX / バリデーション**:
- 必須項目の簡易バリデーション（空チェック・メール形式）
- エラー表示はフィールド下にテキストで表示
- 送信前に「プライバシーポリシーに同意しました」のチェックボックスを設置

---

### 🥉 優先度4: お問い合わせ管理ページ（運営者専用）
**想定工数**: 2〜3時間

**理由**:
- ✅ 運営者がお問い合わせを確認・返信するための管理画面
- ✅ ユーザーサポート体制の整備

**実装内容**:
- ページパス: `/admin/contacts`
- 機能:
  - お問い合わせ一覧表示（全ユーザー分）
  - ステータス管理（open / in_progress / closed）
  - お問い合わせ詳細表示
  - 運営者からの返信機能
  - フィルター機能（ステータス、種別、日付範囲）

**アクセス制御**:
- 運営者のみアクセス可能
- 運営者判定は環境変数 `VITE_ADMIN_UID` で管理（ハードコーディング禁止）

**UI/UX 方針**:
- 一覧表示はテーブル形式（モバイル対応）
- 返信はスレッド形式で表示
- 新着お問い合わせの通知表示（未読数など）

---

## 画面設計とナビゲーション

### グローバルナビゲーション / フッター
- `Header` / `BottomNavigation` / フッター（存在する場合）に以下のリンクを追加:
  - 「運営者情報」 → `/legal/operator`
  - 「プライバシーポリシー」 → `/legal/privacy`
  - 「お問い合わせ」 → `/contact`
- モバイルでのメニュー内配置は「その他」もしくは「設定」近辺にまとめて配置

### 運営者向けナビゲーション
- ログイン中のユーザーが運営者の場合、通常ページに運営者用の導線を表示
  - 例: 設定ページやヘッダーに「運営者ページ」リンクを追加
  - または、ダッシュボードに運営者専用セクションを表示
- 運営者専用ページ:
  - `/admin/contacts` - お問い合わせ管理

### ページレイアウト共通方針
- 共通レイアウトコンポーネント（例: `PageLayout`）があれば流用
- タイトル + 説明 + セクションごとのカード表示で読みやすさを確保
- アクセシビリティ:
  - `main` / `section` / `h1~h3` などセマンティックなタグ
  - 見出し階層を崩さない

---

## 技術的な実装方針

### ルーティング
- `src/App.tsx` またはルート定義ファイルに以下の Route を追加:
  - `/legal/operator` - 運営者情報
  - `/legal/privacy` - プライバシーポリシー
  - `/contact` - お問い合わせ（ユーザー向け）
  - `/admin/contacts` - お問い合わせ管理（運営者専用、ProtectedRoute + 運営者チェック）

### コンポーネント構成
- `src/pages/LegalOperator.tsx`  — 運営者情報
- `src/pages/LegalPrivacy.tsx`   — プライバシーポリシー
- `src/pages/Contact.tsx`        — お問い合わせ（ユーザー向け）
- `src/pages/admin/ContactManagement.tsx` — お問い合わせ管理（運営者専用）
- 必要に応じて:
  - `src/components/legal/Section.tsx` など簡易セクションコンポーネント
  - `src/components/forms/ContactForm.tsx` などフォーム専用コンポーネント
  - `src/components/admin/ContactList.tsx` — お問い合わせ一覧
  - `src/components/admin/ContactDetail.tsx` — お問い合わせ詳細・返信
  - `src/components/admin/AdminRoute.tsx` — 運営者専用ルート保護コンポーネント

### 運営者判定の実装
- 環境変数 `VITE_ADMIN_UID` に運営者の Firebase UID を設定（ハードコーディング禁止）
- ユーティリティ関数 `src/utils/admin.ts` を作成:
  ```typescript
  export const isAdmin = (userId: string): boolean => {
    const adminUid = import.meta.env.VITE_ADMIN_UID;
    return adminUid && userId === adminUid;
  };
  ```
- `AuthContext` または各ページで運営者判定を行い、運営者専用UIを表示

### Firestore コレクション設計
- `contacts` コレクション（ルートコレクション）:
  - 全ユーザーのお問い合わせを保存
  - 運営者は全件閲覧可能、ユーザーは自分のお問い合わせのみ閲覧可能
  - セキュリティルールで適切にアクセス制御

### Firestore セキュリティルール追加
- `contacts` コレクション用のルールを追加:
  - ユーザー: 自分のお問い合わせの作成・閲覧・返信が可能
  - 運営者: 全お問い合わせの閲覧・返信・ステータス更新が可能

### セキュリティ / プライバシー上の注意
- 運営者UIDは **環境変数 `VITE_ADMIN_UID` で管理**（ハードコーディング禁止）
- 画面上には **APIキーや内部IDなどの機密情報を一切表示しない**
- Firestore セキュリティルールで適切にアクセス制御:
  - ユーザーは自分のお問い合わせのみ閲覧・返信可能
  - 運営者のみ全お問い合わせを閲覧・返信可能
- お問い合わせフォームのスパム対策:
  - 将来的に reCAPTCHA 相当の仕組み or 簡易な人間確認を検討
  - 送信頻度制限（同一ユーザーからの連続送信を制限）

---

## テスト戦略

### 単体テスト
- 各ページコンポーネントが正しくレンダリングされること
- 主要な文言・リンクが存在すること（スナップショットまたはロールベースで確認）

### 統合テスト / E2E テスト
- ナビゲーションから各ページに遷移できること
- プライバシーポリシー内のアンカーリンク（目次）が機能すること（実装した場合）
- お問い合わせページで:
  - 必須項目未入力時にエラーメッセージが出ること
  - 正常入力時に Firestore に保存されること
  - ユーザーが自分のお問い合わせ一覧を確認できること
  - 運営者の返信が表示されること
- 運営者専用ページで:
  - 運営者のみアクセスできること（一般ユーザーはアクセス不可）
  - 全お問い合わせ一覧が表示されること
  - 返信機能が正常に動作すること
  - ステータス更新が正常に動作すること

---

## スケジュール案

### Day 1
- 運営者情報ページの実装（最低限の表示）
- プライバシーポリシーページの骨組み作成（セクション構造のみ）
- 運営者判定ユーティリティの実装

### Day 2
- プライバシーポリシー文面の反映
- Firestore `contacts` コレクションの設計・セキュリティルール追加
- お問い合わせページ UI ＋ バリデーション実装
- Firestore への保存機能実装

### Day 3
- お問い合わせ管理ページ（運営者専用）の実装
- 返信機能の実装（運営者・ユーザー双方）
- ユーザー向けお問い合わせ一覧・返信表示機能

### Day 4（予備）
- スタイル微調整
- E2E テスト追加 / 既存テストの更新
- 文言・リンクの最終確認
- 運営者向けナビゲーションの実装

---

## ドキュメント作成

実装完了後に、以下のドキュメントを追加・更新します。

- `PHASE6_COMPLETED.md`（本フェーズ完了報告）
- `docs/` 配下に必要であれば `LEGAL_PAGES_GUIDE.md` 的な開発者向けガイド
  - ページ URL 一覧
  - 変更時の注意点（法務確認が必要な箇所 など）

---

## データモデル詳細

### Contact 型定義
```typescript
export interface Contact {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  category: 'bug' | 'feature' | 'other';
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  replies: ContactReply[];
}

export interface ContactReply {
  id: string;
  userId: string;
  isAdmin: boolean;
  message: string;
  createdAt: Date;
}
```

### Firestore セキュリティルール追加案
```javascript
// contacts コレクション
match /contacts/{contactId} {
  // ユーザー: 自分のお問い合わせのみ閲覧・作成可能
  allow read: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if isAuthenticated() && 
    request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || isAdmin());
  allow delete: if false; // 削除は不可（履歴保持のため）
  
  // 返信の追加（replies 配列への追加）
  function canAddReply() {
    return isAuthenticated() && (
      resource.data.userId == request.auth.uid || // お問い合わせ作成者
      isAdmin() // 運営者
    );
  }
}

function isAdmin() {
  return request.auth.uid == get(/databases/$(database)/documents/config/admin).data.uid;
  // または環境変数から取得したUIDと比較（クライアント側で判定）
}
```

## まとめ

Phase 6 では、**法務・信頼性・サポート体制の整備** にフォーカスします。

- ユーザーにとって安心できる情報（運営者情報・プライバシーポリシー）を明示（最低限の表示）
- 不具合報告や要望を受け取る窓口（お問い合わせ）を用意
- Firestore に保存することで、運営者とユーザーが双方向で返信できる仕組みを実現
- 運営者専用の管理ページでお問い合わせを一元管理
- 既存の UI/ルーティング構成に沿った、シンプルかつ拡張しやすい実装方針

この計画に沿って、次のステップとしてページコンポーネントとルーティングの実装を進めます。