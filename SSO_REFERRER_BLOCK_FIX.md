# SSO リファラーブロックエラー解決ガイド

## エラー概要

```json
{
  "error": {
    "code": 403,
    "message": "Requests from referer https://cocottu-iwailist-dev.firebaseapp.com/ are blocked.",
    "status": "PERMISSION_DENIED",
    "details": [{
      "reason": "API_KEY_HTTP_REFERRER_BLOCKED",
      "metadata": {
        "httpReferrer": "https://cocottu-iwailist-dev.firebaseapp.com/",
        "service": "identitytoolkit.googleapis.com",
        "consumer": "projects/338610350357"
      }
    }]
  }
}
```

## 原因

2つの原因が考えられます：

1. **authDomain の設定ミス**: `.env` ファイルの `VITE_FIREBASE_AUTH_DOMAIN` が `.firebaseapp.com` になっているが、Google Cloud Console のAPIキー制限では `.web.app` ドメインのみが許可されている
2. **APIキーの制限設定漏れ**: 使用しているドメインがAPIキーの許可リストに含まれていない

## 解決方法

### 方法1: authDomain を .web.app に変更（推奨・修正済み）

各環境の `.env` ファイルで `VITE_FIREBASE_AUTH_DOMAIN` を `.web.app` ドメインに変更：

| 環境 | authDomain |
|------|------------|
| 開発 | `cocottu-iwailist-dev.web.app` |
| ステージング | `cocottu-iwailist-staging.web.app` |
| 本番 | `cocottu-iwailist.web.app` |

**修正例 (.env.development):**
```
VITE_FIREBASE_AUTH_DOMAIN=cocottu-iwailist-dev.web.app
```

### 方法2: Google Cloud Console でAPIキーの制限を更新

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト `cocottu-iwailist`（ID: 338610350357）を選択
3. 左メニューから **「APIとサービス」** → **「認証情報」** を選択
4. **「APIキー」** セクションで、使用中のAPIキーをクリック
5. **「アプリケーションの制限」** セクションで **「HTTPリファラー（ウェブサイト）」** を選択
6. 以下のリファラーを追加:

```
https://cocottu-iwailist-dev.web.app/*
https://cocottu-iwailist-staging.web.app/*
https://cocottu-iwailist.web.app/*
http://localhost:*/*
http://127.0.0.1:*/*
```

7. **「保存」** をクリック

### 方法3: Firebase Console で承認済みドメインを確認

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `cocottu-iwailist` を選択
3. 左メニューから **「Authentication」** → **「Settings」** → **「承認済みドメイン」** を選択
4. 以下のドメインが追加されていることを確認:

```
cocottu-iwailist-dev.web.app
cocottu-iwailist-staging.web.app
cocottu-iwailist.web.app
localhost
127.0.0.1
```

## 確認手順

設定変更後、以下の手順で動作を確認:

1. ブラウザのキャッシュをクリア
2. シークレットモード/プライベートブラウジングで新しいウィンドウを開く
3. `https://cocottu-iwailist-dev.firebaseapp.com/` にアクセス
4. Googleログインを試行

## 追加設定（推奨）

### API制限の追加

APIキーのセキュリティを高めるため、以下のAPIのみを許可することを推奨:

- Identity Toolkit API
- Firebase Auth API
- Cloud Firestore API
- Cloud Storage for Firebase API

### 環境ごとのAPIキー分離

より安全な運用のため、環境ごとに別々のAPIキーを使用することを検討:

- 開発環境用APIキー
- ステージング環境用APIキー
- 本番環境用APIキー

## GitHub Secrets の設定（重要）

GitHub Actions でデプロイする場合、各環境のシークレットに正しい `FIREBASE_AUTH_DOMAIN` を設定する必要があります。

### 設定手順

1. GitHub リポジトリの **Settings** → **Environments** を開く
2. 各環境（develop, staging, production）で以下のシークレットを更新:

| 環境 | シークレット名 | 値 |
|------|---------------|-----|
| develop | `FIREBASE_AUTH_DOMAIN` | `cocottu-iwailist-dev.web.app` |
| staging | `FIREBASE_AUTH_DOMAIN` | `cocottu-iwailist-staging.web.app` |
| production | `FIREBASE_AUTH_DOMAIN` | `cocottu-iwailist.web.app` |

### 確認方法

デプロイ後、ブラウザの開発者ツールで以下を確認:

```javascript
console.log(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
// 期待値: cocottu-iwailist-dev.web.app (開発環境の場合)
```

## 関連ファイル

- `.firebaserc` - Firebase プロジェクト/ホスティング設定
- `src/lib/firebase.ts` - Firebase初期化コード
- `src/services/authService.ts` - 認証サービス
- `.github/workflows/deploy-development.yml` - 開発環境デプロイワークフロー
- `.github/workflows/deploy-staging.yml` - ステージング環境デプロイワークフロー
- `.github/workflows/deploy-production.yml` - 本番環境デプロイワークフロー

## 参考リンク

- [Google Cloud API キーの制限](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)
- [Firebase Authentication ドメイン設定](https://firebase.google.com/docs/auth/web/redirect-best-practices)
