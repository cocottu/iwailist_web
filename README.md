# 祝い品管理Webアプリケーション

個人的な祝い品の受け取りとお返しを管理するPWA（Progressive Web App）です。

## ⚠️ セキュリティルール（重要）

**このリポジトリはpublicです。以下のルールを必ず守ってください：**

### 🚫 絶対に禁止される項目
- APIキー、アクセストークン、シークレットキーのハードコーディング
- パスワード、認証情報のハードコーディング
- データベース接続文字列（本番環境用）
- プライベートなURL、エンドポイント
- 個人情報（メールアドレス、電話番号、住所等）
- 機密設定値
- デバッグ用の本番データ

### ✅ 推奨される実装方法
- 環境変数（`import.meta.env`）を使用
- 設定ファイルを`.env.example`として提供
- 機密情報は`.env.local`で管理（gitignore済み）
- 本番用設定は環境変数で注入

### 📋 コミット前チェックリスト
- [ ] 機密情報がハードコーディングされていない
- [ ] 環境変数が適切に使用されている
- [ ] デバッグコードが削除されている
- [ ] 個人情報が含まれていない
- [ ] 本番用の設定値が露出していない

**詳細なルールは [.cursorrules](.cursorrules) を参照してください。**

## 機能

### Phase 1 (✅ 実装完了)
- ✅ 贈答品の登録・管理（一覧、詳細、編集、削除）
- ✅ 人物の登録・管理（一覧、詳細、編集、削除）
- ✅ ローカルストレージ（IndexedDB）でのデータ保存
- ✅ ダッシュボード（統計情報表示）
- ✅ 統計・分析機能
- ✅ レスポンシブデザイン

### Phase 2 (✅ 実装完了)
- ✅ PWA対応（Service Worker、オフライン動作）
- ✅ オフラインインジケーター
- ✅ PWAインストールプロンプト
- ✅ 自動更新通知
- 🔄 カメラ撮影機能（次回実装予定）

### Phase 3以降の機能
- 🔄 Firebase統合（クラウド同期、認証）
- 🔄 お返し管理機能
- 🔄 リマインダー機能

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS
- **データベース**: IndexedDB (idb)
- **ルーティング**: React Router
- **日付処理**: date-fns
- **PWA**: Vite PWA Plugin

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

### 開発サーバー
開発サーバーは `http://localhost:3000` で起動します。

### 環境変数
機密情報は環境変数を使用してください：

```bash
# .env.local ファイルを作成（gitignore済み）
VITE_API_URL=http://localhost:3000/api
VITE_API_KEY=your_api_key_here
VITE_DEBUG=false
```

**重要**: `.env.local` ファイルは絶対にコミットしないでください。

## PWA機能

このアプリは**Progressive Web App (PWA)**として動作します：

### 📱 主な機能
- **オフライン動作**: インターネット接続なしでも利用可能
- **インストール可能**: ホーム画面に追加してネイティブアプリのように使用
- **自動更新**: 新しいバージョンが利用可能になると通知
- **高速読み込み**: Service Workerによるキャッシュで高速表示
- **オフライン検知**: ネットワーク状態を自動検知して通知

### 🔧 PWAアイコンの生成

アプリをデプロイする前に、PWAアイコンを生成してください：

```bash
# オンラインツールを使用（推奨）
# 1. https://www.pwabuilder.com/imageGenerator にアクセス
# 2. public/pwa-icon-template.svg をアップロード
# 3. 生成されたアイコンを public/ に配置
```

必要なアイコン：
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `pwa-maskable-192x192.png` (192x192px、マスカブル)
- `pwa-maskable-512x512.png` (512x512px、マスカブル)

### 📲 インストール方法

**モバイルデバイス:**
1. ブラウザでアプリにアクセス
2. 画面下部に表示される「インストール」プロンプトをタップ
3. ホーム画面に追加

**デスクトップ:**
1. アドレスバーの右側にある「インストール」アイコンをクリック
2. 確認ダイアログで「インストール」をクリック

## プロジェクト構造

```
src/
├── components/          # 共通コンポーネント
│   ├── ui/             # UIコンポーネント
│   │   ├── OfflineIndicator.tsx      # オフライン表示
│   │   ├── PWAInstallPrompt.tsx      # インストールプロンプト
│   │   └── UpdatePrompt.tsx          # 更新通知
│   └── layout/         # レイアウトコンポーネント
├── hooks/              # カスタムフック
│   ├── useOnlineStatus.ts   # オンライン状態検知
│   ├── usePWAInstall.ts     # PWAインストール
│   └── useSWUpdate.ts       # Service Worker更新
├── database/           # データベース関連
│   ├── repositories/   # リポジトリパターン
│   └── schema.ts       # IndexedDBスキーマ
├── pages/              # ページコンポーネント
├── types/              # 型定義
├── utils/              # ユーティリティ
├── App.tsx             # メインアプリケーション
└── main.tsx            # エントリーポイント
```

## データモデル

### 贈答品 (Gift)
- 贈答品名
- 贈り主（人物ID）
- 受け取り日
- 金額
- カテゴリ
- お返し状況
- メモ

### 人物 (Person)
- 氏名
- フリガナ
- 関係性
- 連絡先
- メモ

## 使用方法

1. **人物を登録**: まず贈り主となる人物を登録します
2. **贈答品を登録**: 受け取った贈答品の情報を登録します
3. **統計を確認**: ダッシュボードで受取状況を確認できます
4. **分析**: 統計ページで詳細な分析が可能です

## テスト

```bash
# 単体テスト
npm run test

# カバレッジ付き
npm run test:coverage

# E2Eテスト
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

## セキュリティチェック

コミット前にセキュリティチェックを実行：

```bash
# セキュリティチェックのみ
npm run security:check

# 全チェック（セキュリティ + ESLint + テスト）
npm run pre-commit

# 本番ビルド（全チェック + ビルド）
npm run build:production
```

## トラブルシューティング

### Service Workerが更新されない

```bash
# ブラウザのキャッシュをクリア
# Chrome: DevTools > Application > Clear storage > Clear site data

# または開発モードで起動
npm run dev
```

### オフラインで動作しない

1. HTTPSまたはlocalhostでアクセスしていることを確認
2. Service Workerが登録されているか確認（DevTools > Application > Service Workers）
3. 一度オンラインでページを読み込んでキャッシュさせる

## ライセンス

MIT License