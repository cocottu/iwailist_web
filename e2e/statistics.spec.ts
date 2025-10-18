import { test, expect } from '@playwright/test';

test.describe('統計ページのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
  });

  test('統計ページが正常に表示される', async ({ page }) => {
    // ページタイトルが表示されることを確認
    await expect(page.locator('h1')).toContainText('統計');
    
    // 統計情報が表示されることを確認
    await expect(page.locator('text=総贈答品数')).toBeVisible();
    await expect(page.locator('text=未対応数')).toBeVisible();
    await expect(page.locator('text=対応済数')).toBeVisible();
    await expect(page.locator('text=総金額')).toBeVisible();
  });

  test('グラフが正常に表示される', async ({ page }) => {
    // グラフコンテナが表示されることを確認
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('フィルター機能が正常に動作する', async ({ page }) => {
    // 期間フィルターが表示されることを確認
    await expect(page.locator('text=期間')).toBeVisible();
    
    // カテゴリフィルターが表示されることを確認
    await expect(page.locator('text=カテゴリ')).toBeVisible();
  });

  test('データが空の場合の表示', async ({ page }) => {
    // データベースをクリア
    await page.evaluate(() => {
      indexedDB.deleteDatabase('IwailistDB');
    });

    // ページをリロード
    await page.reload();
    
    // 空の状態が表示されることを確認
    await expect(page.locator('text=データがありません')).toBeVisible();
  });
});
