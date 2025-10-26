# 共有機能の設計ドキュメント

## 概要

複数人で贈答品情報を共有できる機能の設計ドキュメントです。
Phase 6での実装を想定しています。

## 目的

- 家族や夫婦で贈答品情報を共有
- チームや組織での贈答品管理
- 協力してお返しの管理を行う

## ユースケース

### ケース1: 夫婦での共有
- 夫が受け取った贈答品を妻も確認できる
- 妻がお返しを記録し、夫も確認できる
- お互いのリマインダーを確認できる

### ケース2: 家族での共有
- 親が管理している贈答品を子供も閲覧
- 家族全員でお返しの状況を確認
- 家族の誰でもリマインダーを設定可能

### ケース3: 組織・チームでの共有
- 会社で受け取った贈答品を複数人で管理
- 担当者がお返しを記録
- 上司も確認できる（読み取り専用）

---

## データモデル設計

### 1. SharedGift（共有贈答品）

```typescript
interface SharedGift {
  id: string;
  giftId: string;           // 元の贈答品ID
  ownerId: string;          // オーナー（作成者）のユーザーID
  sharedWith: SharedUser[]; // 共有されているユーザー
  createdAt: Date;
  updatedAt: Date;
}

interface SharedUser {
  userId: string;
  email: string;
  displayName?: string;
  permission: 'read' | 'write';  // 権限レベル
  sharedAt: Date;
}
```

### 2. ShareInvitation（共有招待）

```typescript
interface ShareInvitation {
  id: string;
  giftId: string;           // 共有する贈答品ID
  fromUserId: string;       // 招待者
  fromUserEmail: string;
  toEmail: string;          // 招待先のメールアドレス
  permission: 'read' | 'write';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message?: string;         // 招待メッセージ
  createdAt: Date;
  expiresAt: Date;         // 有効期限（7日後など）
}
```

### 3. SharedCollection（共有コレクション）

複数の贈答品をまとめて共有する場合

```typescript
interface SharedCollection {
  id: string;
  name: string;             // コレクション名（例: "2024年結婚祝い"）
  ownerId: string;
  giftIds: string[];        // 含まれる贈答品のID
  sharedWith: SharedUser[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Firestoreスキーマ設計

### コレクション構造

```
users/{userId}
  └─ gifts/{giftId}
  └─ sharedGifts/{sharedGiftId}
      - giftId
      - ownerId
      - sharedWith[]
  └─ shareInvitations/{invitationId}
      - giftId
      - fromUserId
      - toEmail
      - permission
      - status

sharedGifts/{sharedGiftId}  // グローバル共有情報
  - giftId
  - ownerId
  - sharedWith[]
```

---

## Firestoreセキュリティルールの設計

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザーの贈答品
    match /users/{userId}/gifts/{giftId} {
      // オーナーは全操作可能
      allow read, write: if request.auth.uid == userId;
      
      // 共有されているユーザーは読み取り可能
      allow read: if exists(/databases/$(database)/documents/sharedGifts/$(giftId))
        && get(/databases/$(database)/documents/sharedGifts/$(giftId)).data.sharedWith
          .hasAny([{'userId': request.auth.uid, 'permission': 'read'}]);
      
      // 書き込み権限がある共有ユーザーは書き込み可能
      allow write: if exists(/databases/$(database)/documents/sharedGifts/$(giftId))
        && get(/databases/$(database)/documents/sharedGifts/$(giftId)).data.sharedWith
          .hasAny([{'userId': request.auth.uid, 'permission': 'write'}]);
    }
    
    // 共有贈答品情報
    match /sharedGifts/{sharedGiftId} {
      // オーナーは全操作可能
      allow read, write: if request.auth.uid == resource.data.ownerId;
      
      // 共有されているユーザーは読み取り可能
      allow read: if request.auth.uid in resource.data.sharedWith
        .map(user => user.userId);
    }
    
    // 共有招待
    match /users/{userId}/shareInvitations/{invitationId} {
      // 招待者と招待先は読み取り可能
      allow read: if request.auth.uid == userId 
        || request.auth.token.email == resource.data.toEmail;
      
      // 招待者は作成・削除可能
      allow create, delete: if request.auth.uid == userId;
      
      // 招待先は受諾・拒否のみ可能
      allow update: if request.auth.token.email == resource.data.toEmail
        && request.resource.data.status in ['accepted', 'declined'];
    }
  }
}
```

---

## UI設計

