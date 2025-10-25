# 通知システムの統一化（Sonner導入）

## 概要
アプリ内の通知処理を、OSSライブラリ「Sonner」を使用して統一しました。これにより、より美しく一貫性のある通知UIを実現しています。

## 変更内容

### 1. Sonnerライブラリの導入
- **ライブラリ**: `sonner` (軽量で美しいReact向けトーストライブラリ)
- **サイズ**: 約3KB（gzip圧縮後）
- **特徴**: 
  - 美しいデザインとスムーズなアニメーション
  - TypeScript完全対応
  - カスタマイズ可能
  - オフラインファースト思想に合致

### 2. 統一された通知コンポーネント

#### 通知ユーティリティ (`src/utils/notifications.ts`)
- **Sonnerベース**に書き換え
- 既存のAPIを維持しつつ、内部実装をSonnerに移行
- 新機能の追加:
  - `loading()`: ローディング通知
  - `promise()`: プロミスベースの通知（読み込み中→成功/エラー）
  - `custom()`: カスタムトーストの表示
  - `dismiss()`: 特定のトーストを閉じる

#### PWAインストールプロンプト (`src/components/ui/PWAInstallPrompt.tsx`)
- **Sonnerのカスタムトースト**として再実装
- ボトムセンター配置で統一感のあるUI
- インストール/後でボタンの動作を維持

#### アップデート通知 (`src/components/ui/UpdatePrompt.tsx`)
- **Sonnerのカスタムトースト**として再実装
- 新しいバージョン利用可能時: カスタムトースト
- オフライン対応完了時: 成功通知（5秒間表示）

#### 同期状態インジケーター (`src/components/ui/SyncIndicator.tsx`)
- **Sonner通知**として再実装
- 状態に応じた適切な通知タイプ:
  - 同期中: ローディング通知
  - エラー: エラー通知
  - オフライン: 警告通知
  - 同期待ち: カスタムトースト（手動同期ボタン付き）
  - 同期準備完了: 成功通知（5秒間表示）

### 3. アプリへの統合 (`src/App.tsx`)
```tsx
import { Toaster } from 'sonner';

// Toasterコンポーネントを追加
<Toaster 
  position="top-right" 
  richColors 
  closeButton 
  expand={true}
  toastOptions={{
    duration: 3000,
    style: {
      fontSize: '14px',
    },
  }}
/>
```

### 4. テストの更新
- `src/test/utils/notifications.test.ts` をSonner用に更新
- すべてのテストが成功✅

## 使用例

### 基本的な通知
```typescript
import { notifications } from '@/utils/notifications';

// 成功通知
notifications.success('保存しました');

// エラー通知
notifications.error('エラーが発生しました');

// 警告通知
notifications.warning('ご注意ください');

// 情報通知
notifications.info('更新があります');
```

### タイトル付き通知
```typescript
notifications.success('データを保存しました', '成功');
```

### ローディング通知
```typescript
const toastId = notifications.loading('処理中...');
// 処理完了後
notifications.dismiss(toastId);
notifications.success('完了しました');
```

### プロミス通知
```typescript
notifications.promise(
  fetchData(),
  {
    loading: 'データを読み込んでいます...',
    success: 'データを読み込みました',
    error: 'データの読み込みに失敗しました',
  }
);
```

## メリット

### 1. 統一されたUI/UX
- すべての通知が同じデザインパターンで表示
- 一貫性のあるアニメーションとトランジション
- ユーザー体験の向上

### 2. 開発者体験の向上
- シンプルで直感的なAPI
- TypeScript完全対応
- カスタマイズ可能

### 3. パフォーマンス
- 軽量（約3KB）
- オフラインファーストに適合
- 不要な再レンダリングを防止

### 4. メンテナンス性
- OSSライブラリによる継続的なメンテナンス
- バグフィックスと機能追加
- コミュニティサポート

## 技術スタック
- **Sonner**: v1.1.0以上
- **React**: 19.2.0
- **TypeScript**: 5.9.3

## 注意事項
- 既存のAPIは互換性を保持しているため、既存コードへの影響は最小限
- `notifications.confirm()`は現在、Sonnerのカスタムトーストとして実装
- テスト環境ではSonnerをモックして使用

## 今後の改善案
- 通知のアニメーションカスタマイズ
- 通知の位置を状況に応じて変更
- 通知のグループ化機能
- より詳細なカスタマイズオプション

## 関連ファイル
- `/workspace/src/utils/notifications.ts`
- `/workspace/src/components/ui/PWAInstallPrompt.tsx`
- `/workspace/src/components/ui/UpdatePrompt.tsx`
- `/workspace/src/components/ui/SyncIndicator.tsx`
- `/workspace/src/App.tsx`
- `/workspace/src/test/utils/notifications.test.ts`
