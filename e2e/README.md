# E2Eテスト

このディレクトリには、祝い品管理アプリのE2E（End-to-End）テストが含まれています。

## テスト構成

### テストファイル

- `app.spec.ts` - アプリケーション全体の基本テスト
- `dashboard.spec.ts` - ダッシュボードページのテスト
- `gift-management.spec.ts` - 贈答品管理機能のテスト
- `person-management.spec.ts` - 人物管理機能のテスト
- `statistics.spec.ts` - 統計ページのテスト
- `pwa.spec.ts` - PWA機能のテスト
- `integration.spec.ts` - 統合テスト（完全なワークフロー）

### ページオブジェクトモデル

- `pages/dashboard-page.ts` - ダッシュボードページのページオブジェクト
- `pages/gift-list-page.ts` - 贈答品一覧ページのページオブジェクト
- `pages/gift-form-page.ts` - 贈答品登録フォームのページオブジェクト
- `pages/person-list-page.ts` - 人物一覧ページのページオブジェクト
- `pages/person-form-page.ts` - 人物登録フォームのページオブジェクト

### ヘルパー関数

- `helpers/test-helpers.ts` - テスト用のヘルパー関数

## テストの実行

### 基本的な実行

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# UIモードでテストを実行（デバッグ用）
npm run test:e2e:ui

# ヘッド付きブラウザでテストを実行
npm run test:e2e:headed

# デバッグモードでテストを実行
npm run test:e2e:debug

# テストレポートを表示
npm run test:e2e:report
```

### 特定のテストファイルを実行

```bash
# 特定のテストファイルのみ実行
npx playwright test e2e/dashboard.spec.ts

# 特定のテストケースのみ実行
npx playwright test e2e/dashboard.spec.ts -g "ダッシュボードの基本要素が表示される"
```

### 特定のブラウザで実行

```bash
# Chromeのみで実行
npx playwright test --project=chromium

# Firefoxのみで実行
npx playwright test --project=firefox

# Safariのみで実行
npx playwright test --project=webkit
```

## テストの設定

### Playwright設定

`playwright.config.ts`でテストの設定を行います：

- テストディレクトリ: `./e2e`
- ベースURL: `http://localhost:3000`
- 対応ブラウザ: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- 並列実行: 有効
- リトライ: CI環境では2回

### 環境変数

- `CI`: CI環境での実行時に設定される
- `PLAYWRIGHT_BROWSERS_PATH`: ブラウザのインストールパス

## テストデータの管理

### データベースのクリア

各テストの前にデータベースをクリアして、テスト間の独立性を保証します：

```typescript
import { clearDatabase } from './helpers/test-helpers';

test.beforeEach(async ({ page }) => {
  await clearDatabase(page);
});
```

### テストデータの作成

ヘルパー関数を使用してテストデータを作成します：

```typescript
import { createTestPerson, createTestGift } from './helpers/test-helpers';

// 人物を作成
await createTestPerson(page, {
  name: 'テスト太郎',
  relationship: '友人'
});

// 贈答品を作成
await createTestGift(page, {
  giftName: 'テスト贈答品',
  personId: 'テスト太郎',
  receivedDate: '2024-01-01',
  category: 'お菓子',
  returnStatus: '未対応'
});
```

## デバッグ

### テストのデバッグ

1. **UIモードでのデバッグ**
   ```bash
   npm run test:e2e:ui
   ```

2. **ヘッド付きブラウザでのデバッグ**
   ```bash
   npm run test:e2e:headed
   ```

3. **デバッグモードでの実行**
   ```bash
   npm run test:e2e:debug
   ```

### スクリーンショットとトレース

テストが失敗した場合、自動的にスクリーンショットとトレースが保存されます：

- スクリーンショット: `test-results/`
- トレース: `test-results/`
- レポート: `playwright-report/`

### ログの確認

```bash
# 詳細なログを表示
npx playwright test --reporter=line

# HTMLレポートを生成
npx playwright show-report
```

## CI/CDでの実行

GitHub ActionsでE2Eテストが自動実行されます：

- プッシュ時（main, developブランチ）
- プルリクエスト時（main, developブランチ）
- 複数ブラウザでの並列実行
- テスト結果のアーティファクト保存

## ベストプラクティス

1. **テストの独立性**: 各テストは独立して実行できるようにする
2. **データのクリーンアップ**: テスト後にデータをクリーンアップする
3. **ページオブジェクトモデル**: 再利用可能なページオブジェクトを使用する
4. **適切な待機**: 要素の表示を適切に待機する
5. **アサーション**: 明確で意味のあるアサーションを使用する

## トラブルシューティング

### よくある問題

1. **タイムアウトエラー**
   - 要素の待機時間を調整
   - ネットワークの状態を確認

2. **要素が見つからない**
   - セレクターの確認
   - ページの読み込み完了を待機

3. **テストが不安定**
   - データベースのクリアを確認
   - 適切な待機処理を追加

### サポート

問題が発生した場合は、以下を確認してください：

1. テストログとスクリーンショット
2. ブラウザのコンソールログ
3. ネットワークタブでのリクエスト/レスポンス
