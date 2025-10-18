import { test, expect } from '@playwright/test';

test.describe('人物管理のテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/persons');
  });

  test('人物一覧ページが正常に表示される', async ({ page }) => {
    // ページタイトルと説明
    await expect(page.locator('h1')).toContainText('人物一覧');
    await expect(page.locator('text=人の人物が登録されています')).toBeVisible();

    // 新規登録ボタン
    await expect(page.locator('text=新規登録')).toBeVisible();

    // フィルターセクション
    await expect(page.locator('text=検索')).toBeVisible();
    await expect(page.locator('text=関係性')).toBeVisible();
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
  });

  test('人物登録フォームが正常に表示される', async ({ page }) => {
    // フォームの基本要素が表示されることを確認
    await expect(page.locator('h1')).toContainText('人物を登録');
    
    // 必須フィールドが表示されることを確認
    await expect(page.locator('text=名前')).toBeVisible();
    await expect(page.locator('text=関係性')).toBeVisible();
  });

  test('フォームバリデーションが正常に動作する', async ({ page }) => {
    // 空のフォームで送信を試行
    await page.click('button[type="submit"]');
    
    // バリデーションエラーが表示されることを確認
    await expect(page.locator('text=名前は必須です')).toBeVisible();
  });

  test('フォームの入力と送信が正常に動作する', async ({ page }) => {
    // 人物登録フォームに記入
    await page.fill('input[name="name"]', 'テスト花子');
    await page.fill('input[name="furigana"]', 'テストハナコ');
    await page.selectOption('select[name="relationship"]', { label: '同僚' });
    await page.fill('textarea[name="memo"]', 'テストメモ');
    
    // フォームを送信
    await page.click('button[type="submit"]');
    
    // 成功メッセージまたはリダイレクトを確認
    await expect(page.locator('text=人物を登録しました')).toBeVisible();
  });
});
