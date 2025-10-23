# Googleログイン機能の改善

## 実施した修正内容

### 1. エラーハンドリングの強化

#### 追加したエラーコード（`src/types/firebase.ts`）
Googleログイン特有のエラーコードを追加しました：
- `auth/popup-closed-by-user` - ユーザーがポップアップを閉じた
- `auth/popup-blocked` - ポップアップがブロックされた
- `auth/unauthorized-domain` - 承認されていないドメインからのアクセス
- `auth/cancelled-popup-request` - ログインリクエストがキャンセルされた
- `auth/account-exists-with-different-credential` - 別の認証方法で登録済み

#### エラーメッセージの改善（`src/services/authService.ts`）
各エラーコードに対して、分かりやすい日本語のエラーメッセージを追加しました。
未処理のエラーについては、エラーコードをコンソールに出力してデバッグを容易にしました。

### 2. ポップアップブロック対策

#### リダイレクト方式へのフォールバック
ポップアップがブロックされた場合、自動的にリダイレクト方式にフォールバックする機能を追加しました：

```typescript
try {
  result = await signInWithPopup(auth, provider);
} catch (popupError) {
  if (popupError.code === 'auth/popup-blocked') {
    await signInWithRedirect(auth, provider);
  }
}
```

#### リダイレクト結果の処理
`handleRedirectResult()` メソッドを追加し、リダイレクト後の認証結果を適切に処理します。
`AuthContext` でアプリ起動時に自動的にリダイレクト結果を確認します。

### 3. 詳細なログ出力

開発時のデバッグを容易にするため、以下のログを追加：
- Googleログイン処理の開始/終了
- ポップアップ/リダイレクトの切り替え
- Firestoreへのユーザープロファイル作成状況
- エラー発生時の詳細情報

### 4. Firebase設定診断機能

#### 設定状態の可視化（`src/lib/firebase.ts`）
`getFirebaseConfigStatus()` 関数を追加し、環境変数の設定状態を確認できるようにしました：

```typescript
const status = getFirebaseConfigStatus();
// コンソールに設定状態をテーブル形式で出力
// 不足している環境変数のリストを返却
```

#### ログインページでの診断情報表示（`src/pages/Login.tsx`）
開発環境では、Firebaseが無効な場合に診断情報を表示するUIを追加しました：
- 環境変数の設定状態を一目で確認可能
- 不足している環境変数をリスト表示
- デバッグ情報の表示/非表示を切り替え可能

### 5. ドキュメントの改善

#### `docs/FIREBASE_SETUP.md`
以下のセクションを追加・更新しました：
- 承認済みドメインの設定方法
- Googleログイン関連のエラーとその解決方法：
  - `auth/unauthorized-domain` - 承認済みドメインの設定が必要
  - `auth/popup-blocked` - ポップアップの許可が必要
  - `auth/popup-closed-by-user` - ログイン手続きの再試行方法

## よくある問題と解決方法

### 問題1: "このドメインは認証が許可されていません"

**原因**: Firebase Consoleで承認済みドメインが設定されていない

**解決方法**:
1. Firebase Console → Authentication → Settings タブ
2. 「承認済みドメイン」セクションで以下を確認:
   - `localhost` （ローカル開発用）
   - あなたのFirebase Hostingドメイン
   - カスタムドメイン（設定している場合）
3. 不足している場合は「ドメインを追加」で登録

### 問題2: "ポップアップがブロックされました"

**原因**: ブラウザがポップアップをブロックしている

**解決方法**:
- ブラウザのポップアップブロック設定を確認
- このサイトのポップアップを許可
- または、アプリが自動的にリダイレクト方式にフォールバックします

### 問題3: "Firebase is not enabled"

**原因**: 環境変数が設定されていない

**解決方法**:
1. `.env.local` ファイルがプロジェクトルートに存在するか確認
2. すべての `VITE_FIREBASE_*` 環境変数が設定されているか確認
3. 開発サーバーを再起動
4. ログインページで「デバッグ情報を表示」をクリックして設定状態を確認

## テスト方法

### ローカル環境でのテスト

1. 環境変数を設定:
```bash
cp .env.example .env.local
# .env.local を編集してFirebase設定を入力
```

2. 開発サーバーを起動:
```bash
npm run dev
```

3. ブラウザで http://localhost:5173/login にアクセス

4. 「Googleでログイン」ボタンをクリック

5. ブラウザのコンソールで以下のログを確認:
   - "Starting Google sign-in process..."
   - "Popup sign-in successful" または "Popup blocked, falling back to redirect method"
   - "Creating/checking user profile in Firestore..."
   - "Google sign-in completed successfully"

### エラー時の確認方法

1. ブラウザのコンソールを開く（F12キー）
2. エラーメッセージとエラーコードを確認
3. `docs/FIREBASE_SETUP.md` のトラブルシューティングセクションを参照

## 変更されたファイル一覧

- `src/types/firebase.ts` - エラーコードの追加
- `src/services/authService.ts` - エラーハンドリングとリダイレクト対応
- `src/contexts/AuthContext.tsx` - リダイレクト結果の処理
- `src/lib/firebase.ts` - 診断機能の追加
- `src/pages/Login.tsx` - 診断情報表示UIの追加
- `src/pages/SignUp.tsx` - ログ出力の追加
- `docs/FIREBASE_SETUP.md` - ドキュメントの更新

## 今後の推奨事項

1. **E2Eテストの追加**: Playwrightを使ったGoogleログインのE2Eテストを追加
2. **エラートラッキング**: Sentryなどのエラー追跡ツールと統合
3. **ログイン試行回数の制限**: セキュリティ強化のため、ログイン試行回数を制限
4. **多要素認証**: より高いセキュリティが必要な場合、多要素認証の追加を検討

## 参考資料

- [Firebase Authentication エラーコード](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
- [Firebase Console - 承認済みドメイン](https://console.firebase.google.com/)
- [Vite 環境変数](https://ja.vitejs.dev/guide/env-and-mode.html)
