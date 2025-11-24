# GitHub Secrets セットアップガイド

マルチ環境対応のために、GitHub Secretsに環境ごとの設定値を登録する必要があります。

## 1. GitHub Secrets へのアクセス

1. GitHubリポジトリを開く
2. **Settings** → **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック

## 2. 開発環境用シークレット

以下のシークレットを追加します。値は Firebase Console の「プロジェクトの設定」から取得してください。

| シークレット名 | 説明 | 取得方法 |
|--------------|------|---------|
| `DEV_FIREBASE_API_KEY` | 開発環境のAPIキー | Firebase Console → cocottu-iwailist-dev → プロジェクトの設定 |
| `DEV_FIREBASE_AUTH_DOMAIN` | 開発環境の認証ドメイン | 同上（`xxx-dev.firebaseapp.com`） |
| `DEV_FIREBASE_PROJECT_ID` | 開発環境のプロジェクトID | `cocottu-iwailist-dev` |
| `DEV_FIREBASE_STORAGE_BUCKET` | 開発環境のStorageバケット | 同上（`xxx-dev.appspot.com`） |
| `DEV_FIREBASE_MESSAGING_SENDER_ID` | 開発環境のMessaging Sender ID | 同上 |
| `DEV_FIREBASE_APP_ID` | 開発環境のApp ID | 同上 |
| `DEV_FIREBASE_SERVICE_ACCOUNT` | 開発環境のサービスアカウントJSON | 後述 |
| `DEV_FIREBASE_TOKEN` | 開発環境のCIトークン（オプション） | `firebase login:ci` で取得 |
| `DEV_BASIC_AUTH_ENABLED` | Basic Authを有効にするか | `true` または `false` |
| `DEV_BASIC_AUTH_USERNAME` | Basic Auth ユーザー名 | 任意のユーザー名 |
| `DEV_BASIC_AUTH_PASSWORD` | Basic Auth パスワード | 任意のパスワード |
| `DEV_BASIC_AUTH_REALM` | Basic Auth 領域名 | 例: `Iwailist Dev` |

### サービスアカウントJSONの取得方法

