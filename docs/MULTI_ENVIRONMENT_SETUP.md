# マルチ環境セットアップガイド

本ガイドでは、Iwailist Webアプリケーションにおける複数環境（開発、ステージング、本番）のセットアップ手順を説明します。

> **現状:** Firebase プロジェクト数の制約により、`cocottu-iwailist` 単一プロジェクト方式（Hosting Channel: `dev` / `staging` / `live`）で運用しています。以下の手順もこの前提で整備済みです。

詳細な設計については [design/07_multi_environment_strategy.md](../design/07_multi_environment_strategy.md) を参照してください。

## 重要: プロジェクト数上限時の対応

Firebaseアカウントでプロジェクト作成数の上限に達している場合は、**単一Firebaseプロジェクト方式**を採用します。

### 単一プロジェクト方式の特徴

- ✅ **Firebase Hosting Channels**: プレビューチャネルで環境を分離
- ✅ **Firestoreコレクション分離**: 環境プレフィックス（`dev_*`, `staging_*`, `prod_*`）で分離
- ✅ **Storageパス分離**: 環境ごとにパスを分ける（`dev/`, `staging/`, `prod/`）
- ⚠️ **注意**: データの誤操作リスクを最小化するため、環境判定を必ず実装

詳細な実装方法は [design/07_multi_environment_strategy.md](../design/07_multi_environment_strategy.md) の「アプローチB：単一Firebaseプロジェクト方式」を参照してください。

## 1. 前提条件

- Firebase CLI がインストール済み
- 適切な権限を持つGoogleアカウント
- Node.js 22+ がインストール済み

## 2. Firebaseプロジェクトの設定

### 2.1 アプローチの選択

Firebaseアカウントでプロジェクト作成数の上限に達している場合は、**単一プロジェクト方式**を採用します。

### 2.2 複数プロジェクト方式の場合

#### 2.2.1 開発環境プロジェクト

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `cocottu-iwailist-dev`
4. Google Analytics: 任意で有効化
5. 以下のサービスを有効化:
   - Authentication（Email/Password、Google）
   - Firestore Database（asia-northeast1）
   - Cloud Storage
   - Hosting

#### 2.2.2 ステージング環境プロジェクト

1. 同様の手順で `cocottu-iwailist-staging` を作成
2. 同じサービスを有効化

#### 2.2.3 本番環境プロジェクト

既存の `cocottu-iwailist` プロジェクトを使用

### 2.3 単一プロジェクト方式の場合（プロジェクト数上限時）

既存の `cocottu-iwailist` プロジェクトのみを使用します。

**Firebase Hosting Channelsを使用**:
- 開発環境: プレビューチャネル（自動生成URL）
- ステージング環境: プレビューチャネルまたはカスタムチャネル
- 本番環境: メインサイト（live）

詳細は [design/07_multi_environment_strategy.md](../design/07_multi_environment_strategy.md) を参照してください。

## 3. 環境変数の設定

### 3.1 開発環境

1. プロジェクトルートに `.env.development` ファイルを作成
2. `.env.development.example` の内容をコピー
3. Firebase Console の「プロジェクトの設定」から設定値を取得して入力

```bash
cp .env.development.example .env.development
# .env.development を編集して実際の値を入力
```

### 3.2 ステージング環境

```bash
cp .env.staging.example .env.staging
# .env.staging を編集して実際の値を入力
```

### 3.3 本番環境

```bash
cp .env.production.example .env.production
# .env.production を編集して実際の値を入力
```

## 4. Firebase CLI の設定

### 4.1 ログイン

```bash
firebase login
```

### 4.2 プロジェクトの確認

`.firebaserc` ファイルで以下のように設定されていることを確認:

```json
{
  "projects": {
    "default": "cocottu-iwailist",
    "development": "cocottu-iwailist",
    "staging": "cocottu-iwailist",
    "production": "cocottu-iwailist"
  }
}
```

### 4.3 プロジェクトの切り替え

```bash
# 開発環境
firebase use development

# ステージング環境
firebase use staging

# 本番環境
firebase use production

# 現在使用中のプロジェクトを確認
firebase use
```

> 単一プロジェクト方式では、`development` / `staging` / `production` すべてが同じ `cocottu-iwailist` を指します。実際の分離は `VITE_APP_ENV`・Firestore/Storage のプレフィックス・Hosting Channel で行われます。

