# Googleログイン問題のデバッグレポート

## 🔍 問題の特定

Googleアカウントでのログインができない原因を調査しました。

### 根本原因

**環境変数ファイルが存在しないため、Firebaseが初期化されていません。**

### 詳細

1. **環境変数ファイルの状態**
   - `.env.development` ファイルが存在しませんでした
   - `.env.local` ファイルも存在しませんでした
   - Firebase初期化に必要な環境変数が読み込まれていません

2. **影響**
   - Firebaseの`auth`、`db`、`storage`がすべて`null`
   - `isFirebaseEnabled()`が`false`を返す
   - Googleログインボタンをクリックすると「Firebase is not enabled」エラー

3. **確認したコード**
   - `src/lib/firebase.ts`: 環境変数がないと警告を出してFirebaseを初期化しない
   - `src/services/authService.ts`: Firebase無効時は「Firebase is not enabled」エラー
   - `src/pages/Login.tsx`: Firebase無効時は設定画面を表示

## ✅ 実施した対応

1. **`.env.development`ファイルを作成**
   - `.env.development.example`をコピーして`.env.development`を作成
   - ただし、実際のFirebase設定値はまだ入力されていません

## 🔧 解決方法

### オプション1: 開発環境用のFirebase設定を使用（推奨）

このプロジェクトはマルチ環境戦略を採用しており、以下の3つの環境があります：

- **開発環境**: `cocottu-iwailist-dev`
- **ステージング環境**: `cocottu-iwailist-staging`
- **本番環境**: `cocottu-iwailist`

開発環境用のFirebase設定を取得して設定してください：

```bash
# 1. Firebase Consoleにアクセス
# https://console.firebase.google.com/project/cocottu-iwailist-dev

# 2. プロジェクトの設定 > 全般 に移動

# 3. 「SDK の設定と構成」セクションから以下の情報を取得:
#    - API Key
#    - Auth Domain
#    - Project ID
#    - Storage Bucket
#    - Messaging Sender ID
#    - App ID

# 4. .env.development ファイルを編集
# プロジェクトルートの .env.development を開いて、実際の値を入力
```

**`.env.development`ファイルの編集例:**

```bash
# Development Environment
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=cocottu-iwailist-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cocottu-iwailist-dev
VITE_FIREBASE_STORAGE_BUCKET=cocottu-iwailist-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Environment
VITE_APP_ENV=development
```

### オプション2: 本番環境の設定を一時的に使用（非推奨）

開発環境プロジェクトがまだ作成されていない場合、一時的に本番環境の設定を使用できます：

```bash
# 1. Firebase Consoleにアクセス
# https://console.firebase.google.com/project/cocottu-iwailist

# 2. 上記と同じ手順で設定値を取得

# 3. .env.development に入力
```

⚠️ **注意**: この方法は開発中のデータが本番環境に影響する可能性があるため、本番環境プロジェクトの作成が推奨されます。

### オプション3: 新規Firebase開発プロジェクトを作成

開発環境プロジェクトがまだ存在しない場合、新規作成してください：

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `cocottu-iwailist-dev`
4. 以下のサービスを有効化:
   - **Authentication** > Sign-in method > Google を有効化
   - **Firestore Database** を作成（リージョン: `asia-northeast1`）
   - **Cloud Storage** を有効化
5. 設定 > 全般 から設定値を取得
6. `.env.development`に入力

詳細は `docs/FIREBASE_SETUP.md` と `docs/MULTI_ENVIRONMENT_SETUP.md` を参照してください。

## 🚀 設定後の確認手順

1. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

2. **ブラウザでアクセス**
   ```
   http://localhost:3000/login
   ```

3. **コンソールで環境を確認**
   - ブラウザのコンソール（F12）を開く
   - 以下のメッセージが表示されることを確認:
     ```
     🔧 Running in DEVELOPMENT mode
     Firebase Project: cocottu-iwailist-dev
     Firebase initialized successfully
     ```

4. **Googleログインを試行**
   - 「Googleでログイン」ボタンをクリック
   - Googleアカウント選択画面が表示される
   - ログインに成功する

## ❌ 想定されるエラーと解決方法

### エラー1: "Firebase is not enabled"

**原因**: 環境変数が設定されていない

**解決方法**:
- `.env.development`ファイルが存在するか確認
- ファイル内のすべての`VITE_FIREBASE_*`変数が設定されているか確認
- 開発サーバーを再起動（環境変数の変更後は必須）

### エラー2: "このドメインは認証が許可されていません"

**原因**: Firebase Consoleで承認済みドメインが設定されていない

**解決方法**:
1. Firebase Console > Authentication > Settings
2. 「承認済みドメイン」セクションで`localhost`が登録されているか確認
3. 登録されていない場合は「ドメインを追加」で`localhost`を追加

### エラー3: "ポップアップがブロックされました"

**原因**: ブラウザがポップアップをブロックしている

**解決方法**:
- ブラウザのポップアップブロック設定を確認
- `localhost`のポップアップを許可
- アプリは自動的にリダイレクト方式にフォールバックします

### エラー4: Environment variables not found

**原因**: 環境変数のプレフィックスが間違っている

**解決方法**:
- すべての環境変数が`VITE_`で始まっているか確認
- ❌ `FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_API_KEY`

## 📝 追加情報

### デバッグ情報の確認

開発環境では、ログインページに「デバッグ情報を表示」ボタンが表示されます。
このボタンをクリックすると、現在の環境変数の設定状態を確認できます。

### 環境変数ファイルの優先順位

Viteは以下の順序で環境変数ファイルを読み込みます（後から読み込まれるものが優先）：

1. `.env` (すべての環境)
2. `.env.local` (すべての環境、Git無視)
3. `.env.[mode]` (指定された環境)
4. `.env.[mode].local` (指定された環境、Git無視)

`npm run dev`は`vite --mode development`として実行されるため：
- `.env.development`が読み込まれます

### 関連ドキュメント

- [Firebase セットアップガイド](docs/FIREBASE_SETUP.md)
- [マルチ環境セットアップガイド](docs/MULTI_ENVIRONMENT_SETUP.md)
- [環境変数ガイド](docs/ENVIRONMENT_VARIABLES_GUIDE.md)

---

**作成日**: 2025-10-23  
**調査者**: Cursor AI Agent
