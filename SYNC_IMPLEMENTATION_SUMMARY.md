# 同期機能の実装完了レポート

## 実装日時
2025-10-27

## 問題の概要
同期のエラーは出なくなりましたが、実際には同期が機能していませんでした。

## 原因分析

### 1. リアルタイムリスナーが未実装
Firestoreの`onSnapshot`を使ったリアルタイム同期が実装されていなかったため、他のデバイスやブラウザでの変更が自動的に反映されませんでした。

### 2. ID不一致の問題
ローカルリポジトリとFirestoreリポジトリで異なるIDが生成されていました：
- IndexedDBで作成: `gift.id = "abc123"`
- Firestoreに同期: 新しいID `"xyz789"` を生成
- 結果: 同じデータが異なるIDで保存され、同期が機能しない

### 3. 初回同期のみ実行
ログイン時に一度だけ同期が実行され、その後は手動で同期ボタンを押す必要がありました。

## 実装した解決策

### 1. リアルタイムリスナーの追加
`syncManager.ts`にFirestoreのリアルタイムリスナー機能を追加：

```typescript
/**
 * リアルタイムリスナーを開始
 */
startRealtimeSync(userId: string): void {
  // 贈答品のリスナー
  this.unsubscribeGifts = onSnapshot(
    giftsQuery,
    async (snapshot) => {
      // 初回読み込みをスキップ
      if (this.isFirstGiftsSnapshot) {
        this.isFirstGiftsSnapshot = false;
        return;
      }
      
      // 変更をIndexedDBに反映
      const changes = snapshot.docChanges();
      for (const change of changes) {
        if (change.type === 'added' || change.type === 'modified') {
          // ローカルの方が新しい場合はスキップ
          if (existing && existing.updatedAt >= gift.updatedAt) {
            continue;
          }
          await giftRepository.update(gift);
        } else if (change.type === 'removed') {
          await giftRepository.delete(giftId, userId);
        }
      }
    }
  );
  
  // 人物のリスナー（同様の実装）
  this.unsubscribePersons = onSnapshot(...);
}

/**
 * リアルタイムリスナーを停止
 */
stopRealtimeSync(): void {
  if (this.unsubscribeGifts) {
    this.unsubscribeGifts();
  }
  if (this.unsubscribePersons) {
    this.unsubscribePersons();
  }
}
```

### 2. ID管理の統一
Firestoreリポジトリに`createWithId`メソッドを追加し、IndexedDBと同じIDを使用：

```typescript
// FirestoreGiftRepository
async createWithId(userId: string, giftId: string, gift: Omit<Gift, 'id' | 'userId'>): Promise<void> {
  const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
  await firestoreService.createDocument(collectionPath, giftId, firestoreGift);
}

// GiftRepository
async create(gift: Gift): Promise<void> {
  await db.add('gifts', gift);
  
  // Firestoreに同期（同じIDを使用）
  if (isFirebaseEnabled() && gift.userId && gift.id) {
    const { id, userId, ...giftData } = gift;
    await firestoreGiftRepository.createWithId(userId, id, giftData);
  }
}
```

### 3. AuthContextでのリスナー管理
ログイン時にリスナーを開始、ログアウト時に停止：

```typescript
// ログイン時
if (firebaseUser) {
  syncManager.triggerSync(userData.uid).then(() => {
    // 初回同期完了後にリアルタイムリスナーを開始
    syncManager.startRealtimeSync(userData.uid);
  });
}

// ログアウト時
else {
  syncManager.stopRealtimeSync();
}
```

## 同期フロー

### 1. ログイン時
```
1. ユーザーがログイン
2. AuthContextがFirestoreから初回同期を実行（triggerSync）
3. IndexedDBとFirestoreの差分を双方向同期
4. リアルタイムリスナーを開始（startRealtimeSync）
```

### 2. ローカルでの変更
```
1. ユーザーがデータを作成/更新/削除
2. IndexedDBに即座に保存
3. 同時にFirestoreに同期（同じIDを使用）
4. Firestoreの変更が他のデバイスのリスナーに通知される
```

### 3. リモートでの変更
```
1. 別のデバイスでデータが変更される
2. Firestoreのリスナーが変更を検知
3. IndexedDBに自動的に反映
4. UIが更新される（React Queryのキャッシュ無効化）
```

### 4. ログアウト時
```
1. ユーザーがログアウト
2. リアルタイムリスナーを停止（stopRealtimeSync）
3. メモリリークを防止
```

## 競合解決

### Last-Write-Wins戦略
- `updatedAt`タイムスタンプで最新の変更を判定
- より新しいタイムスタンプを持つデータが優先される
- ローカルの方が新しい場合は、リモートの変更をスキップ

### 初回読み込みのスキップ
- リスナーの初回スナップショットは既存データの全件読み込み
- `isFirstGiftsSnapshot`フラグで初回をスキップ
- 2回目以降の変更のみを処理

## テスト方法

### 1. 基本的な同期テスト
```
1. ブラウザAでログイン
2. ブラウザBで同じアカウントでログイン
3. ブラウザAでデータを作成
4. ブラウザBで自動的に表示されることを確認
```

### 2. オフライン同期テスト
```
1. ブラウザAでログイン
2. ネットワークをオフライン
3. データを作成/更新
4. ネットワークをオンライン
5. 自動的に同期されることを確認
```

### 3. 競合解決テスト
```
1. ブラウザAとBで同じデータを開く
2. 両方で異なる変更を加える
3. 最後に保存した方が優先されることを確認
```

## パフォーマンスへの影響

### メリット
- リアルタイムでデータが同期される
- ユーザーが手動で同期する必要がない
- 複数デバイス間でシームレスな体験

### 考慮事項
- Firestoreの読み取り回数が増加（変更時のみ）
- ネットワーク帯域幅の使用（小規模なデータのみ）
- バッテリー消費の微増（常時接続）

## 今後の改善案

1. **バッチ処理**: 複数の変更を一括で処理
2. **選択的同期**: 必要なデータのみ同期
3. **圧縮**: データ転送量の削減
4. **再接続戦略**: ネットワーク切断時の自動再接続
5. **同期状態の可視化**: ユーザーへの状態表示

## 関連ファイル

- `/workspace/src/services/syncManager.ts` - 同期マネージャー（リスナー実装）
- `/workspace/src/contexts/AuthContext.tsx` - リスナーの開始/停止
- `/workspace/src/database/repositories/giftRepository.ts` - ローカルリポジトリ
- `/workspace/src/database/repositories/personRepository.ts` - ローカルリポジトリ
- `/workspace/src/repositories/firebase/giftRepository.ts` - Firestoreリポジトリ
- `/workspace/src/repositories/firebase/personRepository.ts` - Firestoreリポジトリ

## まとめ

リアルタイムリスナーの実装により、複数デバイス間での自動同期が可能になりました。ID管理の統一により、データの整合性が保たれ、Last-Write-Wins戦略で競合が適切に解決されます。ユーザーは意識することなく、常に最新のデータにアクセスできるようになりました。