## 5. ローカル開発

### 5.1 開発環境で実行

```bash
npm run dev
# または
npm run dev:staging
npm run dev:prod
```

### 5.2 ビルド

```bash
# 開発環境用ビルド
npm run build:dev

# ステージング環境用ビルド
npm run build:staging

# 本番環境用ビルド
npm run build:prod
```

## 6. デプロイ

### 6.1 複数プロジェクト方式の場合

```bash
# 開発環境にデプロイ
npm run deploy:dev

# ステージング環境にデプロイ
npm run deploy:staging

# 本番環境にデプロイ
npm run deploy:prod
```

### 6.2 単一プロジェクト方式の場合（プロジェクト数上限時）

**Firebase Hosting Channelsを使用**（`npm run deploy:*` がラップ済み）:

```bash
# 開発環境: dev チャネル（30日間有効）
npm run deploy:dev

# ステージング環境: staging チャネル（90日間有効）
npm run deploy:staging

# 本番環境: live チャネル
npm run deploy:prod

# プレビューチャネルの一覧確認
firebase hosting:channel:list

# 不要になったチャネルの削除
firebase hosting:channel:delete <channelName>
```

**環境別URL**:
- 開発環境: `https://cocottu-iwailist--dev-[HASH].web.app`
- ステージング環境: `https://cocottu-iwailist--staging-[HASH].web.app`
- 本番環境: `https://cocottu-iwailist.web.app` またはカスタムドメイン

### 6.2 GitHub Actions経由のデプロイ

単一プロジェクト方式では、すべてのワークフローで同じ Firebase 資格情報を共有します。GitHub Secrets には以下のみ登録すれば OK です（`VITE_APP_ENV` は Workflow 側で切り替え）。

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`（JSON）
- `FIREBASE_TOKEN`（CLIでのルールデプロイ用・任意）

## 7. Security Rulesのデプロイ

単一プロジェクトでは Rules / Index / Storage 設定も共有されるため、**本番（live）に対してのみデプロイ**します。事前に `firebase use production` を実行してから以下を行ってください。

```bash
firebase use production
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 8. 動作確認

### 8.1 開発環境

```bash
npm run dev
# ブラウザで http://localhost:5173 にアクセス
# コンソールに "🔧 Running in DEVELOPMENT mode" が表示されることを確認
```

### 8.2 ステージング環境

```bash
npm run dev:staging
# コンソールに "🧪 Running in STAGING mode" が表示されることを確認
```

### 8.3 本番環境

```bash
npm run dev:prod
# コンソールに "🚀 Running in PRODUCTION mode" が表示されることを確認
```

## 9. トラブルシューティング

### 問題: 環境変数が読み込まれない

**解決方法**:
```bash
# ファイル名を確認
ls -la .env*

# 開発サーバーを再起動
npm run dev
```

### 問題: Firebase プロジェクトが切り替わらない

**解決方法**:
```bash
# 現在のプロジェクトを確認
firebase use

# プロジェクトを明示的に指定
firebase use development
```

### 問題: デプロイに失敗する

**解決方法**:
```bash
# Firebase CLI を最新版に更新
npm install -g firebase-tools@latest

# ログインし直す
firebase logout
firebase login
```

## 10. ベストプラクティス

1. **環境ファイルは Git にコミットしない**
   - `.env.development`
   - `.env.staging`
   - `.env.production`
   
   これらは `.gitignore` で除外されています。

2. **デプロイ前に必ずテスト**
   ```bash
   npm run lint
   npm run test:run
   npm run build:staging
   ```

3. **本番デプロイは慎重に**
   - ステージング環境で十分にテスト
   - GitHub Actions経由での自動デプロイを推奨

4. **環境の確認**
   - デプロイ前に `firebase use` で現在のプロジェクトを確認
   - ブラウザコンソールで環境モードを確認

## 11. 参考資料

- [マルチ環境戦略設計書](../design/07_multi_environment_strategy.md)
- [Firebaseセットアップガイド](./FIREBASE_SETUP.md)
- [GitHub Actionsセットアップガイド](./GITHUB_ACTIONS_SETUP.md)

---

**作成日**: 2025-10-19  
**バージョン**: 1.0
