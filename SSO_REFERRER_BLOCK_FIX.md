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

Google Cloud Console でAPIキーにHTTPリファラー制限が設定されており、開発環境のホスティングURL (`cocottu-iwailist-dev.firebaseapp.com`) が許可リストに含まれていません。

Firebase Authenticationは `identitytoolkit.googleapis.com` APIを使用しており、このAPIへのリクエストがリファラー制限によってブロックされています。

## 解決方法

### 方法1: Google Cloud Console でAPIキーの制限を更新（推奨）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト `cocottu-iwailist`（ID: 338610350357）を選択
3. 左メニューから **「APIとサービス」** → **「認証情報」** を選択
4. **「APIキー」** セクションで、使用中のAPIキーをクリック
5. **「アプリケーションの制限」** セクションで **「HTTPリファラー（ウェブサイト）」** を選択
6. 以下のリファラーを追加:

```
https://cocottu-iwailist-dev.firebaseapp.com/*
https://cocottu-iwailist-dev.web.app/*
https://cocottu-iwailist-staging.firebaseapp.com/*
https://cocottu-iwailist-staging.web.app/*
https://cocottu-iwailist.firebaseapp.com/*
https://cocottu-iwailist.web.app/*
http://localhost:*/*
http://127.0.0.1:*/*
```

7. **「保存」** をクリック

### 方法2: Firebase Console で承認済みドメインを確認

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `cocottu-iwailist` を選択
3. 左メニューから **「Authentication」** → **「Settings」** → **「承認済みドメイン」** を選択
4. 以下のドメインが追加されていることを確認:

```
cocottu-iwailist-dev.firebaseapp.com
cocottu-iwailist-dev.web.app
cocottu-iwailist-staging.firebaseapp.com
cocottu-iwailist-staging.web.app
cocottu-iwailist.firebaseapp.com
cocottu-iwailist.web.app
localhost
127.0.0.1
```

### 方法3: APIキーの制限を一時的に解除（開発時のみ）

**注意: 本番環境では使用しないでください**

1. Google Cloud Console でAPIキーを選択
2. **「アプリケーションの制限」** を **「なし」** に設定
3. 開発・テスト完了後、必ず制限を再設定

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

## 関連ファイル

- `.firebaserc` - Firebase プロジェクト/ホスティング設定
- `src/lib/firebase.ts` - Firebase初期化コード
- `src/services/authService.ts` - 認証サービス

## 参考リンク

- [Google Cloud API キーの制限](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)
- [Firebase Authentication ドメイン設定](https://firebase.google.com/docs/auth/web/redirect-best-practices)