1. [Firebase Console](https://console.firebase.google.com/) で開発環境プロジェクトを開く
2. ⚙️ → **プロジェクトの設定** → **サービスアカウント**
3. **新しい秘密鍵の生成** をクリック
4. ダウンロードされたJSONファイルの内容を**すべて**コピー
5. GitHubの `DEV_FIREBASE_SERVICE_ACCOUNT` シークレットに貼り付け

**重要**: JSONファイル全体をそのまま貼り付けてください（改行を含む）

```json
{
  "type": "service_account",
  "project_id": "cocottu-iwailist-dev",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## 3. ステージング環境用シークレット

開発環境と同様の手順で、ステージング環境用のシークレットを追加します。

| シークレット名 | 値 |
|--------------|---|
| `STAGING_FIREBASE_API_KEY` | ステージング環境のAPIキー |
| `STAGING_FIREBASE_AUTH_DOMAIN` | `cocottu-iwailist-staging.firebaseapp.com` |
| `STAGING_FIREBASE_PROJECT_ID` | `cocottu-iwailist-staging` |
| `STAGING_FIREBASE_STORAGE_BUCKET` | `cocottu-iwailist-staging.appspot.com` |
| `STAGING_FIREBASE_MESSAGING_SENDER_ID` | ステージング環境のMessaging Sender ID |
| `STAGING_FIREBASE_APP_ID` | ステージング環境のApp ID |
| `STAGING_FIREBASE_SERVICE_ACCOUNT` | ステージング環境のサービスアカウントJSON |
| `STAGING_FIREBASE_TOKEN` | ステージング環境のCIトークン（オプション） |
| `STAGING_BASIC_AUTH_ENABLED` | Basic Authを有効にするか |
| `STAGING_BASIC_AUTH_USERNAME` | Basic Auth ユーザー名 |
| `STAGING_BASIC_AUTH_PASSWORD` | Basic Auth パスワード |
| `STAGING_BASIC_AUTH_REALM` | Basic Auth 領域名 |

## 4. 本番環境用シークレット

既存のシークレットを確認・更新します。

| シークレット名 | 値 |
|--------------|---|
| `FIREBASE_API_KEY` | 本番環境のAPIキー |
| `FIREBASE_AUTH_DOMAIN` | `cocottu-iwailist.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `cocottu-iwailist` |
| `FIREBASE_STORAGE_BUCKET` | `cocottu-iwailist.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | 本番環境のMessaging Sender ID |
| `FIREBASE_APP_ID` | 本番環境のApp ID |
| `FIREBASE_SERVICE_ACCOUNT` | 本番環境のサービスアカウントJSON |
| `FIREBASE_TOKEN` | 本番環境のCIトークン |

## 5. 確認方法

すべてのシークレットを追加したら、GitHubの **Settings → Secrets and variables → Actions** で以下が表示されることを確認してください：

### 開発環境用（12個）
- DEV_FIREBASE_API_KEY
- DEV_FIREBASE_AUTH_DOMAIN
- DEV_FIREBASE_PROJECT_ID
- DEV_FIREBASE_STORAGE_BUCKET
- DEV_FIREBASE_MESSAGING_SENDER_ID
- DEV_FIREBASE_APP_ID
- DEV_FIREBASE_SERVICE_ACCOUNT
- DEV_FIREBASE_TOKEN（オプション）
- DEV_BASIC_AUTH_ENABLED
- DEV_BASIC_AUTH_USERNAME
- DEV_BASIC_AUTH_PASSWORD
- DEV_BASIC_AUTH_REALM

### ステージング環境用（12個）
- STAGING_FIREBASE_API_KEY
- STAGING_FIREBASE_AUTH_DOMAIN
- STAGING_FIREBASE_PROJECT_ID
- STAGING_FIREBASE_STORAGE_BUCKET
- STAGING_FIREBASE_MESSAGING_SENDER_ID
- STAGING_FIREBASE_APP_ID
- STAGING_FIREBASE_SERVICE_ACCOUNT
- STAGING_FIREBASE_TOKEN（オプション）
- STAGING_BASIC_AUTH_ENABLED
- STAGING_BASIC_AUTH_USERNAME
- STAGING_BASIC_AUTH_PASSWORD
- STAGING_BASIC_AUTH_REALM

### 本番環境用（8個）
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- FIREBASE_SERVICE_ACCOUNT
- FIREBASE_TOKEN

**合計: 32個のシークレット**

## 6. テスト

### 6.1 開発環境へのデプロイをテスト

1. `develop` ブランチを作成してプッシュ:
   ```bash
   git checkout -b develop
   git push origin develop
   ```

2. GitHub Actionsの **Actions** タブで「Deploy to Development」ワークフローが実行されることを確認

3. 成功したら、デプロイされたURLにアクセス

### 6.2 ステージング環境へのデプロイをテスト

1. `staging` ブランチを作成してプッシュ:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. GitHub Actionsの **Actions** タブで「Deploy to Staging」ワークフローが実行されることを確認

### 6.3 本番環境へのデプロイをテスト

1. `main` ブランチにマージ（PRを作成して承認）

2. GitHub Actionsの **Actions** タブで「Deploy to Production」ワークフローが実行されることを確認

## 7. トラブルシューティング

### エラー: "Secret not found"

**原因**: シークレット名が間違っている

**解決方法**:
1. GitHub Settings で シークレット名を確認
2. ワークフローファイル（`.github/workflows/*.yml`）のシークレット名と一致させる

### エラー: "Invalid service account"

**原因**: サービスアカウントJSONが正しくない

**解決方法**:
1. Firebase Console でサービスアカウントJSONを再生成
2. JSONファイル全体をコピー（改行を含む）
3. GitHubシークレットを更新

### エラー: "Firebase token is invalid"

**原因**: `FIREBASE_TOKEN` が無効または期限切れ

**解決方法**:
```bash
# 新しいトークンを生成
firebase login:ci

# 生成されたトークンをGitHubシークレットに登録
```

### エラー: "Build failed - Environment variables not set"

**原因**: 環境変数が設定されていない

**解決方法**:
1. GitHub Secrets が正しく設定されているか確認
2. ワークフローファイルの `env:` セクションを確認
3. シークレット名にスペースや誤字がないか確認

## 8. セキュリティのベストプラクティス

1. **シークレットは絶対にコードにコミットしない**
   - ログやコンソール出力にも表示しない
   - GitHub Actions内では自動的にマスクされる

2. **定期的なトークンの更新**
   - サービスアカウントキー: 年1回
   - CIトークン: 6ヶ月ごと

3. **最小権限の原則**
   - サービスアカウントには必要最小限の権限のみ付与
   - Firebase IAMで適切なロールを設定

4. **アクセスの監視**
   - Firebase Consoleで定期的にアクセスログを確認
   - 不審なアクティビティがないかチェック

## 9. 参考資料

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**作成日**: 2025-10-19  
**バージョン**: 1.0
