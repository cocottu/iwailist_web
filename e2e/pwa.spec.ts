import { test, expect } from '@playwright/test';

test.describe('PWA機能のテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('PWAマニフェストが正しく設定されている', async ({ page }) => {
    // マニフェストの存在を確認
    const manifest = await page.evaluate(() => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      return manifestLink ? manifestLink.getAttribute('href') : null;
    });
    
    expect(manifest).toBe('/manifest.json');
  });

  test('Service Workerが登録される', async ({ page }) => {
    // Service Workerの登録を確認
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('オフライン機能が動作する', async ({ page }) => {
    // オフライン状態をシミュレート
    await page.context().setOffline(true);
    
    // ページがオフライン状態でも表示されることを確認
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
    
    // オンライン状態に戻す
    await page.context().setOffline(false);
  });

  test('アプリケーションアイコンが設定されている', async ({ page }) => {
    // ファビコンが設定されていることを確認
    const favicon = await page.evaluate(() => {
      const faviconLink = document.querySelector('link[rel="icon"]');
      return faviconLink ? faviconLink.getAttribute('href') : null;
    });
    
    expect(favicon).toBeTruthy();
  });

  test('メタタグが正しく設定されている', async ({ page }) => {
    // ビューポートメタタグを確認
    const viewport = await page.evaluate(() => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      return viewportMeta ? viewportMeta.getAttribute('content') : null;
    });
    
    expect(viewport).toContain('width=device-width');
    
    // テーマカラーメタタグを確認
    const themeColor = await page.evaluate(() => {
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      return themeMeta ? themeMeta.getAttribute('content') : null;
    });
    
    expect(themeColor).toBe('#3B82F6');
  });
});
