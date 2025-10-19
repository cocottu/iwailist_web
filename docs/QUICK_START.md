# クイックスタートガイド

## 🚀 5分でセットアップ

### 前提条件

- Node.js 20.19+ または 22.12.0+
- npm
- Firebaseプロジェクト（作成済み）
- GitHubリポジトリ

---

## ステップ1: ローカル環境のセットアップ

### 1. リポジトリをクローン

```bash
git clone <your-repository-url>
cd iwailist_web
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

```bash
# .env.example をコピー
cp .env.example .env.local
```

### 4. Firebase設定を入力

`.env.local` を開いて、Firebase Consoleから取得した値を入力:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...  # ← ここに実際の値を入力
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc
VITE_APP_ENV=development
```

**取得方法**:
1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトの設定 → マイアプリ → Webアプリ
3. 設定情報をコピー

### 5. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセス

**✅ 成功の確認**: ブラウザのコンソールに "Firebase initialized successfully" が表示される

---

## ステップ2: GitHub Actions のセットアップ

### 1. Firebase CI トークンを取得

```bash
firebase login
firebase login:ci
```

表示されたトークンをコピー

### 2. Firebase サービスアカウント鍵を取得

1. Firebase Console → プロジェクトの設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードされたJSONファイルを開く
4. **内容全体**をコピー

### 3. GitHub Secrets を追加

GitHub Repository → Settings → Secrets and variables → Actions

以下の**8つ**のシークレットを追加:

| Secret名 | 値 |
|---------|-----|
| `FIREBASE_API_KEY` | `.env.local` の `VITE_FIREBASE_API_KEY` から `VITE_` を除いた値 |
| `FIREBASE_AUTH_DOMAIN` | `.env.local` の `VITE_FIREBASE_AUTH_DOMAIN` から `VITE_` を除いた値 |
| `FIREBASE_PROJECT_ID` | `.env.local` の `VITE_FIREBASE_PROJECT_ID` から `VITE_` を除いた値 |
| `FIREBASE_STORAGE_BUCKET` | `.env.local` の `VITE_FIREBASE_STORAGE_BUCKET` から `VITE_` を除いた値 |
| `FIREBASE_MESSAGING_SENDER_ID` | `.env.local` の `VITE_FIREBASE_MESSAGING_SENDER_ID` から `VITE_` を除いた値 |
| `FIREBASE_APP_ID` | `.env.local` の `VITE_FIREBASE_APP_ID` から `VITE_` を除いた値 |
| `FIREBASE_TOKEN` | `firebase login:ci` で取得したトークン |
| `FIREBASE_SERVICE_ACCOUNT` | ダウンロードしたJSONファイルの内容全体 |

**重要**: GitHub Secretsには `VITE_` プレフィックスを**付けません**

### 4. .firebaserc を更新

```bash
# .firebaserc を開いて、your-project-id を実際のプロジェクトIDに変更
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 5. デプロイ

```bash
git add .
git commit -m "Setup Firebase deployment"
git push origin main
```

GitHub → Actions タブでデプロイ状況を確認

---

## ✅ 完了チェック

すべて完了したら、以下を確認:

- [ ] ローカルで `npm run dev` が動作する
- [ ] Firebase Console でプロジェクトが作成されている
- [ ] Authentication と Firestore が有効化されている
- [ ] GitHub Secretsが8つすべて設定されている
- [ ] GitHub Actions のワークフローが成功している
- [ ] デプロイされたアプリが動作する

---

## 🆘 うまくいかない場合

### ローカルで動かない

1. `.env.local` の変数名が `VITE_*` で始まっているか確認
2. 開発サーバーを再起動: `npm run dev`
3. ブラウザのコンソールでエラーを確認

### GitHub Actions が失敗する

1. GitHub Secretsが8つすべて設定されているか確認
2. Secret名が `FIREBASE_*` になっているか確認（`VITE_` なし）
3. Actions タブでエラーログを確認

### 詳細なトラブルシューティング

- `docs/ENVIRONMENT_VARIABLES_GUIDE.md` を参照
- `docs/GITHUB_ACTIONS_SETUP.md` を参照
- `docs/FIREBASE_SETUP.md` を参照

---

## 📚 次のステップ

1. **機能を理解する**: README.md を読む
2. **カスタマイズする**: ソースコードを編集
3. **テストを書く**: `src/test/` を参照
4. **デプロイする**: `git push origin main`

お疲れ様でした！ 🎉
