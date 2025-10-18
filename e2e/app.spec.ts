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
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('ナビゲーションが正常に動作する', async ({ page }) => {
    // ダッシュボードから贈答品一覧へ移動
    await page.getByRole('link', { name: 'すべて見る →' }).click();
    await expect(page).toHaveURL('/gifts');
    await expect(page.getByRole('heading', { name: '贈答品一覧' })).toBeVisible();

    // 人物一覧へ移動
    await page.getByRole('link', { name: '人物' }).click();
    await expect(page).toHaveURL('/persons');
    await expect(page.getByRole('heading', { name: '人物一覧' })).toBeVisible();

    // 統計ページへ移動
    await page.getByRole('link', { name: '統計' }).click();
    await expect(page).toHaveURL('/statistics');
    await expect(page.getByRole('heading', { name: '統計・分析' })).toBeVisible();

    // ダッシュボードに戻る
    await page.getByRole('link', { name: 'ホーム' }).click();
    await expect(page).toHaveURL('/');
  });

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // デスクトップ表示
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

    // タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

    // モバイル表示
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });
});
