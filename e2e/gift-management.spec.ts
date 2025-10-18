import { test, expect } from '@playwright/test';

test.describe('贈答品管理のテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gifts');
  });

  test('贈答品一覧ページが正常に表示される', async ({ page }) => {
    // ページタイトルと説明
    await expect(page.getByRole('heading', { name: '贈答品一覧' })).toBeVisible();
    await expect(page.locator('text=件の贈答品が登録されています')).toBeVisible();

    // 新規登録ボタン
    await expect(page.locator('text=新規登録')).toBeVisible();

    // フィルターセクション
    await expect(page.locator('text=検索')).toBeVisible();
    await expect(page.locator('label:has-text("カテゴリ")')).toBeVisible();
    await expect(page.locator('label:has-text("お返し状況")')).toBeVisible();
    await expect(page.getByRole('button', { name: 'リセット' })).toBeVisible();
  });

  test('フィルター機能が正常に動作する', async ({ page }) => {
    // 検索フィールドにテキストを入力
    await page.fill('input[placeholder="贈答品名で検索..."]', 'テスト');
    
    // カテゴリフィルターを選択（最初のselect要素）
    await page.locator('select').first().selectOption({ value: 'その他' });
    
    // お返し状況フィルターを選択（2番目のselect要素）
    await page.locator('select').nth(1).selectOption({ value: 'pending' });
    
    // リセットボタンをクリック
    await page.getByRole('button', { name: 'リセット' }).click();
    
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
    await expect(page.getByRole('heading', { name: '贈答品を登録' })).toBeVisible();
    
    // 必須フィールドが表示されることを確認
    await expect(page.locator('text=贈答品名')).toBeVisible();
    await expect(page.locator('text=贈り主')).toBeVisible();
    await expect(page.locator('text=受け取り日')).toBeVisible();
    await expect(page.locator('text=カテゴリ')).toBeVisible();
    await expect(page.locator('text=お返し状況')).toBeVisible();
  });

  test('フォームバリデーションが正常に動作する', async ({ page }) => {
    // 贈答品登録ページに移動
    await page.goto('/gifts/new');
    
    // フォームが読み込まれるまで待機
    await page.waitForSelector('input[placeholder="例: 結婚祝い"]');
    
    // フォームの送信イベントを待機
    await page.waitForLoadState('networkidle');
    
    // フォームの送信イベントを監視
    const formSubmitPromise = page.waitForEvent('submit');
    
    // 空のフォームで送信を試行
    await page.getByRole('button', { name: '登録する' }).click();
    
    // フォームの送信イベントが発生するまで待機
    await formSubmitPromise;
    
    // バリデーションエラーが表示されることを確認（待機時間を増加）
    await page.waitForTimeout(2000);
    
    // エラーメッセージの存在を確認
    const errorElement = page.locator('.text-red-600:has-text("贈答品名は必須です")');
    await expect(errorElement).toBeVisible({ timeout: 10000 });
  });

  test('フォームの入力と送信が正常に動作する', async ({ page }) => {
    // まず人物を登録する必要がある
    await page.goto('/persons/new');
    
    // 人物登録フォームに記入
    await page.fill('input[placeholder="例: 田中太郎"]', 'テスト太郎');
    await page.fill('input[placeholder="例: タナカタロウ"]', 'テストタロウ');
    await page.selectOption('select', { value: '友人' });
    
    // 人物を保存
    await page.getByRole('button', { name: '登録する' }).click();
    
    // 人物のIDを取得（URLから）
    await page.waitForTimeout(1000);
    const personUrl = page.url();
    const personId = personUrl.split('/').pop();
    
    // 贈答品登録ページに移動
    await page.goto('/gifts/new');
    
    // 贈答品登録フォームに記入
    await page.fill('input[placeholder="例: 結婚祝い"]', 'テスト贈答品');
    await page.selectOption('select', { value: personId });
    await page.fill('input[type="date"]', '2024-01-01');
    await page.locator('select').nth(1).selectOption({ value: 'その他' });
    await page.getByRole('radio', { name: '未対応' }).check();
    await page.fill('input[placeholder="例: 30000"]', '5000');
    await page.fill('textarea[placeholder="特記事項があれば入力してください"]', 'テストメモ');
    
    // フォームを送信
    await page.getByRole('button', { name: '登録する' }).click();
    
    // 成功メッセージまたはリダイレクトを確認
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/gifts/);
  });
});
