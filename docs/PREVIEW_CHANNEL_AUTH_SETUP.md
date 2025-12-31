# マルチサイト構成でのSSO認証設定ガイド

## 概要

Firebase Hostingのプレビューチャンネルでは、`channelId` を固定しても各デプロイでランダムなハッシュがURLに付加されます（例: `staging-rvrc4h8s`）。これではOAuth認証のリダイレクトURIを事前に設定できません。

この問題を解決するため、**Firebase Hostingのマルチサイト機能**を使用して、staging/dev環境用の独立したサイトを作成し、それぞれのliveチャンネル（本番チャンネル）にデプロイします。

## アーキテクチャ

```
Firebase Project: cocottu-iwailist
├── Site: cocottu-iwailist (Production)
│   └── URL: https://cocottu-iwailist.web.app
├── Site: cocottu-iwailist-staging (Staging)
│   └── URL: https://cocottu-iwailist-staging.web.app
└── Site: cocottu-iwailist-dev (Development)
    └── URL: https://cocottu-iwailist-dev.web.app
```

## 固定URL一覧

| 環境 | サイト名 | URL |
|------|----------|-----|
| Production | `{project-id}` | `https://{project-id}.web.app` |
| Staging | `{project-id}-staging` | `https://{project-id}-staging.web.app` |
| Development | `{project-id}-dev` | `https://{project-id}-dev.web.app` |

### 実際のURL例（cocottu-iwailist プロジェクト）

- **Production**: `https://cocottu-iwailist.web.app`
- **Staging**: `https://cocottu-iwailist-staging.web.app`
- **Development**: `https://cocottu-iwailist-dev.web.app`

## 前提条件: Firebase Consoleでサイトを作成

デプロイを行う前に、Firebase ConsoleでStaging/Development用のサイトを作成する必要があります。

### ステップ1: Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト（例: `cocottu-iwailist`）を選択

### ステップ2: Hostingセクションを開く

1. 左メニューから「Hosting」を選択
2. 「Add another site」（別のサイトを追加）をクリック

### ステップ3: サイトを作成

以下のサイトを作成します：

1. **Staging用サイト**
   - サイトID: `{project-id}-staging`（例: `cocottu-iwailist-staging`）
   - 「Add site」をクリック

2. **Development用サイト**
   - サイトID: `{project-id}-dev`（例: `cocottu-iwailist-dev`）
   - 「Add site」をクリック

> **注意**: サイトIDはグローバルに一意である必要があります。既に使用されている場合は別の名前を選択してください。

## Firebase Authenticationへの承認済みドメイン追加手順

### ステップ1: Authentication設定を開く

1. Firebase Consoleで「Authentication」を選択
2. 上部のタブから「Settings」（設定）をクリック
3. 「Authorized domains」（承認済みドメイン）セクションを見つける

### ステップ2: ドメインを追加

「Add domain」（ドメインを追加）ボタンをクリックし、以下のドメインを追加：

```
cocottu-iwailist-staging.web.app
cocottu-iwailist-dev.web.app
```

> **注意**: `https://` は不要です。ドメイン名のみを入力してください。

### ステップ3: 追加を確認

追加後、「Authorized domains」リストに以下が含まれていることを確認：

- ✅ `localhost` （ローカル開発用）
- ✅ `cocottu-iwailist.web.app` （本番環境）
- ✅ `cocottu-iwailist.firebaseapp.com` （自動追加）
- ✅ `cocottu-iwailist-staging.web.app` （ステージング環境）
- ✅ `cocottu-iwailist-dev.web.app` （開発環境）

## Google Cloud Consoleでの OAuth 設定

Google認証を使用する場合は、OAuth 2.0クライアントの設定も更新が必要です。

### 手順

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクトを選択
3. 左メニューから「APIs & Services」→「Credentials」を選択
4. OAuth 2.0 Client IDsから該当のWeb client をクリック
5. 「Authorized JavaScript origins」に以下を追加：

```
https://cocottu-iwailist-staging.web.app
https://cocottu-iwailist-dev.web.app
```

6. 「Authorized redirect URIs」に以下を追加：

```
https://cocottu-iwailist-staging.web.app/__/auth/handler
https://cocottu-iwailist-dev.web.app/__/auth/handler
```

7. 「Save」をクリック

## プロジェクト設定ファイル

### firebase.json

マルチサイト構成では、各サイトをターゲットとして定義します：

```json
{
  "hosting": [
    {
      "target": "production",
      "public": "dist",
      ...
    },
    {
      "target": "staging",
      "public": "dist",
      ...
    },
    {
      "target": "development",
      "public": "dist",
      ...
    }
  ]
}
```

### .firebaserc

ターゲットとサイトのマッピングを定義します：

```json
{
  "projects": {
    "default": "cocottu-iwailist"
  },
  "targets": {
    "cocottu-iwailist": {
      "hosting": {
        "production": ["cocottu-iwailist"],
        "staging": ["cocottu-iwailist-staging"],
        "development": ["cocottu-iwailist-dev"]
      }
    }
  }
}
```

## GitHub Actionsワークフロー

各ワークフローは以下のようにデプロイを実行します：

```yaml
# ターゲットを動的に設定
- name: Deploy to Firebase Hosting
  run: |
    firebase target:apply hosting staging ${{ secrets.FIREBASE_PROJECT_ID }}-staging --project ${{ secrets.FIREBASE_PROJECT_ID }}
    firebase deploy --only hosting:staging --project ${{ secrets.FIREBASE_PROJECT_ID }}
```

## トラブルシューティング

### エラー: "Hosting site not found"

**原因**: Firebase Consoleでサイトが作成されていない

**解決方法**:
1. Firebase Console → Hosting を開く
2. 「Add another site」で必要なサイトを作成
3. 再デプロイ

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

## マルチサイト構成を使用する理由

### 以前のアプローチ（問題あり）

Firebase Hostingのプレビューチャンネルは、`channelId` を指定しても以下の形式でランダムなハッシュが付加されます：
```
https://{project-id}--{channel-id}-{random-hash}.web.app
```

### 新しいアプローチ（解決策）

マルチサイト構成で各環境専用のサイトを作成し、liveチャンネルにデプロイすることで固定URLを実現：
```
https://{project-id}-{env}.web.app
```

これにより：
- ✅ OAuth認証の承認済みドメインを事前に設定可能
- ✅ SSO認証（Googleログイン等）が正常に動作
- ✅ チームメンバーへのURL共有が容易
- ✅ ブックマークや外部サービス連携が安定

## 関連ファイル

- `firebase.json` - Firebase Hostingマルチサイト設定
- `.firebaserc` - ターゲット設定
- `.github/workflows/deploy-staging.yml` - Stagingデプロイワークフロー
- `.github/workflows/deploy-development.yml` - Developmentデプロイワークフロー
- `.github/workflows/deploy-production.yml` - Productionデプロイワークフロー
- `docs/FIREBASE_SETUP.md` - Firebase全般のセットアップガイド

## 参考リンク

- [Firebase Hosting Multi-site Setup](https://firebase.google.com/docs/hosting/multisites)
- [Firebase Hosting Deploy Targets](https://firebase.google.com/docs/hosting/multisites#set_up_deploy_targets)
- [Firebase Authentication Authorized Domains](https://firebase.google.com/docs/auth/web/google-signin#handling_the_sign-in_flow_manually)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
