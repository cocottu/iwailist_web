import { Page, expect } from '@playwright/test';

/**
 * データベースをクリアするヘルパー関数
 */
export async function clearDatabase(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('IwailistDB');
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => resolve(); // エラーでも続行
    });
  });
}

/**
 * テスト用の人物データを作成するヘルパー関数
 */
export async function createTestPerson(page: Page, personData: {
  name: string;
  furigana?: string;
  relationship: string;
  memo?: string;
}) {
  await page.goto('/persons/new');
  
  await page.fill('input[name="name"]', personData.name);
  if (personData.furigana) {
    await page.fill('input[name="furigana"]', personData.furigana);
  }
  await page.selectOption('select[name="relationship"]', { label: personData.relationship });
  if (personData.memo) {
    await page.fill('textarea[name="memo"]', personData.memo);
  }
  
  await page.click('button[type="submit"]');
  
  // 成功メッセージまたはリダイレクトを待機
  await expect(page.locator('text=人物を登録しました')).toBeVisible();
}

/**
 * テスト用の贈答品データを作成するヘルパー関数
 */
export async function createTestGift(page: Page, giftData: {
  giftName: string;
  personId: string;
  receivedDate: string;
  category: string;
  returnStatus: string;
  amount?: number;
  memo?: string;
}) {
  await page.goto('/gifts/new');
  
  await page.fill('input[name="giftName"]', giftData.giftName);
  await page.selectOption('select[name="personId"]', { label: giftData.personId });
  await page.fill('input[name="receivedDate"]', giftData.receivedDate);
  await page.selectOption('select[name="category"]', { label: giftData.category });
  await page.selectOption('select[name="returnStatus"]', { label: giftData.returnStatus });
  
  if (giftData.amount) {
    await page.fill('input[name="amount"]', giftData.amount.toString());
  }
  
  if (giftData.memo) {
    await page.fill('textarea[name="memo"]', giftData.memo);
  }
  
  await page.click('button[type="submit"]');
  
  // 成功メッセージまたはリダイレクトを待機
  await expect(page.locator('text=贈答品を登録しました')).toBeVisible();
}

/**
 * ページの読み込み完了を待機するヘルパー関数
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('h1', { timeout: 10000 });
}

/**
 * モバイル表示に切り替えるヘルパー関数
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * タブレット表示に切り替えるヘルパー関数
 */
export async function setTabletViewport(page: Page) {
  await page.setViewportSize({ width: 768, height: 1024 });
}

/**
 * デスクトップ表示に切り替えるヘルパー関数
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1200, height: 800 });
}
