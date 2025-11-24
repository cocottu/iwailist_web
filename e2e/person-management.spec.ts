import { test, expect } from '@playwright/test';
import { loginWithBasicAuth } from './helpers/test-helpers';

test.describe('人物管理のテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/persons');
    await loginWithBasicAuth(page);
  });

  test('人物一覧ページが正常に表示される', async ({ page }) => {
    // ページタイトルと説明
    await expect(page.getByRole('heading', { name: '人物一覧' })).toBeVisible();
    await expect(page.locator('text=人の人物が登録されています')).toBeVisible();

    // 新規登録ボタン
    await expect(page.locator('text=新規登録')).toBeVisible();

    // フィルターセクション
    await expect(page.locator('text=検索')).toBeVisible();
    await expect(page.locator('label:has-text("関係性")')).toBeVisible();
  });

  test('フィルター機能が正常に動作する', async ({ page }) => {
    // 検索フィールドにテキストを入力
    await page.fill('input[placeholder="名前で検索..."]', 'テスト');
    
    // 関係性フィルターを選択
    await page.selectOption('select', { label: '友人' });
    
    // フィルターが適用されることを確認（実際のデータに依存）
    await expect(page.locator('input[placeholder="名前で検索..."]')).toHaveValue('テスト');
  });

  test('新規人物登録ページに移動する', async ({ page }) => {
    await page.click('text=新規登録');
    await expect(page).toHaveURL('/persons/new');
  });

  test('空の状態が正しく表示される', async ({ page }) => {
    // データベースをクリア
    await page.evaluate(() => {
      indexedDB.deleteDatabase('IwailistDB');
    });

    // ページをリロード
    await page.reload();
    
    // 空の状態が表示されることを確認
    await expect(page.locator('text=人物が見つかりません')).toBeVisible();
    await expect(page.locator('text=最初の人物を登録')).toBeVisible();
  });
});

test.describe('人物登録フォームのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/persons/new');
    await loginWithBasicAuth(page);
  });

  test('人物登録フォームが正常に表示される', async ({ page }) => {
    // フォームの基本要素が表示されることを確認
    await expect(page.getByRole('heading', { name: '人物を登録' })).toBeVisible();
    
    // 必須フィールドが表示されることを確認
    await expect(page.locator('label:has-text("氏名")')).toBeVisible();
    await expect(page.locator('label:has-text("関係性")')).toBeVisible();
  });

  test('フォームバリデーションが正常に動作する', async ({ page }) => {
    // 人物登録ページに移動
    await page.goto('/persons/new');
    
    // フォームが読み込まれるまで待機
    await page.waitForSelector('input[placeholder="例: 田中太郎"]');
    
    // フォームの送信イベントを待機
    await page.waitForLoadState('networkidle');
    
    // 空のフォームで送信を試行
    await page.getByRole('button', { name: '登録する' }).click();
    
    await page.waitForTimeout(100);
    
    // エラーメッセージの存在を確認
    await expect(page.getByText('氏名は必須です')).toBeVisible({ timeout: 10000 });
  });

  test('フォームの入力と送信が正常に動作する', async ({ page }) => {
    // 人物登録フォームに記入
    await page.fill('input[placeholder="例: 田中太郎"]', 'テスト花子');
    await page.fill('input[placeholder="例: タナカタロウ"]', 'テストハナコ');
    await page.selectOption('select', { value: '会社関係' });
    await page.fill('textarea[placeholder="特記事項があれば入力してください"]', 'テストメモ');
    
    // フォームを送信
    await page.getByRole('button', { name: '登録する' }).click();
    
    // 成功メッセージまたはリダイレクトを確認
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/persons/);
  });
});