### 1. 共有設定ページ (`/gifts/:id/share`)

```
┌──────────────────────────────────────┐
│ 贈答品名: 結婚祝い                    │
│ オーナー: あなた                      │
├──────────────────────────────────────┤
│ 共有ユーザー                          │
│ ┌────────────────────────────────┐   │
│ │ 👤 田中太郎 (tanaka@example.com)│   │
│ │    権限: 編集可能               │   │
│ │    [権限変更] [削除]            │   │
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ 👤 山田花子 (yamada@example.com)│   │
│ │    権限: 読み取り専用           │   │
│ │    [権限変更] [削除]            │   │
│ └────────────────────────────────┘   │
├──────────────────────────────────────┤
│ 新しいユーザーを招待                  │
│ メールアドレス: [____________]       │
│ 権限: [読み取り専用 ▼]              │
│ メッセージ: [________________]       │
│              [招待を送信]            │
└──────────────────────────────────────┘
```

### 2. 招待一覧ページ (`/share/invitations`)

```
┌──────────────────────────────────────┐
│ 共有招待                              │
├──────────────────────────────────────┤
│ 受信した招待                          │
│ ┌────────────────────────────────┐   │
│ │ 👤 佐藤一郎さんから招待         │   │
│ │    贈答品: 結婚祝い             │   │
│ │    権限: 編集可能               │   │
│ │    [承認] [拒否]                │   │
│ └────────────────────────────────┘   │
├──────────────────────────────────────┤
│ 送信した招待                          │
│ ┌────────────────────────────────┐   │
│ │ 📧 tanaka@example.com          │   │
│ │    贈答品: 結婚祝い             │   │
│ │    状態: 承認待ち               │   │
│ │    [キャンセル]                 │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

### 3. 共有中の贈答品一覧

贈答品一覧に「共有中」バッジを表示

```
┌────────────────────────────────┐
│ 結婚祝い              👥 共有中│
│ 田中太郎さんから              │
│ 2024/10/01 - ¥50,000         │
└────────────────────────────────┘
```

---

## 実装手順

### Phase 1: 基本的な共有機能（2-3時間）
1. データモデルの実装
   - `SharedGift`型定義
   - `ShareInvitation`型定義
2. Firestoreリポジトリの作成
   - `sharedGiftRepository.ts`
   - `shareInvitationRepository.ts`
3. セキュリティルールの実装
4. 基本的な共有UIの実装

### Phase 2: 招待機能（2-3時間）
1. 招待送信機能
2. 招待受諾・拒否機能
3. メール通知（Firebase Cloud Functions）
4. 招待一覧ページ

### Phase 3: 権限管理（2時間）
1. 権限レベルの実装
   - 読み取り専用
   - 編集可能
2. 権限に応じたUI制御
3. 権限変更機能

### Phase 4: コレクション共有（オプション）
1. 複数贈答品の一括共有
2. コレクション管理UI

---

## 技術的な考慮事項

### 1. データ同期
- 共有されたデータの変更を即座に反映
- Firestoreのリアルタイムリスナーを使用
- 競合解決（Last-Write-Wins）

### 2. パフォーマンス
- 共有ユーザーリストのキャッシュ
- インデックスの最適化
- ページネーション

### 3. セキュリティ
- メールアドレスの検証
- 招待の有効期限管理
- 権限の厳格なチェック
- オーナーのみ削除可能

### 4. ユーザー体験
- 共有状態の明確な表示
- 権限不足時の適切なメッセージ
- オフライン時の動作

---

## 制約事項

### 現在の制約
- Firebase Spark Plan（無料枠）の制約
  - 読み取り: 50K/日
  - 書き込み: 20K/日
- 共有機能により読み取り/書き込みが増加

### 推奨事項
- 共有は最小限に（家族や信頼できる人のみ）
- 頻繁な変更は避ける
- 必要に応じて有料プラン（Blaze Plan）への移行を検討

---

## テスト計画

### 単体テスト
- リポジトリ層のテスト
- 権限チェックのテスト
- 招待機能のテスト

### 統合テスト
- 共有フロー全体のテスト
- 権限別の動作テスト
- オフライン時の動作テスト

### E2Eテスト
- ユーザー間の共有フロー
- 招待の送受信
- 権限変更のテスト

---

## まとめ

共有機能は複雑な機能ですが、設計をしっかり行うことで実装可能です。
Phase 6での実装を推奨します。

**想定実装時間**: 6-8時間
**優先度**: 中
**難易度**: 高
