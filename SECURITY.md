# セキュリティガイドライン

## 概要

このドキュメントは、Iwailist Webアプリケーションのセキュリティに関する重要な情報とガイドラインを提供します。

## 🚨 重要な注意事項

**このリポジトリはpublicです。機密情報を絶対にコミットしないでください。**

## 禁止事項

### コード内での禁止
以下のような機密情報のハードコーディングは絶対に禁止です：

```typescript
// ❌ 絶対に禁止
const API_KEY = "sk-1234567890abcdef";
const DB_PASSWORD = "mypassword123";
const JWT_SECRET = "secretkey";
const PRIVATE_URL = "https://internal-api.company.com";

// ✅ 推奨
const API_KEY = import.meta.env.VITE_API_KEY;
const DB_PASSWORD = import.meta.env.VITE_DB_PASSWORD;
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
const PRIVATE_URL = import.meta.env.VITE_API_URL;
```

### ファイル内での禁止
以下のファイルや内容は絶対にコミットしてはいけません：

- `.env` ファイル（環境変数）
- `.env.local` ファイル（ローカル環境変数）
- `.env.production` ファイル（本番環境変数）
- 設定ファイル内の機密情報
- ログファイル内の個人情報
- テストデータ内の実在する個人情報
- データベースダンプファイル
- 証明書ファイル（.pem, .key, .crt等）

## 推奨される実装方法

### 環境変数の使用
```typescript
// 環境変数の定義例
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiKey: import.meta.env.VITE_API_KEY,
  debug: import.meta.env.DEV,
};
```

### .env.example ファイルの作成
```bash
# .env.example
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your_api_key_here
VITE_DATABASE_URL=your_database_url_here
```

### 設定の外部化
```typescript
// config/app.ts
export const appConfig = {
  name: 'Iwailist',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL,
  features: {
    pwa: true,
    offline: true,
  },
};
```

## .gitignore の重要性

現在の `.gitignore` ファイルには以下の重要な設定が含まれています：

```gitignore
# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Logs
logs
*.log
```

これらの設定により、機密情報を含むファイルが誤ってコミットされることを防いでいます。

## コミット前のチェックリスト

コミットする前に、以下を必ず確認してください：

### コードレビュー
- [ ] 機密情報がハードコーディングされていない
- [ ] 環境変数が適切に使用されている
- [ ] デバッグコードが削除されている
- [ ] 個人情報が含まれていない
- [ ] 本番用の設定値が露出していない

### ファイルチェック
- [ ] `.env` ファイルがコミット対象に含まれていない
- [ ] ログファイルがコミット対象に含まれていない
- [ ] 設定ファイルに機密情報が含まれていない
- [ ] テストデータに実在する個人情報が含まれていない

### 検索コマンド
以下のコマンドで機密情報を検索できます：

```bash
# APIキーやトークンの検索
grep -r "sk-\|pk-\|token\|secret\|password" src/ --exclude-dir=node_modules

# 環境変数の検索
grep -r "process\.env\|import\.meta\.env" src/

# ハードコードされたURLの検索
grep -r "https://\|http://" src/ --exclude-dir=node_modules
```

## 緊急時の対応

万が一機密情報がコミットされた場合：

1. **即座にコミット履歴から削除**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

2. **影響範囲の特定**
   - どのファイルに機密情報が含まれているか
   - どのコミットで追加されたか
   - 誰がアクセス可能か

3. **シークレットの再生成**
   - 露出したシークレットを無効化
   - 新しいシークレットを生成
   - 関連するサービスで更新

4. **チームへの報告**
   - セキュリティインシデントとして報告
   - 影響範囲と対応策を共有

## セキュリティベストプラクティス

### 開発時
- ローカル環境では `.env.local` を使用
- 本番環境では環境変数で設定を注入
- 定期的にセキュリティチェックを実施
- コードレビューでセキュリティを重視

### デプロイ時
- 本番ビルド前にデバッグコードを削除
- 環境変数の適切な設定
- セキュリティヘッダーの設定
- HTTPSの強制

### 監視
- 定期的な依存関係の更新
- セキュリティ脆弱性のチェック
- ログの監視
- 異常なアクセスの検知

## 連絡先

セキュリティに関する問題や質問がある場合は、以下の方法で連絡してください：

- セキュリティインシデント: 即座に報告
- 一般的な質問: Issue を作成
- 緊急時: 直接連絡

---

**重要**: セキュリティは全員の責任です。疑わしい場合は、コミットを控えて確認してください。
