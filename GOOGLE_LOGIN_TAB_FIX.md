# Googleログインボタン - タブが開くだけの問題の修正

## 🔍 問題の症状

「Googleでログイン」ボタンを押すと新しいタブが開くだけで、ログインプロセスが完了しない。

## 🎯 実施した修正内容

### 1. 認証方式の変更（signInWithRedirect優先）

**変更前**: ポップアップ方式を優先し、ブロックされた場合のみリダイレクト方式にフォールバック

**変更後**: 最初からリダイレクト方式を使用

#### メリット
- ✅ ポップアップブロックの影響を受けない
- ✅ すべてのブラウザで確実に動作
- ✅ モバイルデバイスでも安定して動作
- ✅ タブが開くだけで何も起こらない問題を解消

#### 修正ファイル
- `src/services/authService.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`

### 2. エラーハンドリングの改善

リダイレクト処理は例外をthrowするため、適切に処理するように改善：

```typescript
// リダイレクト中のエラーは正常な動作として扱う
if (err instanceof Error && err.message.includes('Redirecting')) {
  console.log('Redirecting to Google for authentication...');
  return;
}
```

### 3. ユーザー体験の向上

- リダイレクト中であることを示すメッセージを表示
- ボタンにtitle属性を追加（「新しいページに移動します」）

## 🔧 Firebase Console で確認が必要な設定

### ステップ1: プロジェクトを確認

Firebase Consoleにアクセス:
```
https://console.firebase.google.com/
```

正しいプロジェクト（本番環境または開発環境）を選択してください。

### ステップ2: Google認証プロバイダーの有効化

1. **Authentication → Sign-in method** に移動
2. **Google** プロバイダーが「有効」になっているか確認
3. 無効の場合：
   - Googleの行をクリック
   - 「有効にする」トグルをオンにする
   - プロジェクトのサポートメールを選択（必須）
   - 「保存」をクリック

### ステップ3: 承認済みドメインの設定（最重要）

1. **Authentication → Settings** に移動
2. **承認済みドメイン**（Authorized domains）セクションを確認

#### 必須のドメイン:

**ローカル開発環境:**
```
localhost
```

**本番環境（Firebase Hosting）:**
```
cocottu-iwailist.firebaseapp.com
cocottu-iwailist.web.app
```

**カスタムドメイン（設定している場合）:**
```
your-custom-domain.com
```

#### ドメインの追加方法:
1. 「ドメインを追加」ボタンをクリック
2. ドメイン名を入力
3. 「追加」をクリック

### ステップ4: OAuth同意画面の設定

Google Cloud Consoleで確認:
```
https://console.cloud.google.com/apis/credentials/consent
```

1. 正しいプロジェクトを選択
2. OAuth同意画面が設定されているか確認
3. **公開ステータス**を確認:
   - **テスト中**: テストユーザーを追加する必要がある
   - **本番環境**: 誰でもログイン可能

#### テストユーザーの追加（テスト中の場合）:
1. 「テストユーザーを追加」をクリック
2. テスト用のGoogleアカウントのメールアドレスを入力
3. 「保存」をクリック

## 🚀 動作確認手順

### ローカル環境での確認

1. **環境変数を設定**
   ```bash
   # .env.development に実際のFirebase設定を入力
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

3. **ログインページにアクセス**
   ```
   http://localhost:5173/login
   ```

4. **「Googleでログイン」をクリック**
   - Googleの認証ページに移動する
   - アカウントを選択してログイン
   - 元のページに戻ってログインが完了する

### 本番環境での確認

1. **本番URLにアクセス**
   ```
   https://cocottu-iwailist.firebaseapp.com/login
   ```

2. **同様の手順でテスト**

## ❌ よくあるエラーと解決方法

### エラー1: "このドメインは認証が許可されていません"

**エラーメッセージ:**
```
auth/unauthorized-domain: This domain is not authorized to run this operation.
```

**原因:** 承認済みドメインに登録されていない

**解決方法:**
- [ステップ3](#ステップ3-承認済みドメインの設定最重要)を実施
- 現在アクセスしているドメインを承認済みドメインに追加

### エラー2: "この操作は許可されていません"

**エラーメッセージ:**
```
auth/operation-not-allowed: This operation is not allowed.
```

**原因:** Google認証プロバイダーが有効化されていない

**解決方法:**
- [ステップ2](#ステップ2-google認証プロバイダーの有効化)を実施

### エラー3: "アクセスがブロックされました: このアプリは確認されていません"

**エラーメッセージ:**
```
Access blocked: This app's request is invalid
```

**原因:** OAuth同意画面が未設定、またはテストユーザーが登録されていない

**解決方法:**
- [ステップ4](#ステップ4-oauth同意画面の設定)を実施
- テストユーザーを追加、または公開ステータスを「本番環境」に変更

### エラー4: "Firebase is not enabled"

**エラーメッセージ:**
```
Firebase is not enabled
```

**原因:** 環境変数が設定されていない

**解決方法:**
- ローカル環境: `.env.development`ファイルを確認
- 本番環境: GitHub Secretsを確認してCI/CDを再実行

### エラー5: リダイレクト後にログインできない

**症状:** Googleでログインしても元のページに戻らない、またはログイン状態にならない

**原因:** リダイレクト結果の処理が正しく動作していない

**解決方法:**
1. ブラウザのコンソールでエラーを確認
2. Google Cloud ConsoleのOAuth 2.0クライアントIDを確認
3. 承認済みのリダイレクトURIに以下が含まれているか確認:
   ```
   https://your-domain.firebaseapp.com/__/auth/handler
   ```

## 📋 設定チェックリスト

以下の項目をすべて確認してください:

### Firebase Console
- [ ] Google認証プロバイダーが「有効」
- [ ] サポートメールが設定されている
- [ ] 承認済みドメインに以下が登録されている:
  - [ ] `localhost` （ローカル開発用）
  - [ ] あなたの Firebase Hosting ドメイン
  - [ ] カスタムドメイン（設定している場合）

### Google Cloud Console
- [ ] OAuth同意画面が設定されている
- [ ] 公開ステータスが「本番環境」、または
- [ ] テストユーザーが追加されている（テスト中の場合）

### ローカル環境（開発時）
- [ ] `.env.development`ファイルが存在する
- [ ] すべての`VITE_FIREBASE_*`環境変数が設定されている
- [ ] 開発サーバーを再起動した（環境変数変更後）

### 本番環境
- [ ] GitHub Secretsがすべて設定されている
- [ ] 最新のコードがデプロイされている
- [ ] デプロイが成功している（GitHub Actionsのログを確認）

## 🎉 期待される動作

修正後の正常な動作フロー:

1. **「Googleでログイン」をクリック**
   → 「Googleの認証ページに移動します...」というメッセージが表示される

2. **Googleの認証ページに移動**
   → 新しいページでGoogleアカウントを選択

3. **アカウントを選択してログイン**
   → 権限の確認（初回のみ）

4. **元のページに自動的に戻る**
   → ログインが完了し、ダッシュボードに移動

## 📚 関連ドキュメント

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth/web/google-signin)
- [Google OAuth 2.0 ガイド](https://developers.google.com/identity/protocols/oauth2)
- [Firebase セットアップガイド](docs/FIREBASE_SETUP.md)
- [GitHub Secrets セットアップ](docs/GITHUB_SECRETS_SETUP.md)

---

**作成日**: 2025-10-23  
**対象バージョン**: Phase 4+  
**対応者**: Cursor AI Agent
