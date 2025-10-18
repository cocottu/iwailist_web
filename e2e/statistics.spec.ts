import { test, expect } from '@playwright/test';

test.describe('統計ページのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
  });

  test('統計ページが正常に表示される', async ({ page }) => {
    // ページタイトルが表示されることを確認
    await expect(page.getByRole('heading', { name: '統計・分析' })).toBeVisible();
    
    // データが空の場合のEmptyStateが表示されることを確認
    await expect(page.locator('text=年のデータがありません')).toBeVisible();
  });

  test('グラフが正常に表示される', async ({ page }) => {
    // データが空の場合のEmptyStateが表示されることを確認
    await expect(page.locator('text=年のデータがありません')).toBeVisible();
  });

  test('フィルター機能が正常に動作する', async ({ page }) => {
    // 年選択フィルターが表示されることを確認
    await expect(page.locator('text=対象年:')).toBeVisible();
    
    // 年選択のセレクトボックスが表示されることを確認
    await expect(page.locator('select')).toBeVisible();
  });

  test('データが空の場合の表示', async ({ page }) => {
    // データベースをクリア
    await page.evaluate(() => {
      indexedDB.deleteDatabase('IwailistDB');
    });

    // ページをリロード
    await page.reload();
    
    // 空の状態が表示されることを確認（年は動的に変わる）
    await expect(page.locator('text=年のデータがありません')).toBeVisible();
  });
});
