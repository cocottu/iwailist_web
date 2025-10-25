# Googleログイン「読み込み中」問題の修正

## 🔍 問題の詳細

**症状**: 「Googleでログイン」ボタンを押すと読み込み中のままログインが完了しない

**原因**:
1. **不要なエラーthrow**: `signInWithRedirect()`実行後に例外を投げていたため、エラーハンドリングが誤作動
2. **loading状態の管理不備**: リダイレクトから戻った後、loading状態が適切にリセットされない
3. **状態の同期問題**: `AuthContext`のloading状態と`Login`コンポーネントのloading状態が別々に管理されていた
4. **ナビゲーションの問題**: レンダリング中に`navigate()`を呼び出していた

## 🔧 実施した修正

### 1. authService.ts の修正

**変更内容**:
- `signInWithGoogle()`の戻り値の型を`Promise<User>`から`Promise<void>`に変更
- リダイレクト後の不要なエラーthrowを削除
- コメントを明確化

```typescript
// 修正前
async signInWithGoogle(): Promise<User> {
  // ...
  await signInWithRedirect(auth, provider);
  throw new Error('Redirecting to Google login...'); // ❌ 不要なエラー
}

// 修正後
async signInWithGoogle(): Promise<void> {
  // ...
  await signInWithRedirect(auth, provider);
  // この行には到達しない（リダイレクトされるため）
}
```

### 2. AuthContext.tsx の修正

**変更内容**:
- リダイレクト処理中フラグ（`isHandlingRedirect`）を追加
- `onAuthStateChanged`でリダイレクト処理中の状態更新をスキップ
- ログ出力を追加してデバッグ情報を明確化
- `signInWithGoogle()`のエラーハンドリングを簡素化

```typescript
// リダイレクト認証の結果を処理
let isHandlingRedirect = true;
authService.handleRedirectResult()
  .then((user) => {
    if (user) {
      console.log('Redirect authentication successful:', user);
      setUser(user);
    }
  })
  .finally(() => {
    isHandlingRedirect = false;
  });

// 認証状態の監視
const unsubscribe = onAuthStateChanged(
  auth,
  async (firebaseUser: FirebaseUser | null) => {
    // リダイレクト処理中は状態更新をスキップ
    if (isHandlingRedirect) {
      console.log('Skipping auth state update during redirect handling');
      return;
    }
    // ...
  }
);
```

### 3. Login.tsx の修正

**変更内容**:
- `handleGoogleLogin()`のロジックを簡素化
- 不要なリダイレクト検知処理を削除
- ログイン後のナビゲーションを`useEffect`で実装
- レンダリング中の`navigate()`呼び出しを削除

```typescript
// ログイン済みの場合はダッシュボードへ自動遷移
useEffect(() => {
  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to dashboard...');
    navigate('/');
  }
}, [isAuthenticated, navigate]);

const handleGoogleLogin = async () => {
  setError('');
  setLoading(true);

  try {
    console.log('Initiating Google login redirect...');
    await signInWithGoogle();
    // signInWithRedirect()はページをリダイレクトするため、この行には到達しない
  } catch (err) {
    console.error('Google login failed:', err);
    setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    setLoading(false);
  }
};
```

## 🚀 修正後の動作フロー

### 正常なGoogleログインフロー

1. **ユーザーが「Googleでログイン」ボタンをクリック**
   ```
   → handleGoogleLogin()が実行される
   → loading状態がtrueに設定される
   → 「Googleの認証ページに移動します...」というメッセージが表示される
   ```

2. **Googleの認証ページにリダイレクト**
   ```
   → signInWithRedirect()が実行される
   → ページがGoogleの認証ページに移動
   → ユーザーがGoogleアカウントを選択してログイン
   ```

3. **元のページに戻る**
   ```
   → Googleから元のページにリダイレクトされる
   → ページが再読み込みされる
   → AuthContextのuseEffectが実行される
   ```

4. **認証結果の処理**
   ```
   → handleRedirectResult()が呼ばれる
   → リダイレクト結果が正常に処理される
   → ユーザー情報がFirestoreに保存される（初回のみ）
   ```

5. **ログイン完了**
   ```
   → onAuthStateChanged()が呼ばれる
   → isAuthenticatedがtrueになる
   → useEffectでダッシュボードに自動遷移
   → loading状態がfalseに設定される
   ```

## 🎯 期待される動作

### ユーザーの視点から

