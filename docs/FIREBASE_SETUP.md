# Firebase セットアップガイド

## 必要な環境変数

`.env.local` ファイルに以下の環境変数を設定する必要があります。

## 環境変数一覧

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Environment
VITE_APP_ENV=development
```

## Firebase Console から情報を取得する方法

### ステップ1: Firebase プロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `iwailist-web`）
4. Google Analytics は任意で有効化
5. 「プロジェクトを作成」をクリック

### ステップ2: Web アプリを追加

1. Firebase Console でプロジェクトを開く
2. プロジェクト概要の横にある⚙️（歯車アイコン）→「プロジェクトの設定」をクリック
3. 下にスクロールして「マイアプリ」セクションを見つける
4. 「</>」（Web）アイコンをクリック
5. アプリのニックネームを入力（例: `iwailist-web`）
6. 「Firebase Hosting も設定する」はチェックしてもしなくてもOK
7. 「アプリを登録」をクリック

### ステップ3: 設定情報をコピー

登録が完了すると、以下のようなコードが表示されます:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

この情報を使って `.env.local` を作成します。

### ステップ4: .env.local ファイルを作成

プロジェクトルートに `.env.local` ファイルを作成し、以下のように入力します:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Environment
VITE_APP_ENV=development
```

## 各環境変数の説明

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_FIREBASE_API_KEY` | Firebase API キー（公開されても問題ない） | `AIzaSyXXXXX...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | 認証用ドメイン | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | プロジェクトID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storageバケット名 | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | メッセージング送信者ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | アプリID | `1:123456789012:web:xxx` |
| `VITE_APP_ENV` | 環境名（開発/本番） | `development` または `production` |

## 設定後の確認

### ステップ5: Firebase Authentication を有効化

1. Firebase Console で「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 以下を有効化:
   - **メール/パスワード**: 「有効にする」をオンにして保存
   - **Google**: 「有効にする」をオンにし、プロジェクトのサポートメールを設定して保存

5. **重要**: 承認済みドメインの設定
   - 「Settings」タブ（または「設定」タブ）を開く
   - 「承認済みドメイン」セクションを確認
   - 以下のドメインが追加されていることを確認:
     - `localhost` （ローカル開発用）
     - あなたのFirebase Hostingドメイン（例: `your-project.web.app`）
     - あなたのカスタムドメイン（設定している場合）
   - 追加が必要な場合は「ドメインを追加」をクリックして登録

### ステップ6: Firestore Database を作成

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. **本番モード**で開始（Security Rulesは後でデプロイ）
4. ロケーションを選択（推奨: `asia-northeast1` - 東京）
5. 「有効にする」をクリック

### ステップ7: Cloud Storage を有効化

1. Firebase Console で「Storage」を選択
2. 「始める」をクリック
3. デフォルトのセキュリティルールで開始
4. ロケーションを選択（Firestoreと同じ推奨）
5. 「完了」をクリック

## テスト実行

環境変数が正しく設定されているか確認:

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
# コンソールに "Firebase initialized successfully" が表示されればOK
```

## トラブルシューティング

### エラー: "Firebase is not enabled"

**原因**: 環境変数が読み込まれていない

**解決方法**:
1. `.env.local` ファイルがプロジェクトルートに存在するか確認
2. ファイル名が正確に `.env.local` か確認（`.env` ではない）
3. 開発サーバーを再起動: `npm run dev`

### エラー: "Firebase: Error (auth/invalid-api-key)"

**原因**: API キーが間違っている

**解決方法**:
1. Firebase Console で正しいAPI キーをコピー
2. `.env.local` の `VITE_FIREBASE_API_KEY` を更新
3. 開発サーバーを再起動

### エラー: "Firebase: Error (auth/project-not-found)"

**原因**: プロジェクトIDが間違っている

**解決方法**:
1. Firebase Console でプロジェクトIDを確認
2. `.env.local` の `VITE_FIREBASE_PROJECT_ID` を更新
3. 開発サーバーを再起動

### エラー: "このドメインは認証が許可されていません" / "auth/unauthorized-domain"

**原因**: 現在のドメインがFirebaseの承認済みドメインに登録されていない

**解決方法**:
1. Firebase Console → Authentication → Settings タブを開く
2. 「承認済みドメイン」セクションを確認
3. 使用しているドメイン（`localhost`、`your-project.web.app` など）が含まれているか確認
4. 含まれていない場合は「ドメインを追加」で登録
5. ページをリロードして再試行

### エラー: "ポップアップがブロックされました" / "auth/popup-blocked"

**原因**: ブラウザがポップアップをブロックしている

**解決方法**:
1. ブラウザのアドレスバー右側のポップアップブロックアイコンをクリック
2. このサイトのポップアップを常に許可する
3. ページをリロードして再試行
4. または、アプリが自動的にリダイレクト方式にフォールバックします

### エラー: "ログインがキャンセルされました" / "auth/popup-closed-by-user"

**原因**: ユーザーがログインポップアップを閉じた

**解決方法**:
- 再度「Googleでログイン」ボタンをクリックして、ログイン手続きを完了してください

## セキュリティに関する注意

### ⚠️ 重要な注意事項

1. **`.env.local` は Git にコミットしない**
   - `.gitignore` に既に含まれています
   - 絶対にコミットしないでください

2. **API キーは公開されても問題ない**
   - Firebase の Web API キーは公開情報です
   - Security Rules でアクセス制御を行います

3. **本番環境では環境変数を別管理**
   - 本番環境: `.env.production`
   - ステージング: `.env.staging`
   - 開発環境: `.env.local`

## 次のステップ

環境変数の設定が完了したら:

1. ✅ 開発サーバーを起動: `npm run dev`
2. ✅ ログイン機能をテスト
3. ✅ データ同期をテスト
4. ✅ Security Rules をデプロイ: `firebase deploy --only firestore:rules,storage`

詳細なデプロイ手順は `PHASE3_DEPLOYMENT_GUIDE.md` を参照してください。

## 参考リンク

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite 環境変数](https://vitejs.dev/guide/env-and-mode.html)
