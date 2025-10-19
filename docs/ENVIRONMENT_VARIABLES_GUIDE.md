# 環境変数の完全ガイド

## 🔍 重要：環境変数の仕組み

このプロジェクトでは、環境変数が**3つの異なる場所**で使用されます。それぞれで**異なる命名規則**を使用するため、混乱しやすいです。

## 📋 環境変数の全体像

### 1️⃣ ローカル開発環境（`.env.local`）

**ファイル名**: `.env.local`  
**プレフィックス**: `VITE_` **必須**

```bash
# .env.local の内容
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_APP_ENV=development
```

**理由**: Viteは `VITE_` プレフィックスが付いた環境変数のみをブラウザに公開します。

---

### 2️⃣ GitHub Secrets（CI/CD）

**場所**: GitHub Repository Settings → Secrets and variables → Actions  
**プレフィックス**: **なし**（シンプルな名前）

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

**理由**: GitHub Secretsの名前はシンプルに保ち、ワークフロー内で `VITE_` を付けます。

---

### 3️⃣ ソースコード（TypeScript/JavaScript）

**ファイル**: `src/lib/firebase.ts`  
**アクセス方法**: `import.meta.env.VITE_*`

```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

**理由**: Viteの仕様により、`import.meta.env.VITE_*` でアクセスします。

---

## 🔄 データフロー

### ローカル開発時

```
.env.local (VITE_*)
    ↓
src/lib/firebase.ts (import.meta.env.VITE_*)
    ↓
Firebase SDK
```

### GitHub Actions デプロイ時

```
GitHub Secrets (FIREBASE_*)
    ↓
GitHub Actions Workflow (VITE_FIREBASE_* に変換)
    ↓
npm run build (環境変数として注入)
    ↓
src/lib/firebase.ts (import.meta.env.VITE_*)
    ↓
ビルドされた dist/
```

---

## 📝 設定手順

### ステップ1: ローカル開発環境の設定

1. プロジェクトルートに `.env.local` を作成:

```bash
cp .env.example .env.local
```

2. Firebase Console から取得した値を入力:

```bash
VITE_FIREBASE_API_KEY=AIzaSy... # ← Firebase Console からコピー
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc
VITE_APP_ENV=development
```

3. 開発サーバーを起動:

```bash
npm run dev
```

**注意**: `VITE_` プレフィックスは**必須**です！

---

### ステップ2: GitHub Secrets の設定

GitHub Repository → Settings → Secrets and variables → Actions で以下を追加:

| GitHub Secret 名 | 値の取得元 |
|-----------------|----------|
| `FIREBASE_API_KEY` | `.env.local` の `VITE_FIREBASE_API_KEY` の値 |
| `FIREBASE_AUTH_DOMAIN` | `.env.local` の `VITE_FIREBASE_AUTH_DOMAIN` の値 |
| `FIREBASE_PROJECT_ID` | `.env.local` の `VITE_FIREBASE_PROJECT_ID` の値 |
| `FIREBASE_STORAGE_BUCKET` | `.env.local` の `VITE_FIREBASE_STORAGE_BUCKET` の値 |
| `FIREBASE_MESSAGING_SENDER_ID` | `.env.local` の `VITE_FIREBASE_MESSAGING_SENDER_ID` の値 |
| `FIREBASE_APP_ID` | `.env.local` の `VITE_FIREBASE_APP_ID` の値 |
| `FIREBASE_TOKEN` | `firebase login:ci` で取得 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → サービスアカウント |

**重要**: GitHub Secretsには `VITE_` プレフィックスを**付けません**！

---

## 🔧 GitHub Actions ワークフローの仕組み

`.github/workflows/firebase-hosting-deploy.yml` では、以下のように変換します:

```yaml
env:
  # GitHub Secrets (VITE_なし) → 環境変数 (VITE_付き)
  VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
  VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
  VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
  VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
