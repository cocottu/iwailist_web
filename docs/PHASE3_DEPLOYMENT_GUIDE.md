# Phase 3 デプロイガイド

## Firebase プロジェクトのセットアップ

### 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: iwailist-web）
4. Google Analyticsは任意で有効化
5. プロジェクトを作成

### 2. Firebase CLI のインストール

```bash
npm install -g firebase-tools
```

### 3. Firebase ログイン

```bash
firebase login
```

### 4. プロジェクトの初期化

```bash
# プロジェクトルートで実行
firebase init

# 以下を選択:
# - Firestore
# - Hosting
# - Storage

# プロジェクトを選択
# - Use an existing project → 作成したプロジェクトを選択

# Firestore Rules
# - What file should be used for Firestore Rules? → firestore.rules
# - What file should be used for Firestore indexes? → firestore.indexes.json

# Hosting
# - What do you want to use as your public directory? → dist
# - Configure as a single-page app? → Yes
# - Set up automatic builds and deploys with GitHub? → No

# Storage Rules
# - What file should be used for Storage Rules? → storage.rules
```

### 5. 環境変数の設定

`.env.local` ファイルを作成:

```bash
# Firebase Console の「プロジェクトの設定」から取得
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ENV=production
```

### 6. Firebase Authentication の有効化

1. Firebase Console で「Authentication」を選択
2. 「Sign-in method」タブを開く
3. 以下を有効化:
   - Email/Password
   - Google

### 7. Firestore Database の作成

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 本番モードで開始
4. ロケーションを選択（asia-northeast1 推奨）

### 8. Firebase Storage の有効化

1. Firebase Console で「Storage」を選択
2. 「始める」をクリック
3. セキュリティルールはデフォルトのまま（後でデプロイ）

## セキュリティルールのデプロイ

```bash
# Firestore Rules をデプロイ
firebase deploy --only firestore:rules

# Firestore Indexes をデプロイ
firebase deploy --only firestore:indexes

# Storage Rules をデプロイ
firebase deploy --only storage
```

## アプリケーションのビルドとデプロイ

### 1. ビルド

```bash
# 依存関係のインストール
npm install

# 型チェック
npm run lint

# テスト実行
npm run test:run

# 本番ビルド
npm run build
```

### 2. デプロイ

```bash
# Hosting にデプロイ
firebase deploy --only hosting

# すべてをデプロイ
firebase deploy
```

### 3. デプロイURL確認

デプロイが完了すると、以下のようなURLが表示されます:
```
Hosting URL: https://your-project-id.web.app
```

## CI/CD セットアップ（GitHub Actions）

### 1. Firebase サービスアカウントの作成

```bash
firebase login:ci
```

生成されたトークンを GitHub Secrets に保存:
- `FIREBASE_TOKEN`

### 2. GitHub Secrets の設定

GitHub リポジトリの Settings → Secrets and variables → Actions で以下を追加:

- `FIREBASE_TOKEN`: Firebase CI トークン
- `FIREBASE_PROJECT_ID`: プロジェクトID
- `FIREBASE_API_KEY`: Firebase API キー
- `FIREBASE_AUTH_DOMAIN`: Auth ドメイン
- `FIREBASE_STORAGE_BUCKET`: Storage バケット
- `FIREBASE_MESSAGING_SENDER_ID`: Messaging Sender ID
- `FIREBASE_APP_ID`: App ID

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリア
rm -rf node_modules dist
npm install
npm run build
```

### デプロイエラー

```bash
# Firebase CLI を最新版に更新
npm install -g firebase-tools@latest

# プロジェクトを再選択
firebase use --add
```

### 認証エラー

- Firebase Console で Authentication が有効化されているか確認
- `.env.local` の環境変数が正しいか確認
- ブラウザのキャッシュをクリア

### Firestore アクセスエラー

- Security Rules が正しくデプロイされているか確認
- Firebase Console で Rules を確認
- ユーザーが認証されているか確認

## 監視とメンテナンス

### Firebase Console でのモニタリング

1. **Authentication**: ユーザー数、ログイン統計
2. **Firestore**: 読み取り/書き込み回数、ストレージ使用量
3. **Storage**: ファイル数、ストレージ使用量
4. **Hosting**: リクエスト数、帯域幅使用量

### 定期メンテナンス

- 月次: 依存パッケージの更新
- 四半期: Firebase SDK の更新
- 四半期: Security Rules の見直し
- 年次: データベースのクリーンアップ

## 本番環境チェックリスト

- [ ] Firebase プロジェクトが作成されている
- [ ] Authentication が有効化されている
- [ ] Firestore Database が作成されている
- [ ] Storage が有効化されている
- [ ] Security Rules がデプロイされている
- [ ] 環境変数が設定されている
- [ ] アプリケーションがビルドできる
- [ ] テストが通過する
- [ ] デプロイが成功する
- [ ] 本番環境で動作確認できる
