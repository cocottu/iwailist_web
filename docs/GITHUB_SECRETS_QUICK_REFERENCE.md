# GitHub Secrets クイックリファレンス

## 必要なシークレット一覧

GitHub リポジトリの **Settings → Secrets and variables → Actions** で以下の**8つ**のシークレットを追加してください。

### ✅ チェックリスト

- [ ] `FIREBASE_API_KEY`
- [ ] `FIREBASE_AUTH_DOMAIN`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_STORAGE_BUCKET`
- [ ] `FIREBASE_MESSAGING_SENDER_ID`
- [ ] `FIREBASE_APP_ID`
- [ ] `FIREBASE_TOKEN`
- [ ] `FIREBASE_SERVICE_ACCOUNT`

---

## 📋 各シークレットの取得方法

### 1-6: Firebase環境変数（プロジェクト設定から取得）

#### 取得手順

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. ⚙️（歯車アイコン）→ **プロジェクトの設定** をクリック
4. 下にスクロールして「マイアプリ」セクションを見つける
5. Webアプリ（`</>`）を選択
6. 以下の情報をコピー:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // → FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",      // → FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",  // → FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012", // → FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abc"    // → FIREBASE_APP_ID
};
```

#### GitHub Secretsに追加

| シークレット名 | 値の例 |
|---------------|--------|
| `FIREBASE_API_KEY` | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` |

---

### 7: FIREBASE_TOKEN（CI用トークン）

#### 取得手順

ターミナルで以下のコマンドを実行:

```bash
# Firebase CLIにログイン
firebase login

# CI用トークンを生成
firebase login:ci
```

#### 出力例
```
✔  Success! Use this token to login on a CI server:

1//0abcdefghijklmnopqrstuvwxyz1234567890

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

#### GitHub Secretsに追加

| シークレット名 | 値 |
|---------------|-----|
| `FIREBASE_TOKEN` | `1//0abcdefghijklmnopqrstuvwxyz1234567890` |

**注意**: トークン全体をコピーしてください

---

### 8: FIREBASE_SERVICE_ACCOUNT（サービスアカウント鍵）

#### 取得手順

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. ⚙️ → **プロジェクトの設定** → **サービスアカウント** タブ
4. 「**新しい秘密鍵の生成**」ボタンをクリック
5. 確認ダイアログで「**鍵を生成**」をクリック
6. JSONファイルがダウンロードされます

#### JSONファイルの内容例
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

#### GitHub Secretsに追加

| シークレット名 | 値 |
|---------------|-----|
| `FIREBASE_SERVICE_ACCOUNT` | **JSONファイルの内容全体**をそのままコピー（改行含む） |

**重要**: 
- JSONファイル全体をコピーしてください
- 改行も含めて、そのまま貼り付けます
- `{` から `}` まで全部コピーしてください

---

## 🔍 設定確認

### 1. GitHub Secretsページで確認

**Settings → Secrets and variables → Actions** を開いて、以下の8つすべてが表示されているか確認:

```
✓ FIREBASE_API_KEY
✓ FIREBASE_AUTH_DOMAIN  
✓ FIREBASE_PROJECT_ID
✓ FIREBASE_STORAGE_BUCKET
✓ FIREBASE_MESSAGING_SENDER_ID
✓ FIREBASE_APP_ID
✓ FIREBASE_TOKEN
✓ FIREBASE_SERVICE_ACCOUNT
```

### 2. ワークフローで確認

コミット＆プッシュ後、**Actions**タブでワークフローが正常に実行されているか確認してください。

---

## ⚠️ よくあるエラーと解決方法

### エラー: "Firebase token is invalid"

**原因**: `FIREBASE_TOKEN` が無効または期限切れ

**解決**: 
```bash
firebase login:ci
# 新しいトークンを生成してシークレットを更新
```

### エラー: "Service account key is invalid"

**原因**: `FIREBASE_SERVICE_ACCOUNT` のJSON形式が正しくない

**解決**:
1. JSONファイルを再ダウンロード
2. ファイルをテキストエディタで開く
3. 内容全体をコピー（`{` から `}` まで）
4. GitHub Secretsを更新

### エラー: "Project not found"

**原因**: `FIREBASE_PROJECT_ID` が間違っている

**解決**:
1. Firebase Console でプロジェクトIDを確認
2. GitHub Secretsの `FIREBASE_PROJECT_ID` を更新

### エラー: "Invalid API key"

**原因**: `FIREBASE_API_KEY` が間違っている

**解決**:
1. Firebase Console → プロジェクト設定で正しいAPI キーをコピー
2. GitHub Secretsの `FIREBASE_API_KEY` を更新

---

## 🔒 セキュリティに関する注意

1. **シークレットは絶対にコードにコミットしない**
2. **GitHub Secretsは暗号化されて保存される**
3. **API キーは公開されても問題ない**（Firebase Web API キーは公開情報）
4. **FIREBASE_TOKEN と FIREBASE_SERVICE_ACCOUNT は秘密情報**
5. **定期的にトークンを更新**（3-6ヶ月ごと推奨）

---

## 📚 参考リンク

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Firebase CI/CD](https://firebase.google.com/docs/cli#cli-ci-systems)

---

## ✅ 次のステップ

すべてのシークレットを追加したら:

1. コミット＆プッシュ: `git push origin main`
2. GitHub Actions タブで実行確認
3. デプロイが成功したらFirebase Hosting URLにアクセス

お疲れ様でした！ 🎉
