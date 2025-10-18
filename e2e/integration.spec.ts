import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard-page';
import { GiftListPage } from './pages/gift-list-page';
import { GiftFormPage } from './pages/gift-form-page';
import { PersonListPage } from './pages/person-list-page';
import { PersonFormPage } from './pages/person-form-page';
import { clearDatabase, createTestPerson, createTestGift } from './helpers/test-helpers';

test.describe('統合テスト - 完全なワークフロー', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にデータベースをクリア
    await clearDatabase(page);
  });

  test('人物登録から贈答品登録までの完全なワークフロー', async ({ page }) => {
    const personFormPage = new PersonFormPage(page);
    const giftFormPage = new GiftFormPage(page);
    const dashboardPage = new DashboardPage(page);
    const giftListPage = new GiftListPage(page);

    // 1. 人物を登録
    await personFormPage.goto();
    await personFormPage.fillForm({
      name: 'テスト太郎',
      furigana: 'テストタロウ',
      relationship: '友人',
      memo: 'テスト用の人物データ'
    });
    await personFormPage.submit();

    // 2. ダッシュボードに戻る
    await dashboardPage.goto();
    await dashboardPage.waitForLoad();

    // 3. 贈答品を登録
    await dashboardPage.clickGiftRegistration();
    await giftFormPage.fillForm({
      giftName: 'テスト贈答品',
      personId: 'テスト太郎',
      receivedDate: '2024-01-01',
      category: 'お菓子',
      returnStatus: '未対応',
      amount: 5000,
      memo: 'テスト用の贈答品データ'
    });
    await giftFormPage.submit();

    // 4. ダッシュボードで登録されたデータを確認
    await dashboardPage.goto();
    await dashboardPage.waitForLoad();
    
    // 統計データが更新されていることを確認
    const pendingCount = await dashboardPage.getPendingReturnsCount();
    expect(pendingCount).toContain('1件');

    // 5. 贈答品一覧で登録されたデータを確認
    await dashboardPage.clickViewAllGifts();
    await giftListPage.waitForLoad();
    
    const giftCount = await giftListPage.getGiftCount();
    expect(giftCount).toBeGreaterThan(0);
    
    const giftName = await giftListPage.getGiftNameByIndex(0);
    expect(giftName).toBe('テスト贈答品');
  });

  test('複数の人物と贈答品の登録と管理', async ({ page }) => {
    const personFormPage = new PersonFormPage(page);
    const giftFormPage = new GiftFormPage(page);
    const personListPage = new PersonListPage(page);
    const giftListPage = new GiftListPage(page);

    // 1. 複数の人物を登録
    const persons = [
      { name: '田中太郎', furigana: 'タナカタロウ', relationship: '友人' },
      { name: '佐藤花子', furigana: 'サトウハナコ', relationship: '同僚' },
      { name: '鈴木一郎', furigana: 'スズキイチロウ', relationship: '親戚' }
    ];

    for (const person of persons) {
      await personFormPage.goto();
      await personFormPage.fillForm(person);
      await personFormPage.submit();
    }

    // 2. 人物一覧で登録を確認
    await personListPage.goto();
    await personListPage.waitForLoad();
    
    const personCount = await personListPage.getPersonCount();
    expect(personCount).toBe(3);

    // 3. 各人物に対して贈答品を登録
    const gifts = [
      { giftName: 'お菓子セット', personId: '田中太郎', receivedDate: '2024-01-01', category: 'お菓子', returnStatus: '未対応', amount: 3000 },
      { giftName: 'ワイン', personId: '佐藤花子', receivedDate: '2024-01-02', category: '飲み物', returnStatus: '対応済', amount: 8000 },
      { giftName: '花束', personId: '鈴木一郎', receivedDate: '2024-01-03', category: '花', returnStatus: '不要', amount: 2000 }
    ];

    for (const gift of gifts) {
      await giftFormPage.goto();
      await giftFormPage.fillForm(gift);
      await giftFormPage.submit();
    }

    // 4. 贈答品一覧で登録を確認
    await giftListPage.goto();
    await giftListPage.waitForLoad();
    
    const giftCount = await giftListPage.getGiftCount();
    expect(giftCount).toBe(3);

    // 5. フィルター機能をテスト
    await giftListPage.filterByStatus('未対応');
    const pendingGifts = await giftListPage.getGiftCount();
    expect(pendingGifts).toBe(1);

    await giftListPage.resetFilters();
    const allGifts = await giftListPage.getGiftCount();
    expect(allGifts).toBe(3);
  });

  test('検索機能のテスト', async ({ page }) => {
    const personFormPage = new PersonFormPage(page);
    const giftFormPage = new GiftFormPage(page);
    const personListPage = new PersonListPage(page);
    const giftListPage = new GiftListPage(page);

    // 1. テストデータを作成
    await createTestPerson(page, { name: '山田太郎', relationship: '友人' });
    await createTestPerson(page, { name: '山田花子', relationship: '同僚' });
    await createTestGift(page, { giftName: 'お菓子セット', personId: '山田太郎', receivedDate: '2024-01-01', category: 'お菓子', returnStatus: '未対応' });
    await createTestGift(page, { giftName: '花束', personId: '山田花子', receivedDate: '2024-01-02', category: '花', returnStatus: '対応済' });

    // 2. 人物検索をテスト
    await personListPage.goto();
    await personListPage.searchPersons('山田');
    
    const personCount = await personListPage.getPersonCount();
    expect(personCount).toBe(2);

    // 3. 贈答品検索をテスト
    await giftListPage.goto();
    await giftListPage.searchGifts('お菓子');
    
    const giftCount = await giftListPage.getGiftCount();
    expect(giftCount).toBe(1);
  });

  test('レスポンシブデザインのテスト', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // 1. デスクトップ表示
    await page.setViewportSize({ width: 1200, height: 800 });
    await dashboardPage.goto();
    await dashboardPage.waitForLoad();
    await expect(dashboardPage.title).toBeVisible();

    // 2. タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 });
    await dashboardPage.goto();
    await dashboardPage.waitForLoad();
    await expect(dashboardPage.title).toBeVisible();

    // 3. モバイル表示
    await page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.goto();
    await dashboardPage.waitForLoad();
    await expect(dashboardPage.title).toBeVisible();
  });
});
