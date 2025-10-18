import { test, expect } from '@playwright/test';

test.describe('贈答品管理のテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gifts');
  });

  test('贈答品一覧ページが正常に表示される', async ({ page }) => {
    // ページタイトルと説明
    await expect(page.locator('h1')).toContainText('贈答品一覧');
    await expect(page.locator('text=件の贈答品が登録されています')).toBeVisible();

    // 新規登録ボタン
    await expect(page.locator('text=新規登録')).toBeVisible();

    // フィルターセクション
    await expect(page.locator('text=検索')).toBeVisible();
    await expect(page.locator('text=カテゴリ')).toBeVisible();
    await expect(page.locator('text=お返し状況')).toBeVisible();
    await expect(page.locator('text=リセット')).toBeVisible();
  });

  test('フィルター機能が正常に動作する', async ({ page }) => {
    // 検索フィールドにテキストを入力
    await page.fill('input[placeholder="贈答品名で検索..."]', 'テスト');
    
    // カテゴリフィルターを選択
    await page.selectOption('select', { label: 'お菓子' });
    
    // お返し状況フィルターを選択
    await page.selectOption('select', { label: '未対応' });
    
    // リセットボタンをクリック
    await page.click('text=リセット');
    
    // フィルターがリセットされることを確認
    await expect(page.locator('input[placeholder="贈答品名で検索..."]')).toHaveValue('');
  });

  test('新規贈答品登録ページに移動する', async ({ page }) => {
    await page.click('text=新規登録');
    await expect(page).toHaveURL('/gifts/new');
  });

  test('空の状態が正しく表示される', async ({ page }) => {
    // データベースをクリア
    await page.evaluate(() => {
      indexedDB.deleteDatabase('IwailistDB');
    });

    // ページをリロード
    await page.reload();
    
    // 空の状態が表示されることを確認
    await expect(page.locator('text=贈答品が見つかりません')).toBeVisible();
    await expect(page.locator('text=最初の贈答品を登録')).toBeVisible();
  });
});

test.describe('贈答品登録フォームのテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gifts/new');
  });

  test('贈答品登録フォームが正常に表示される', async ({ page }) => {
    // フォームの基本要素が表示されることを確認
    await expect(page.locator('h1')).toContainText('贈答品を登録');
    
    // 必須フィールドが表示されることを確認
    await expect(page.locator('text=贈答品名')).toBeVisible();
    await expect(page.locator('text=贈り主')).toBeVisible();
    await expect(page.locator('text=受け取り日')).toBeVisible();
    await expect(page.locator('text=カテゴリ')).toBeVisible();
    await expect(page.locator('text=お返し状況')).toBeVisible();
  });

  test('フォームバリデーションが正常に動作する', async ({ page }) => {
    // 空のフォームで送信を試行
    await page.click('button[type="submit"]');
    
    // バリデーションエラーが表示されることを確認
    await expect(page.locator('text=贈答品名は必須です')).toBeVisible();
  });

  test('フォームの入力と送信が正常に動作する', async ({ page }) => {
    // まず人物を登録する必要がある
    await page.goto('/persons/new');
    
    // 人物登録フォームに記入
    await page.fill('input[name="name"]', 'テスト太郎');
    await page.fill('input[name="furigana"]', 'テストタロウ');
    await page.selectOption('select[name="relationship"]', { label: '友人' });
    
    // 人物を保存
    await page.click('button[type="submit"]');
    
    // 贈答品登録ページに移動
    await page.goto('/gifts/new');
    
    // 贈答品登録フォームに記入
    await page.fill('input[name="giftName"]', 'テスト贈答品');
    await page.selectOption('select[name="personId"]', { label: 'テスト太郎' });
    await page.fill('input[name="receivedDate"]', '2024-01-01');
    await page.selectOption('select[name="category"]', { label: 'お菓子' });
    await page.selectOption('select[name="returnStatus"]', { label: '未対応' });
    await page.fill('input[name="amount"]', '5000');
    await page.fill('textarea[name="memo"]', 'テストメモ');
    
    // フォームを送信
    await page.click('button[type="submit"]');
    
    // 成功メッセージまたはリダイレクトを確認
    await expect(page.locator('text=贈答品を登録しました')).toBeVisible();
  });
});
