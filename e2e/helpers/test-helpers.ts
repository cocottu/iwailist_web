/* eslint-env node */
import { Page, expect } from '@playwright/test';

/**
 * データベースをクリアするヘルパー関数
 */
export async function clearDatabase(page: Page) {
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        // セキュリティエラーを回避するため、try-catchで囲む
        try {
          const deleteReq = indexedDB.deleteDatabase('IwailistDB');
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => resolve(); // エラーでも続行
        } catch (error) {
          // セキュリティエラーの場合は無視して続行
          console.warn('Database clear failed due to security restrictions:', error);
          resolve();
        }
      });
    });
  } catch (error) {
    // ページ評価でエラーが発生した場合も無視
    console.warn('Database clear failed:', error);
  }
}

/**
 * 代替手段: 個別データの削除
 */
export async function clearTestData(page: Page) {
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        try {
          const request = indexedDB.open('IwailistDB');
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['persons', 'gifts', 'returns', 'images'], 'readwrite');
            
            // 各ストアをクリア
            transaction.objectStore('persons').clear();
            transaction.objectStore('gifts').clear();
            transaction.objectStore('returns').clear();
            transaction.objectStore('images').clear();
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => resolve();
          };
          request.onerror = () => resolve();
        } catch (error) {
          console.warn('Test data clear failed:', error);
          resolve();
        }
      });
    });
  } catch (error) {
    console.warn('Test data clear failed:', error);
  }
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
  
  await page.fill('input[placeholder="例: 田中太郎"]', personData.name);
  if (personData.furigana) {
    await page.fill('input[placeholder="例: タナカタロウ"]', personData.furigana);
  }
  await page.selectOption('select', { value: personData.relationship });
  if (personData.memo) {
    await page.fill('textarea[placeholder="特記事項があれば入力してください"]', personData.memo);
  }
  
  await page.getByRole('button', { name: '登録する' }).click();
  
  // 成功メッセージまたはリダイレクトを待機
  await page.waitForTimeout(1000);
  // リダイレクト後のページを確認（人物詳細ページまたは一覧ページ）
  await expect(page).toHaveURL(/\/persons/);
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
  
  await page.fill('input[placeholder="例: 結婚祝い"]', giftData.giftName);
  await page.selectOption('select', { value: giftData.personId });
  await page.fill('input[type="date"]', giftData.receivedDate);
  await page.locator('select').nth(1).selectOption({ value: giftData.category });
  // お返し状況のラベルをマッピング
  const returnStatusLabels = {
    'pending': '未対応',
    'completed': '対応済',
    'not_required': '不要'
  };
  await page.getByRole('radio', { name: returnStatusLabels[giftData.returnStatus] }).check();
  
  if (giftData.amount) {
    await page.fill('input[placeholder="例: 30000"]', giftData.amount.toString());
  }
  
  if (giftData.memo) {
    await page.fill('textarea[placeholder="特記事項があれば入力してください"]', giftData.memo);
  }
  
  await page.getByRole('button', { name: '登録する' }).click();
  
  // 成功メッセージまたはリダイレクトを待機
  await page.waitForTimeout(1000);
  // リダイレクト後のページを確認（贈答品詳細ページまたは一覧ページ）
  await expect(page).toHaveURL(/\/gifts/);
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

/**
 * Basic Authのログイン処理を行うヘルパー関数
 */
export async function loginWithBasicAuth(page: Page) {
  try {
    // Basic Authの入力フィールドが表示されるか短時間チェック
    // 表示されない場合はタイムアウトしてcatchブロックへ進む
    // timeoutは短めに設定して、認証不要な環境での待ち時間を減らす
    const usernameInput = page.locator('input[name="username"]');
    
    // すでに認証済みか、認証不要な場合は入力フィールドが表示されない
    if (await usernameInput.isVisible({ timeout: 2000 })) {
      console.log('Basic Auth detected. Attempting to login...');
      
      // 環境変数から認証情報を取得（デフォルト値は開発環境用）
      // 注意: Playwrightの設定や実行環境によっては process.env が空の場合があるため、
      // 必要に応じてハードコードされたフォールバック値を使用
      // e2eテスト用のアカウント
      const username = process.env.VITE_BASIC_AUTH_USERNAME || process.env.BASIC_AUTH_USERNAME || 'e2e_user';
      const password = process.env.VITE_BASIC_AUTH_PASSWORD || process.env.BASIC_AUTH_PASSWORD || 'e2e_password';

      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      
      // 認証後の遷移を待機
      await page.waitForLoadState('networkidle');
      console.log('Basic Auth login submitted.');
    }
  } catch {
    // エラーは無視（Basic Authが不要な環境であるとみなす）
    // console.log('Basic Auth not required or login skipped.');
  }
}
