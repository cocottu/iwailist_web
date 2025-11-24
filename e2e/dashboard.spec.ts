import { test, expect } from '@playwright/test';
import { loginWithBasicAuth } from './helpers/test-helpers';

test.describe('ダッシュボードページのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginWithBasicAuth(page);
  });

  test('ダッシュボードの基本要素が表示される', async ({ page }) => {
    // ページタイトルと説明
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
    await expect(page.locator('text=祝い品の管理状況を確認できます')).toBeVisible();

    // サマリーカードが表示される
    await expect(page.locator('text=未対応')).toBeVisible();
    await expect(page.locator('text=今月')).toBeVisible();
    await expect(page.locator('text=対応済')).toBeVisible();
    await expect(page.locator('text=総額')).toBeVisible();

    // クイックアクションセクション
    await expect(page.locator('text=クイックアクション')).toBeVisible();
    await expect(page.getByRole('button', { name: '🎁 贈答品を登録' })).toBeVisible();
    await expect(page.getByRole('button', { name: '👤 人物を登録' })).toBeVisible();

    // 最近の贈答品セクション
    await expect(page.locator('text=最近の贈答品')).toBeVisible();
  });

  test('クイックアクションボタンが正常に動作する', async ({ page }) => {
    // 贈答品登録ボタンをクリック
    await page.getByRole('button', { name: '🎁 贈答品を登録' }).click();
    await expect(page).toHaveURL('/gifts/new');
    
    // 戻る
    await page.goBack();
    
    // 人物登録ボタンをクリック
    await page.getByRole('button', { name: '👤 人物を登録' }).click();
    await expect(page).toHaveURL('/persons/new');
  });

  test('最近の贈答品セクションが正常に動作する', async ({ page }) => {
    // すべて見るリンクをクリック
    await page.click('text=すべて見る →');
    await expect(page).toHaveURL('/gifts');
  });

  test('データが空の場合の表示', async ({ page }) => {
    // データベースをクリア（モックデータがない場合）
    await page.evaluate(() => {
      // IndexedDBをクリア
      indexedDB.deleteDatabase('IwailistDB');
    });

    // ページをリロード
    await page.reload();
    
    // 空の状態が表示されることを確認
    await expect(page.locator('text=まだ贈答品が登録されていません')).toBeVisible();
  });
});
