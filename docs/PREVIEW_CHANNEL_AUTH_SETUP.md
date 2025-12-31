# プレビューチャンネルでのSSO認証設定ガイド

## 概要

Firebase Hostingのプレビューチャンネル（staging/dev環境）でGoogle認証などのSSO認証を使用するためには、Firebase Authenticationの「承認済みドメイン」にプレビューチャンネルのURLを追加する必要があります。

## プレビューチャンネルのURL一覧

このプロジェクトでは以下の固定URLを使用しています：

| 環境 | チャンネルID | URL形式 |
|------|------------|---------|
| Production | live (デフォルト) | `https://{project-id}.web.app` |
| Staging | staging | `https://{project-id}--staging.web.app` |
| Staging Preview (PR) | staging-preview | `https://{project-id}--staging-preview.web.app` |
| Development | dev | `https://{project-id}--dev.web.app` |

### 実際のURL例

プロジェクトID `cocottu-iwailist` の場合：

- **Production**: `https://cocottu-iwailist.web.app`
- **Staging**: `https://cocottu-iwailist--staging.web.app`
- **Staging Preview**: `https://cocottu-iwailist--staging-preview.web.app`
- **Development**: `https://cocottu-iwailist--dev.web.app`

## Firebase Authenticationへの承認済みドメイン追加手順

### ステップ1: Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト（例: `cocottu-iwailist`）を選択

### ステップ2: Authentication設定を開く

1. 左メニューから「Authentication」を選択
2. 上部のタブから「Settings」（設定）をクリック
3. 「Authorized domains」（承認済みドメイン）セクションを見つける

### ステップ3: ドメインを追加

「Add domain」（ドメインを追加）ボタンをクリックし、以下のドメインを追加：

```
cocottu-iwailist--staging.web.app
cocottu-iwailist--staging-preview.web.app
cocottu-iwailist--dev.web.app
```

> **注意**: `https://` は不要です。ドメイン名のみを入力してください。

### ステップ4: 追加を確認

追加後、「Authorized domains」リストに以下が含まれていることを確認：

- ✅ `localhost` （ローカル開発用）
- ✅ `cocottu-iwailist.web.app` （本番環境）
- ✅ `cocottu-iwailist.firebaseapp.com` （自動追加）
- ✅ `cocottu-iwailist--staging.web.app` （ステージング）
- ✅ `cocottu-iwailist--staging-preview.web.app` （ステージングPRプレビュー）
- ✅ `cocottu-iwailist--dev.web.app` （開発環境）

## Google Cloud Consoleでの OAuth 設定

Google認証を使用する場合は、OAuth 2.0クライアントの設定も更新が必要な場合があります。

### 手順

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクトを選択
3. 左メニューから「APIs & Services」→「Credentials」を選択
4. OAuth 2.0 Client IDsから該当のWeb client をクリック
5. 「Authorized JavaScript origins」に以下を追加：

```
https://cocottu-iwailist--staging.web.app
https://cocottu-iwailist--staging-preview.web.app
https://cocottu-iwailist--dev.web.app
```

6. 「Authorized redirect URIs」に以下を追加：

```
https://cocottu-iwailist--staging.web.app/__/auth/handler
https://cocottu-iwailist--staging-preview.web.app/__/auth/handler
https://cocottu-iwailist--dev.web.app/__/auth/handler
```

7. 「Save」をクリック

## トラブルシューティング

### エラー: "auth/unauthorized-domain"

**原因**: 現在のドメインがFirebase Authenticationの承認済みドメインに登録されていない

**解決方法**:
1. 上記の手順でドメインを追加
2. ブラウザのキャッシュをクリア
3. ページを再読み込み

### エラー: "redirect_uri_mismatch"

**原因**: Google Cloud ConsoleのOAuth設定にリダイレクトURIが登録されていない

**解決方法**:
1. Google Cloud ConsoleでリダイレクトURIを追加
2. 変更が反映されるまで数分待つ
3. 再試行

### ポップアップがブロックされる

**原因**: ブラウザのポップアップブロッカー

**解決方法**:
1. アドレスバーのポップアップブロックアイコンをクリック
2. このサイトのポップアップを許可
3. ページを再読み込み

## 固定URLを使用する理由

Firebase Hostingのプレビューチャンネルは通常、以下の形式でランダムなURLを生成します：
```
https://{project-id}--{channel-id}-{random-hash}.web.app
```

しかし、`channelId`を明示的に指定することで、固定URLが使用されます：
```
https://{project-id}--{channel-id}.web.app
```

これにより：
- ✅ OAuth認証の承認済みドメインを事前に設定可能
- ✅ チームメンバーへのURL共有が容易
- ✅ ブックマークや外部サービス連携が安定

## 関連ファイル

- `.github/workflows/deploy-staging.yml` - Stagingデプロイ設定
- `.github/workflows/deploy-development.yml` - Developmentデプロイ設定
- `docs/FIREBASE_SETUP.md` - Firebase全般のセットアップガイド

## 参考リンク

- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/manage-hosting-resources#preview-channels)
- [Firebase Authentication Authorized Domains](https://firebase.google.com/docs/auth/web/google-signin#handling_the_sign-in_flow_manually)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
