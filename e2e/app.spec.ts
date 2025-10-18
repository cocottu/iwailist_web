import { test, expect } from '@playwright/test';

test.describe('アプリケーション全体のテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にアプリケーションにアクセス
    await page.goto('/');
  });

  test('アプリケーションが正常に読み込まれる', async ({ page }) => {
    // ページタイトルを確認
    await expect(page).toHaveTitle(/祝い品管理アプリ/);
    
    // ヘッダーが表示されていることを確認
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });

  test('ナビゲーションが正常に動作する', async ({ page }) => {
    // ダッシュボードから贈答品一覧へ移動
    await page.click('text=すべて見る →');
    await expect(page).toHaveURL('/gifts');
    await expect(page.locator('h1')).toContainText('贈答品一覧');

    // 人物一覧へ移動
    await page.click('text=人物');
    await expect(page).toHaveURL('/persons');
    await expect(page.locator('h1')).toContainText('人物一覧');

    // 統計ページへ移動
    await page.click('text=統計');
    await expect(page).toHaveURL('/statistics');
    await expect(page.locator('h1')).toContainText('統計');

    // ダッシュボードに戻る
    await page.click('text=ダッシュボード');
    await expect(page).toHaveURL('/');
  });

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // デスクトップ表示
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();

    // タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();

    // モバイル表示
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
