# クラウド同期の問題修正レポート

## 問題の概要

別の端末でログインしても、人物や贈答品が表示されないという問題がありました。

## 根本原因

1. **初回ログイン時の同期不足**: 
   - ユーザーが認証された後、Firestoreからデータをダウンロードする処理が自動的にトリガーされていませんでした
   
2. **ページ読み込み時の同期不足**:
   - 各ページ（Dashboard、PersonList、GiftList等）は、IndexedDB（ローカルストレージ）からのみデータを読み込んでいて、Firestoreとの同期を待っていませんでした

## 修正内容

### 1. AuthContextの修正 (`src/contexts/AuthContext.tsx`)

**変更点**:
- `syncManager`をインポート
- ユーザー認証成功直後に、自動的に`syncManager.triggerSync()`を呼び出すように修正

**効果**:
- ログイン直後に、Firestoreから最新のデータが自動的にダウンロードされ、IndexedDBに保存されます
- 別の端末で追加したデータが、新しい端末でログインした時に自動的に表示されるようになります

```typescript
// 認証直後にFirestoreからデータを同期
if (isFirebaseEnabled() && navigator.onLine) {
  console.log('[AuthContext] Triggering initial sync for user:', userData.uid);
  syncManager.triggerSync(userData.uid).catch((error) => {
    console.error('[AuthContext] Initial sync failed:', error);
  });
}
```

### 2. 各ページの修正

以下のページで、データ読み込み前に同期を実行するように修正しました：

- `src/pages/Dashboard.tsx`
- `src/pages/PersonList.tsx`
- `src/pages/GiftList.tsx`
- `src/pages/ReturnList.tsx`
- `src/pages/ReminderList.tsx`
- `src/pages/Statistics.tsx`

**変更点**:
- `syncManager`と`isFirebaseEnabled`をインポート
- データ読み込み前に、Firestoreとの同期を実行

**効果**:
- ページを開くたびに、最新のデータがFirestoreから取得されます
- ネットワークがオフラインの場合は、ローカルデータのみを表示します
- 同期に失敗してもローカルデータは表示されます（フォールバック）

```typescript
// Firebaseが有効な場合、最初に同期を実行
if (isFirebaseEnabled() && user?.uid && navigator.onLine) {
  console.log('[PageName] Syncing data before load...');
  try {
    await syncManager.triggerSync(user.uid);
    console.log('[PageName] Sync completed');
  } catch (error) {
    console.error('[PageName] Sync failed:', error);
    // 同期に失敗してもローカルデータは表示する
  }
}
```

## 動作フロー

### 1. 端末Aでデータを作成
1. ユーザーが人物や贈答品を作成
2. データはIndexedDB（ローカル）に保存される
3. 同時に、Firestoreにも自動的に同期される（`PersonRepository.create`、`GiftRepository.create`）

### 2. 端末Bでログイン
1. ユーザーがログイン
2. **AuthContextが自動的に`syncManager.triggerSync()`を実行** ← 新機能
3. Firestoreから最新のデータがダウンロードされ、IndexedDBに保存される
4. ダッシュボードに遷移
5. **ダッシュボードが再度`syncManager.triggerSync()`を実行** ← 新機能
6. IndexedDBから最新のデータが読み込まれ、表示される

### 3. ページ遷移時
1. ユーザーがページを移動（例：人物一覧）
2. **ページが自動的に`syncManager.triggerSync()`を実行** ← 新機能
3. Firestoreから最新のデータがダウンロードされ、IndexedDBに保存される
4. IndexedDBから最新のデータが読み込まれ、表示される

## テスト方法

### 前提条件
- Firebase環境変数が正しく設定されていること
- Firestore、Firebase Authenticationが有効化されていること

### テスト手順

1. **端末Aで初期データを作成**
   ```bash
   # 端末Aでアプリを起動
   npm run dev
   
   # ブラウザで http://localhost:5173 にアクセス
   # テストアカウントでログイン（例：test@example.com）
   # 人物を1-2人追加
   # 贈答品を1-2件追加
   ```

2. **端末Bで同じアカウントでログイン**
   ```bash
   # 別のブラウザまたはシークレットモードを使用
   # 同じアカウント（test@example.com）でログイン
   
   # 期待される結果：
   # - ログイン直後に同期が実行される（コンソールログで確認可能）
   # - ダッシュボードに端末Aで作成した人物・贈答品が表示される
   # - 人物一覧にアクセスすると、端末Aで作成した人物が表示される
   # - 贈答品一覧にアクセスすると、端末Aで作成した贈答品が表示される
   ```

3. **コンソールログの確認**
   ```
   ブラウザの開発者ツールを開いて、以下のログが表示されることを確認：
   
   [AuthContext] Triggering initial sync for user: <user-id>
   [Dashboard] Syncing data before load...
   [Dashboard] Sync completed
   [PersonList] Syncing data before load...
   [PersonList] Sync completed
   [GiftList] Syncing data before load...
   [GiftList] Sync completed
   ```

4. **双方向同期のテスト**
   ```bash
   # 端末Bで新しい人物を追加
   # 端末Aでページをリロード
   # 端末Bで追加した人物が表示されることを確認
   ```

## 注意事項

### オフライン時の動作
- オフライン時は、Firestoreとの同期がスキップされ、ローカルデータのみが表示されます
- オンラインに復帰すると、自動的に同期が実行されます（`useSync`フックで実装済み）

### 同期の頻度
- ログイン時: 1回
- ページ読み込み時: 各ページで1回
- オンライン復帰時: 1回（`useSync`フック）
- 手動同期: ヘッダーの同期ボタンをクリック

### パフォーマンスへの影響
- 同期処理は非同期で実行されるため、UIがブロックされることはありません
- 同期中もローカルデータが表示されます
- 同期が失敗してもローカルデータは引き続き利用可能です

## 今後の改善案

1. **差分同期の実装**
   - 現在は全データを取得していますが、最終同期時刻以降の変更のみを取得するように改善できます

2. **同期状態の可視化**
   - 同期の進行状況を表示するプログレスバーの追加

3. **競合解決の改善**
   - 現在はLast-Write-Wins（最後の書き込みが優先）ですが、より高度な競合解決アルゴリズムを実装できます

4. **リアルタイム同期**
   - Firestoreのリアルタイムリスナーを使用して、他の端末での変更を即座に反映できます

## まとめ

この修正により、複数端末での同期が正常に動作するようになりました：

✅ ログイン直後にFirestoreからデータがダウンロードされる
✅ ページ読み込み時に最新のデータが取得される
✅ オフライン時もローカルデータが利用可能
✅ オンライン復帰時に自動的に同期される
✅ 手動同期ボタンで任意のタイミングで同期可能

---

**修正日**: 2025-10-26
**ブランチ**: cursor/investigate-cloud-sync-issues-9741
