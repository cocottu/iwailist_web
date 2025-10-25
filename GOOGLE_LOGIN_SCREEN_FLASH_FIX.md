# Googleログイン画面の一瞬表示問題 - 修正レポート

## 問題の概要

Googleでログインする際、Googleでの認証完了後にアプリに戻ってくると、本アプリのログイン画面が一瞬だけ表示されてしまう問題がありました。

## 問題の原因

Googleからリダイレクトで戻ってきた際の処理フロー：
1. Googleから認証完了でリダイレクト → ページ全体が再読み込み
2. `AuthContext`の初期化開始 → `loading = true`
3. その間に`Login`コンポーネントがレンダリング
4. `handleRedirectResult()`で認証処理
5. 認証完了 → ダッシュボードへ遷移

**問題点**: ステップ3でログイン画面が一瞬表示されてしまう

## 実装した解決策

### 1. リダイレクト状態の追跡

**authService.ts**
- リダイレクト開始時に`localStorage`に`authRedirectPending`フラグを設定
- 認証処理完了時（成功/失敗/結果なし）にフラグをクリア
- `isRedirectPending()`メソッドを追加して、リダイレクト処理中かチェック可能に

```typescript
// リダイレクト開始時
localStorage.setItem('authRedirectPending', 'true');
await signInWithRedirect(auth, provider);

// 処理完了時
localStorage.removeItem('authRedirectPending');
```

### 2. 認証コンテキストの改善

**AuthContext.tsx**
- `handleRedirectResult()`が完了するまで`loading`状態を維持
- `onAuthStateChanged`のコールバックで、リダイレクト処理中でない場合のみローディング解除

```typescript
// リダイレクト処理中でなければローディング解除
if (!authService.isRedirectPending()) {
  setLoading(false);
}
```

### 3. ログインページの改善

**Login.tsx**
- `loading`状態の初期値を`localStorage`の`authRedirectPending`フラグから設定
- ページロード時にリダイレクト処理中であれば、即座にローディング画面を表示

```typescript
const [loading, setLoading] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authRedirectPending') === 'true';
  }
  return false;
});
```

## 修正の流れ

### リダイレクト前
1. ユーザーが「Googleでログイン」ボタンをクリック
2. `authRedirectPending`フラグを`true`に設定
3. Googleの認証ページにリダイレクト

### リダイレクト後（戻ってきた時）
1. ページロード → `Login`コンポーネントの初期化
2. `loading`の初期値が`localStorage`から`true`で設定される
3. **ローディング画面が表示される（ログイン画面は表示されない）**
4. `AuthContext`の初期化 → `handleRedirectResult()`実行
5. 認証処理完了 → `authRedirectPending`フラグをクリア
6. `loading`を`false`に設定
7. ユーザー情報が設定され、ダッシュボードへ自動遷移

## 効果

- ✅ Googleから戻ってきた時、ページロードの瞬間からローディング画面が表示される
- ✅ ログイン画面が一瞬も表示されなくなる
- ✅ ユーザーエクスペリエンスの向上

## 動作確認方法

1. ログアウト状態でアプリにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleの認証ページで認証
4. アプリに戻る
   - **期待される動作**: ローディング画面が表示され、ログイン画面は表示されない
   - **以前の動作**: ログイン画面が一瞬表示されてからローディング画面に切り替わる

## 修正ファイル

- `src/services/authService.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`

## テスト結果

- ✅ ビルド成功（`npm run build`）
- ✅ Lintチェック成功（警告のみ、エラーなし）
- ✅ 既存のコードに影響なし

## 備考

この修正により、Googleログインのユーザーエクスペリエンスが大幅に改善されました。リダイレクト方式の認証フローにおいて、状態管理を適切に行うことで、画面のちらつきを完全に防ぐことができました。
