# Google SSO redirect_uri_mismatch エラーの解決方法

## エラー内容

```
アクセスをブロック: このアプリのリクエストは無効です
エラー 400: redirect_uri_mismatch
```

## 原因

Google Cloud Console の OAuth 2.0 クライアント設定にあるリダイレクトURIが、Firebase認証が使用するリダイレクトURIと一致していないために発生します。

Firebase Authentication は `signInWithRedirect` を使用する際、以下の形式のリダイレクトURIを使用します：

```
https://<AUTH_DOMAIN>/__/auth/handler
```

## 解決手順

### ステップ 1: Google Cloud Console にアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. Firebaseプロジェクトと同じプロジェクト（`cocottu-iwailist`）を選択

### ステップ 2: OAuth 2.0 クライアントの設定を開く

1. 左側メニューから「**APIとサービス**」→「**認証情報**」をクリック
2. 「**OAuth 2.0 クライアント ID**」セクションで、ウェブクライアントをクリック
   - 通常「Web client (auto created by Google Service)」などの名前

### ステップ 3: 承認済みリダイレクトURIを追加

「**承認済みのリダイレクト URI**」セクションに、以下のURIを追加してください：

```
https://cocottu-iwailist.firebaseapp.com/__/auth/handler
```

> **重要**: `cocottu-iwailist` の部分は、実際のFirebaseプロジェクトIDと一致させてください。
> `.env` ファイルの `VITE_FIREBASE_AUTH_DOMAIN` の値を確認してください。

### ステップ 4: 承認済みJavaScript生成元を確認

「**承認済みの JavaScript 生成元**」セクションに、以下が含まれているか確認：

| 用途 | URI |
|------|-----|
| Firebase Auth Domain | `https://cocottu-iwailist.firebaseapp.com` |
| Firebase Hosting | `https://cocottu-iwailist.web.app` |
| ローカル開発 | `http://localhost:5173` |
| カスタムドメイン（任意） | `https://your-custom-domain.com` |

### ステップ 5: 設定を保存

1. 「**保存**」ボタンをクリック
2. 変更が反映されるまで数分待つ

### ステップ 6: Firebase Console での確認

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを開く
2. **Authentication** → **Settings** → **承認済みドメイン**を確認
3. 以下のドメインが登録されていることを確認：
   - `localhost`
   - `cocottu-iwailist.firebaseapp.com`
   - `cocottu-iwailist.web.app`
   - （カスタムドメインを使用している場合はそれも追加）

## カスタムAuthDomainを使用している場合

もし `VITE_FIREBASE_AUTH_DOMAIN` にカスタムドメインを設定している場合（例: `auth.yourdomain.com`）、以下のURIも追加が必要です：

```
https://auth.yourdomain.com/__/auth/handler
```

## 設定例

### .env ファイル

```bash
VITE_FIREBASE_AUTH_DOMAIN=cocottu-iwailist.firebaseapp.com
```

### Google Cloud Console - 承認済みリダイレクトURI

```
https://cocottu-iwailist.firebaseapp.com/__/auth/handler
```

### Google Cloud Console - 承認済みJavaScript生成元

```
https://cocottu-iwailist.firebaseapp.com
https://cocottu-iwailist.web.app
http://localhost:5173
```

## トラブルシューティング

### 変更後もエラーが出る場合

1. **キャッシュをクリア**: ブラウザのキャッシュとCookieをクリア
2. **シークレットモードで試す**: プライベート/シークレットウィンドウで試す
3. **数分待つ**: Google Cloud の設定反映には数分かかることがある
4. **正確なURIを確認**: URIの末尾にスラッシュがないこと、スペースがないことを確認

### 複数の環境がある場合

各環境（開発、ステージング、本番）で異なるドメインを使用している場合は、それぞれのリダイレクトURIを追加してください：

```
https://cocottu-iwailist.firebaseapp.com/__/auth/handler
https://cocottu-iwailist-dev.firebaseapp.com/__/auth/handler
https://cocottu-iwailist-staging.firebaseapp.com/__/auth/handler
```

## 参考リンク

- [Firebase Authentication - 承認済みドメイン](https://firebase.google.com/docs/auth/web/google-signin#handle_the_sign-in_flow_with_the_firebase_sdk)
- [Google Cloud Console - 認証情報](https://console.cloud.google.com/apis/credentials)
- [OAuth 2.0 リダイレクト URI の検証ルール](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)