```

これにより、ビルド時に `import.meta.env.VITE_*` が正しく動作します。

---

## ✅ 検証方法

### ローカル環境

```bash
# 開発サーバー起動
npm run dev

# ブラウザのコンソールで確認
# "Firebase initialized successfully" が表示されればOK
```

### GitHub Actions

```bash
# コミット＆プッシュ
git push origin main

# GitHub Actions タブで確認
# ワークフローが成功すればOK
```

---

## ❌ よくある間違い

### 間違い1: GitHub Secretsに `VITE_` を付ける

**NG**:
```
✗ VITE_FIREBASE_API_KEY  ← 間違い
✗ VITE_FIREBASE_PROJECT_ID  ← 間違い
```

**OK**:
```
✓ FIREBASE_API_KEY  ← 正しい
✓ FIREBASE_PROJECT_ID  ← 正しい
```

### 間違い2: `.env.local` で `VITE_` を付けない

**NG**:
```bash
# .env.local
FIREBASE_API_KEY=xxx  ← 間違い（動作しない）
```

**OK**:
```bash
# .env.local
VITE_FIREBASE_API_KEY=xxx  ← 正しい
```

### 間違い3: ソースコードで `process.env` を使う

**NG**:
```typescript
// src/lib/firebase.ts
apiKey: process.env.VITE_FIREBASE_API_KEY  ← 間違い
```

**OK**:
```typescript
// src/lib/firebase.ts
apiKey: import.meta.env.VITE_FIREBASE_API_KEY  ← 正しい
```

---

## 📊 クイックリファレンス表

| 場所 | 変数名の形式 | 例 |
|------|------------|-----|
| `.env.local` | `VITE_*` | `VITE_FIREBASE_API_KEY` |
| GitHub Secrets | `FIREBASE_*` | `FIREBASE_API_KEY` |
| ソースコード | `import.meta.env.VITE_*` | `import.meta.env.VITE_FIREBASE_API_KEY` |
| GitHub Actions | `VITE_*: ${{ secrets.FIREBASE_* }}` | `VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}` |

---

## 🆘 トラブルシューティング

### エラー: "Firebase is not enabled"

**原因**: 環境変数が読み込まれていない

**確認項目**:
1. `.env.local` ファイルが存在するか
2. 変数名が `VITE_FIREBASE_*` になっているか（`VITE_` 必須）
3. 開発サーバーを再起動したか

### GitHub Actionsでビルドエラー

**原因**: GitHub Secretsが設定されていない、または名前が間違っている

**確認項目**:
1. GitHub Secretsが8つすべて登録されているか
2. Secret名が `FIREBASE_*` になっているか（`VITE_` なし）
3. ワークフローファイルで `VITE_*: ${{ secrets.FIREBASE_* }}` と変換しているか

---

## 🔒 セキュリティ注意事項

1. **`.env.local` は Git にコミットしない**
   - `.gitignore` に含まれています
   - 絶対にコミットしないでください

2. **API キーは公開されても問題ない**
   - Firebase Web API キーは公開情報です
   - Security Rules でアクセス制御します

3. **`FIREBASE_TOKEN` と `FIREBASE_SERVICE_ACCOUNT` は秘密**
   - これらは絶対に公開しないでください
   - GitHub Secretsでのみ管理します

---

## 📚 参考資料

- [Vite 環境変数とモード](https://ja.vitejs.dev/guide/env-and-mode.html)
- [GitHub Encrypted Secrets](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
- [Firebase 環境設定](https://firebase.google.com/docs/web/setup)

---

## ✅ チェックリスト

設定が完了したら、以下を確認してください:

- [ ] `.env.local` が存在し、`VITE_*` で始まる変数が設定されている
- [ ] GitHub Secretsが8つすべて登録されている（`FIREBASE_*` 形式）
- [ ] ローカルで `npm run dev` が動作する
- [ ] GitHub Actions でビルドが成功する
- [ ] デプロイされたアプリが動作する

すべてチェックできたら完了です！ 🎉
