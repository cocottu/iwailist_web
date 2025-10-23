# 本番環境 Googleログイン問題の診断ガイド

## 🎯 対象環境

**URL**: https://cocottu-iwailist.firebaseapp.com/login  
**Firebaseプロジェクト**: `cocottu-iwailist`

## 🔍 問題の診断手順

本番環境でGoogleログインが失敗する場合、以下の手順で原因を特定してください。

### ステップ1: ブラウザコンソールでエラーを確認

1. ブラウザで https://cocottu-iwailist.firebaseapp.com/login にアクセス
2. ブラウザの開発者ツールを開く（F12キー）
3. **Consoleタブ**を開く
4. 「Googleでログイン」ボタンをクリック
5. 表示されるエラーメッセージを確認

#### よくあるエラーパターン

| エラーメッセージ | 原因 | 解決方法 |
|----------------|------|---------|
| `auth/unauthorized-domain` | 承認済みドメインが未設定 | [ステップ2](#ステップ2-承認済みドメインの確認) |
| `auth/popup-blocked` | ポップアップがブロックされている | ブラウザの設定でポップアップを許可 |
| `auth/operation-not-allowed` | Google認証が無効 | [ステップ3](#ステップ3-google認証の有効化確認) |
| `Firebase is not enabled` | 環境変数が設定されていない | [ステップ4](#ステップ4-github-secrets-の確認) |
| `auth/invalid-api-key` | APIキーが間違っている | [ステップ4](#ステップ4-github-secrets-の確認) |

### ステップ2: 承認済みドメインの確認

最も一般的な原因は、**承認済みドメインに本番環境のドメインが登録されていない**ことです。

#### 確認手順

1. **Firebase Consoleにアクセス**
   ```
   https://console.firebase.google.com/project/cocottu-iwailist
   ```

2. **Authentication → Settings に移動**
   - 左メニューから「Authentication」をクリック
   - 上部の「Settings」タブをクリック

3. **承認済みドメインを確認**
   - 「承認済みドメイン」（Authorized domains）セクションを探す
   - 以下のドメインが**すべて**登録されているか確認:

   ✅ 必須のドメイン:
   ```
   localhost
   cocottu-iwailist.firebaseapp.com
   cocottu-iwailist.web.app
   ```

4. **ドメインを追加する**
   - 不足しているドメインがある場合:
     1. 「ドメインを追加」ボタンをクリック
     2. ドメイン名を入力（例: `cocottu-iwailist.firebaseapp.com`）
     3. 「追加」をクリック

5. **確認**
   - ページをリロード
   - 再度Googleログインを試行

### ステップ3: Google認証の有効化確認

#### 確認手順

1. **Firebase Console → Authentication → Sign-in method に移動**
   ```
   https://console.firebase.google.com/project/cocottu-iwailist/authentication/providers
   ```

2. **Googleプロバイダーの状態を確認**
   - 「Google」の行を探す
   - 「有効」（Enabled）になっているか確認

3. **有効化されていない場合**
   1. 「Google」の行をクリック
   2. 「有効にする」トグルをオンにする
   3. **プロジェクトのサポートメール**を選択（必須）
   4. 「保存」をクリック

4. **OAuth同意画面の設定確認**
   - Google Cloud Console にアクセス:
     ```
     https://console.cloud.google.com/apis/credentials/consent
     ```
   - プロジェクト: `cocottu-iwailist`を選択
   - 「OAuth同意画面」が設定されているか確認
   - 公開ステータスを確認（テスト中/本番環境）

### ステップ4: GitHub Secrets の確認

CI/CDでビルドされるため、GitHub Secretsの設定も重要です。

#### 確認手順

1. **GitHubリポジトリにアクセス**
   ```
   https://github.com/[your-username]/[your-repo]/settings/secrets/actions
   ```

2. **必須シークレットが存在するか確認**
   以下のシークレットがすべて設定されているか確認:
   
   ```
   ✅ FIREBASE_API_KEY
   ✅ FIREBASE_AUTH_DOMAIN
   ✅ FIREBASE_PROJECT_ID
   ✅ FIREBASE_STORAGE_BUCKET
   ✅ FIREBASE_MESSAGING_SENDER_ID
   ✅ FIREBASE_APP_ID
   ✅ FIREBASE_SERVICE_ACCOUNT
   ✅ FIREBASE_TOKEN
   ```

3. **値が正しいか確認**
   - Firebase Console → プロジェクトの設定 → 全般
   - 「SDK の設定と構成」セクション
   - GitHub Secretsの値と一致しているか確認

4. **値を更新した場合**
   - mainブランチに再度プッシュしてCI/CDを実行
   - または手動でデプロイを実行

### ステップ5: ブラウザの設定確認

#### ポップアップブロックの解除

1. **Chromeの場合**
   - アドレスバー右側のアイコンをクリック
   - 「cocottu-iwailist.firebaseapp.com のポップアップとリダイレクトを常に許可する」を選択
   - ページをリロード

2. **Firefoxの場合**
   - アドレスバー左側の盾アイコンをクリック
   - 「このサイトでポップアップを許可」を選択

3. **Safariの場合**
   - Safari → 環境設定 → Webサイト → ポップアップウィンドウ
   - `cocottu-iwailist.firebaseapp.com`を「許可」に設定

#### Cookieの設定確認

- サードパーティCookieがブロックされていないか確認
- プライベートブラウジングモードでは正常に動作しない可能性があります

### ステップ6: Firebase設定診断（開発環境）

開発環境でデバッグ情報を確認する場合：

1. `.env.development`に本番環境と同じ設定を使用
2. ローカルで開発サーバーを起動: `npm run dev`
3. ログインページで「デバッグ情報を表示」をクリック
4. 環境変数の設定状態を確認

## 🔧 よくある問題と解決方法

### 問題1: "auth/unauthorized-domain" エラー

**症状**: 
```
Error: This domain (cocottu-iwailist.firebaseapp.com) is not authorized 
to run this operation.
```

**原因**: 承認済みドメインに登録されていない

**解決方法**: [ステップ2](#ステップ2-承認済みドメインの確認)を実施

---

### 問題2: "auth/operation-not-allowed" エラー

**症状**:
```
Error: This operation is not allowed. You must enable this service 
in the console.
```

**原因**: Google認証プロバイダーが有効化されていない

**解決方法**: [ステップ3](#ステップ3-google認証の有効化確認)を実施

---

### 問題3: ポップアップが表示されない

**症状**: 「Googleでログイン」をクリックしても何も起きない

**原因**: ポップアップがブロックされている

**解決方法**:
1. ブラウザのポップアップブロック設定を確認
2. アプリは自動的にリダイレクト方式にフォールバックします
3. それでも動作しない場合は、コンソールでエラーを確認

---

### 問題4: "Firebase is not enabled" エラー

**症状**: ログインボタンをクリックすると即座にエラー

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. GitHub Actionsのビルドログを確認
2. GitHub Secretsが正しく設定されているか確認
3. mainブランチに再デプロイ

---

### 問題5: ログイン後にリダイレクトされない

**症状**: Googleログインは成功するが、アプリに戻らない

**原因**: リダイレクトURLの設定ミス

**解決方法**:
1. Google Cloud Console の OAuth 2.0 クライアントIDを確認
2. 承認済みのリダイレクトURIに以下が含まれているか確認:
   ```
   https://cocottu-iwailist.firebaseapp.com/__/auth/handler
   https://cocottu-iwailist.web.app/__/auth/handler
   ```

## 📋 チェックリスト

問題解決のためのチェックリスト：

### Firebase Console の確認
- [ ] プロジェクト: `cocottu-iwailist` を開いている
- [ ] Authentication → Sign-in method でGoogleが「有効」
- [ ] Authentication → Settings で承認済みドメインに以下が登録済み:
  - [ ] `localhost`
  - [ ] `cocottu-iwailist.firebaseapp.com`
  - [ ] `cocottu-iwailist.web.app`
- [ ] プロジェクトのサポートメールが設定されている

### Google Cloud Console の確認
- [ ] OAuth同意画面が設定されている
- [ ] テストユーザーが追加されている（テストモードの場合）
- [ ] または、公開ステータスが「本番環境」になっている

### GitHub の確認
- [ ] 必要なGitHub Secretsがすべて設定されている
- [ ] 最新のmainブランチがデプロイされている
- [ ] デプロイが成功している（GitHub Actionsのログを確認）

### ブラウザの確認
- [ ] ポップアップがブロックされていない
- [ ] Cookieが有効になっている
- [ ] プライベートブラウジングモードでない

## 🚨 緊急時の対応

上記の手順で解決しない場合：

1. **Firebase Authenticationのログを確認**
   - Firebase Console → Authentication → ログ
   - 失敗したログイン試行を確認

2. **ブラウザのネットワークタブを確認**
   - 開発者ツール → Networkタブ
   - 失敗しているリクエストを特定
   - レスポンスの詳細を確認

3. **コードのデバッグ**
   - `src/services/authService.ts` の `signInWithGoogle` メソッド
   - `src/contexts/AuthContext.tsx` の認証フロー
   - コンソールに出力されるログを確認

4. **Firebase Supportに問い合わせ**
   - [Firebase Support](https://firebase.google.com/support)
   - プロジェクトID: `cocottu-iwailist`
   - エラーメッセージの詳細を提供

## 📚 関連ドキュメント

- [Firebase Setup Guide](docs/FIREBASE_SETUP.md)
- [GitHub Secrets Setup](docs/GITHUB_SECRETS_SETUP.md)
- [Google Login Fix](GOOGLE_LOGIN_FIX.md)
- [Local Debug Report](GOOGLE_LOGIN_DEBUG_REPORT.md)

---

**作成日**: 2025-10-23  
**対象環境**: 本番環境（cocottu-iwailist）  
**調査者**: Cursor AI Agent
