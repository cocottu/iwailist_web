# 運営者（管理者）設定ガイド

本ドキュメントでは、祝いリスト（Iwailist）の運営者（管理者）を設定する方法について説明します。

## 概要

運営者は、一般ユーザーとは異なる特別な権限を持ちます：

| 権限 | 一般ユーザー | 運営者 |
|------|-------------|--------|
| お問い合わせの送信 | ✅ | ✅ |
| 自分のお問い合わせの閲覧 | ✅ | ✅ |
| 全ユーザーのお問い合わせ閲覧 | ❌ | ✅ |
| お問い合わせへの返信（運営者として） | ❌ | ✅ |
| お問い合わせのステータス変更 | ❌ | ✅ |
| 管理画面（`/admin/contacts`）へのアクセス | ❌ | ✅ |

## 前提条件

- Firebase プロジェクトが設定済みであること
- Firebase Console へのアクセス権限があること
- 運営者に設定したいユーザーが既にアプリにログイン済みであること

## 運営者の設定手順

### 手順 1: Firebase Console にアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択

### 手順 2: Firestore Database を開く

1. 左側のメニューから「**Firestore Database**」をクリック
2. 「データ」タブが表示されていることを確認

### 手順 3: ユーザードキュメントを探す

1. `users` コレクションをクリック
2. 運営者にしたいユーザーのドキュメント（UID）を探す

> **ユーザーのUIDを確認する方法**
> - Firebase Console の「Authentication」→「Users」タブで確認できます
> - ユーザーのメールアドレスから該当するUIDを特定してください

### 手順 4: isAdmin フィールドを追加

1. 該当するユーザードキュメントをクリック
2. 「**フィールドを追加**」をクリック
3. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| フィールド名 | `isAdmin` |
| タイプ | `boolean` |
| 値 | `true` |

4. 「**追加**」または「**保存**」をクリック

### 手順 5: 設定の確認

設定後、Firestoreのデータは以下のようになります：

```
users/
  └── {運営者のUID}/
        ├── email: "admin@example.com"
        ├── displayName: "管理者"
        ├── photoURL: "https://..."
        ├── isAdmin: true          ← 追加されたフィールド
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

## 運営者権限の確認方法

### 方法 1: 管理画面にアクセス

1. 運営者アカウントでアプリにログイン
2. ブラウザで `/admin/contacts` にアクセス
3. お問い合わせ管理画面が表示されれば設定成功

### 方法 2: ブラウザのコンソールで確認

開発者ツールのコンソールで以下を実行：

```javascript
// Firebase が初期化されている前提
const userId = firebase.auth().currentUser.uid;
const userDoc = await firebase.firestore().doc(`users/${userId}`).get();
console.log('isAdmin:', userDoc.data()?.isAdmin);
```

## 運営者権限の削除

運営者権限を削除するには：

1. Firebase Console で該当ユーザードキュメントを開く
2. `isAdmin` フィールドを削除、または値を `false` に変更

## セキュリティについて

### クライアント側の保護

- `AdminRoute` コンポーネントにより、運営者以外は管理画面にアクセス不可
- 運営者判定は Firestore から取得（5分間キャッシュ）

### サーバー側の保護（Firestore Security Rules）

```javascript
// 運営者判定関数
function isAdmin() {
  return isAuthenticated() && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

// お問い合わせコレクションのルール
match /contacts/{contactId} {
  // 運営者は全てのお問い合わせを閲覧・更新可能
  allow read: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || isAdmin());
  allow update: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || isAdmin());
}
```

### 重要なセキュリティポイント

| ポイント | 説明 |
|---------|------|
| クライアントからの変更不可 | ユーザーは自分の `isAdmin` フィールドを変更できません |
| 手動設定のみ | 運営者権限は Firebase Console からの手動設定のみ可能 |
| 二重保護 | クライアント（AdminRoute）とサーバー（Security Rules）の両方で保護 |

## トラブルシューティング

### 管理画面にアクセスできない

1. **ログイン状態を確認**: 正しいアカウントでログインしているか確認
2. **isAdmin フィールドを確認**: Firestore で `isAdmin: true` が設定されているか確認
3. **キャッシュをクリア**: ブラウザをリロード、または5分待ってから再試行
4. **コンソールでエラー確認**: 開発者ツールでエラーメッセージを確認

### isAdmin が反映されない

運営者判定は5分間キャッシュされます。即座に反映させたい場合：

1. ブラウザをリロード
2. 一度ログアウトして再ログイン

### Firestore にユーザードキュメントがない

ユーザーがまだログインしたことがない場合、ドキュメントが存在しないことがあります。

**対処法**:
1. ユーザーにアプリにログインしてもらう
2. または、手動でドキュメントを作成：

```
users/{UID}/
  ├── email: "admin@example.com"
  ├── displayName: "管理者"
  ├── isAdmin: true
  ├── createdAt: Timestamp.now()
  └── updatedAt: Timestamp.now()
```

## 複数の運営者を設定する

複数のユーザーを運営者に設定できます。各ユーザーのドキュメントに `isAdmin: true` を追加してください。

```
users/
  ├── {運営者1のUID}/
  │     └── isAdmin: true
  ├── {運営者2のUID}/
  │     └── isAdmin: true
  └── {一般ユーザーのUID}/
        └── (isAdmin フィールドなし、または false)
```

## 関連ドキュメント

- [Firebase セットアップガイド](./FIREBASE_SETUP.md)
- [環境変数ガイド](./ENVIRONMENT_VARIABLES_GUIDE.md)
- [Phase 3 デプロイガイド](./PHASE3_DEPLOYMENT_GUIDE.md)

---

**最終更新日**: 2025年1月1日
