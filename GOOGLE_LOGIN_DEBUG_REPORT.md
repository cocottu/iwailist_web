# Googleログイン問題のデバッグレポート（修正版）

## 🔍 問題の特定

Googleアカウントでのログインができない原因を調査しました。

### 根本原因の訂正

**ローカル開発環境で環境変数ファイルが存在しないため、Firebaseが初期化されていません。**

## 📊 CI環境とローカル環境の違い

### CI環境（GitHub Actions）での動作

GitHub Actionsでは、`.env`ファイルを作成せず、**ビルド時に環境変数を直接設定**しています：

```yaml
# .github/workflows/firebase-hosting-deploy.yml の例
- name: Build application
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
    VITE_APP_ENV: production
  run: npm run build
```

✅ **CI環境では正常に動作**:
- GitHub Secretsから環境変数として直接注入
- Viteのビルドプロセスで`import.meta.env.VITE_*`として利用可能
- `.env`ファイルは不要

### ローカル開発環境での動作

❌ **ローカル環境では動作しない**:
- `.env.development`ファイルが存在しない
- Firebase初期化に必要な環境変数が読み込まれない
- `isFirebaseEnabled()`が`false`を返す
- Googleログインで「Firebase is not enabled」エラー

## 🔧 解決方法

### ローカル開発環境でGoogleログインを動作させる手順

#### 方法1: 開発環境用のFirebase設定を使用（推奨）

```bash
# 1. Firebase Console から開発環境の設定を取得
# https://console.firebase.google.com/project/cocottu-iwailist-dev
# ※プロジェクトが存在しない場合は作成が必要

# 2. .env.development を編集
# 実際のFirebase設定値を入力してください
```

**`.env.development`の編集例:**

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

```bash
# 3. 開発サーバーを起動
npm run dev

# 4. ブラウザで http://localhost:3000/login にアクセス
# 5. Googleログインをテスト
```

#### 方法2: 本番環境の設定を一時的に使用（開発時のみ）

⚠️ **注意**: 開発中のデータが本番環境に影響する可能性があります

```bash
# GitHub Secretsと同じ本番環境の値を .env.development に設定
# ※本番環境への影響を避けるため、テスト用データのみ使用すること
```

### GitHub Secretsの確認（参考情報）

現在のGitHub Actionsワークフローは以下のシークレットを使用しています：

**必須シークレット:**
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_TOKEN`

**任意シークレット:**
- `CODECOV_TOKEN` (コードカバレッジレポート用)

これらのシークレットは**CI環境専用**で、ローカル開発環境には自動的に適用されません。

## 🚀 動作確認手順

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

## 🎯 まとめ

### CI環境（GitHub Actions）
- ✅ 環境変数ファイルは**不要**
- ✅ GitHub Secretsから直接環境変数として注入
- ✅ すでに正しく設定済み

### ローカル開発環境
- ❌ `.env.development`ファイルが**必要**
- ❌ 現在未設定のため、Googleログインが動作しない
- ✅ Firebase設定を入力すれば動作する

### 対応が必要な作業

1. **Firebase Console**から開発環境プロジェクト（`cocottu-iwailist-dev`）の設定を取得
   - プロジェクトが存在しない場合は新規作成
   - または一時的に本番環境の設定を使用

2. **`.env.development`ファイル**に実際の値を入力
   - すでにテンプレートは作成済み
   - 6つの`VITE_FIREBASE_*`変数を設定

3. **開発サーバーを再起動**してテスト

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

## 📝 関連ファイル

### GitHub Actionsワークフロー
- `.github/workflows/firebase-hosting-deploy.yml` - 本番デプロイ
- `.github/workflows/deploy-development.yml` - 開発環境デプロイ
- `.github/workflows/deploy-staging.yml` - ステージング環境デプロイ
- `.github/workflows/test.yml` - テスト実行
- `.github/workflows/e2e-tests.yml` - E2Eテスト

### 環境変数ファイル（ローカル用）
- `.env.development` - 開発環境設定（要設定）
- `.env.staging.example` - ステージング環境テンプレート
- `.env.production.example` - 本番環境テンプレート
- `.env.example` - 汎用テンプレート

### 関連ドキュメント
- [Firebase セットアップガイド](docs/FIREBASE_SETUP.md)
- [マルチ環境セットアップガイド](docs/MULTI_ENVIRONMENT_SETUP.md)
- [環境変数ガイド](docs/ENVIRONMENT_VARIABLES_GUIDE.md)
- [GitHub Secretsセットアップ](docs/GITHUB_SECRETS_SETUP.md)

---

**作成日**: 2025-10-23  
**最終更新**: 2025-10-23  
**調査者**: Cursor AI Agent