1. **ログインページで「Googleでログイン」をクリック**
   - ボタンが読み込み中状態になる
   - 「Googleの認証ページに移動します...」というメッセージが表示される

2. **Googleの認証ページに移動**
   - 自動的にGoogleのログインページに移動
   - Googleアカウントを選択

3. **ログイン後、元のページに戻る**
   - 自動的に元のページに戻る
   - 読み込み表示が表示される

4. **ダッシュボードに自動遷移**
   - ログインが完了し、ダッシュボードに移動
   - ユーザー情報が表示される

### 開発者コンソールログ

```
Initiating Google login redirect...
Starting Google sign-in process with redirect method...
Redirecting to Google sign-in...

[ページがリダイレクト]
[ページが再読み込み]

Redirect authentication successful: { ... }
User authenticated: user@example.com
User is authenticated, redirecting to dashboard...
```

## ✅ 修正により解決された問題

1. ✅ 読み込み中のままログインできない問題を解消
2. ✅ リダイレクト後の状態管理を改善
3. ✅ エラーハンドリングを簡素化
4. ✅ ログイン後のナビゲーションを正しく実装
5. ✅ デバッグ情報を追加して問題の特定を容易化

## 🔍 トラブルシューティング

### 問題1: リダイレクト後にログインページに戻る

**原因**: Firebase設定が不足している可能性

**確認方法**:
1. ブラウザコンソールを確認
2. 「Firebase is not enabled」エラーが表示されていないか確認
3. 環境変数が正しく設定されているか確認

**解決方法**:
- [GOOGLE_LOGIN_DEBUG_REPORT.md](./GOOGLE_LOGIN_DEBUG_REPORT.md)を参照
- `.env.development`ファイルを確認

### 問題2: 「このドメインは認証が許可されていません」エラー

**原因**: Firebase Consoleで承認済みドメインが設定されていない

**解決方法**:
1. Firebase Console → Authentication → Settings
2. 承認済みドメインに以下を追加:
   - `localhost`（ローカル開発用）
   - あなたのFirebase Hostingドメイン

### 問題3: リダイレクト後に無限ループ

**原因**: `isAuthenticated`の状態が正しく更新されない

**確認方法**:
1. ブラウザコンソールを確認
2. 「User authenticated」ログが表示されるか確認
3. ローカルストレージに`authToken`が保存されているか確認

**解決方法**:
1. ブラウザのローカルストレージをクリア
2. ページをリロード
3. 再度ログインを試行

## 📝 変更されたファイル

- ✅ `src/services/authService.ts` - 認証サービスの修正
- ✅ `src/contexts/AuthContext.tsx` - 認証コンテキストの修正
- ✅ `src/pages/Login.tsx` - ログインページの修正
- ✅ `GOOGLE_LOGIN_LOADING_FIX.md` - このドキュメント（新規作成）

## 🧪 テスト方法

### ローカル環境でのテスト

1. **環境変数を設定**
   ```bash
   # .env.development を確認
   cat .env.development
   ```

2. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

3. **ログインページにアクセス**
   ```
   http://localhost:5173/login
   ```

4. **Googleログインをテスト**
   - 「Googleでログイン」ボタンをクリック
   - Googleアカウントを選択
   - ログインが完了し、ダッシュボードに移動することを確認

5. **コンソールログを確認**
   - ブラウザの開発者ツールを開く
   - コンソールタブでログを確認
   - エラーがないことを確認

### 本番環境でのテスト

1. **変更をコミットしてプッシュ**
   ```bash
   git add .
   git commit -m "fix: Google login loading issue"
   git push
   ```

2. **GitHub Actionsでデプロイを確認**
   - GitHub Actionsのログを確認
   - デプロイが成功したことを確認

3. **本番環境でテスト**
   ```
   https://cocottu-iwailist.firebaseapp.com/login
   ```

4. **同様の手順でテスト**

## 📚 関連ドキュメント

- [Google Login Fix](./GOOGLE_LOGIN_FIX.md) - ポップアップブロック対策
- [Google Login Tab Fix](./GOOGLE_LOGIN_TAB_FIX.md) - リダイレクト方式への変更
- [Google Login Debug Report](./GOOGLE_LOGIN_DEBUG_REPORT.md) - ローカル環境の設定
- [Production Debug Guide](./PRODUCTION_GOOGLE_LOGIN_DEBUG.md) - 本番環境の診断

---

**作成日**: 2025-10-25  
**対象バージョン**: Phase 4+  
**対応者**: Cursor AI Agent
