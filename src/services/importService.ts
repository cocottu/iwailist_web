/**
 * データインポートサービス
 * JSONファイルからデータをインポート
 */

import { getDB } from '@/database';
import { Gift, Person, Return, Image, Reminder } from '@/types';
import { ExportData, ExportImage } from './exportService';

export interface ImportResult {
  success: boolean;
  imported: {
    gifts: number;
    persons: number;
    returns: number;
    images: number;
    reminders: number;
  };
  skipped: {
    gifts: number;
    persons: number;
    returns: number;
    images: number;
    reminders: number;
  };
  errors: string[];
}

export interface ImportOptions {
  skipExisting: boolean; // 既存データをスキップするか
  overwriteExisting: boolean; // 既存データを上書きするか
  userId?: string | null; // インポート時のユーザーID（ログイン時）
}

/**
 * エクスポートデータをインポート
 */
export async function importData(
  exportData: ExportData,
  options: ImportOptions
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: {
      gifts: 0,
      persons: 0,
      returns: 0,
      images: 0,
      reminders: 0,
    },
    skipped: {
      gifts: 0,
      persons: 0,
      returns: 0,
      images: 0,
      reminders: 0,
    },
    errors: [],
  };

  try {
    // バージョンチェック
    if (!exportData.version || exportData.version !== '1.0.0') {
      throw new Error('サポートされていないエクスポートバージョンです');
    }

    const db = await getDB();

    // トランザクションでインポート
    // 1. 人物データをインポート（贈答品より先に）
    for (const person of exportData.data.persons) {
      try {
        const imported = await importPerson(db, person, options);
        if (imported) {
          result.imported.persons++;
        } else {
          result.skipped.persons++;
        }
      } catch (error) {
        result.errors.push(`人物インポートエラー (${person.name}): ${error}`);
      }
    }

    // 2. 贈答品データをインポート
    for (const gift of exportData.data.gifts) {
      try {
        const imported = await importGift(db, gift, options);
        if (imported) {
          result.imported.gifts++;
        } else {
          result.skipped.gifts++;
        }
      } catch (error) {
        result.errors.push(`贈答品インポートエラー (${gift.giftName}): ${error}`);
      }
    }

    // 3. お返しデータをインポート
    for (const returnItem of exportData.data.returns) {
      try {
        const imported = await importReturn(db, returnItem, options);
        if (imported) {
          result.imported.returns++;
        } else {
          result.skipped.returns++;
        }
      } catch (error) {
        result.errors.push(`お返しインポートエラー (${returnItem.returnName}): ${error}`);
      }
    }

    // 4. 画像データをインポート
    for (const image of exportData.data.images) {
      try {
        const imported = await importImage(db, image, options);
        if (imported) {
          result.imported.images++;
        } else {
          result.skipped.images++;
        }
      } catch (error) {
        result.errors.push(`画像インポートエラー (${image.id}): ${error}`);
      }
    }

    // 5. リマインダーデータをインポート
    for (const reminder of exportData.data.reminders) {
      try {
        const imported = await importReminder(db, reminder, options);
        if (imported) {
          result.imported.reminders++;
        } else {
          result.skipped.reminders++;
        }
      } catch (error) {
        result.errors.push(`リマインダーインポートエラー (${reminder.message}): ${error}`);
      }
    }

    // エラーがある場合は成功フラグをfalseに
    if (result.errors.length > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`インポート全体エラー: ${error}`);
  }

  return result;
}

/**
 * JSONファイルを読み込んでインポート
 */
export async function importFromFile(
  file: File,
  options: ImportOptions
): Promise<ImportResult> {
  try {
    // ファイルを読み込み
    const text = await file.text();
    const exportData: ExportData = JSON.parse(text);

    // データをインポート
    return await importData(exportData, options);
  } catch (error) {
    return {
      success: false,
      imported: {
        gifts: 0,
        persons: 0,
        returns: 0,
        images: 0,
        reminders: 0,
      },
      skipped: {
        gifts: 0,
        persons: 0,
        returns: 0,
        images: 0,
        reminders: 0,
      },
      errors: [`ファイル読み込みエラー: ${error}`],
    };
  }
}

/**
 * 人物データをインポート
 */
async function importPerson(
  db: ReturnType<typeof getDB> extends Promise<infer T> ? T : never,
  person: Person,
  options: ImportOptions
): Promise<boolean> {
  const existing = await db.get('persons', person.id);

  if (existing) {
    if (options.skipExisting) {
      return false; // スキップ
    }
    if (options.overwriteExisting) {
      // ユーザーIDを上書き（ログイン時）
      const updatedPerson = {
        ...person,
        userId: options.userId || person.userId,
        updatedAt: new Date(),
      };
      await db.put('persons', updatedPerson);
      return true;
    }
    return false;
  }

  // 新規追加
  const newPerson = {
    ...person,
    userId: options.userId || person.userId,
    createdAt: new Date(person.createdAt),
    updatedAt: new Date(),
  };
  await db.add('persons', newPerson);
  return true;
}

/**
 * 贈答品データをインポート
 */
async function importGift(
  db: ReturnType<typeof getDB> extends Promise<infer T> ? T : never,
  gift: Gift,
  options: ImportOptions
): Promise<boolean> {
  const existing = await db.get('gifts', gift.id);

  if (existing) {
    if (options.skipExisting) {
      return false;
    }
    if (options.overwriteExisting) {
      const updatedGift = {
        ...gift,
        userId: options.userId || gift.userId,
        receivedDate: new Date(gift.receivedDate),
        updatedAt: new Date(),
      };
      await db.put('gifts', updatedGift);
      return true;
    }
    return false;
  }

  const newGift = {
    ...gift,
    userId: options.userId || gift.userId,
    receivedDate: new Date(gift.receivedDate),
    createdAt: new Date(gift.createdAt),
    updatedAt: new Date(),
  };
  await db.add('gifts', newGift);
  return true;
}

/**
 * お返しデータをインポート
 */
async function importReturn(
  db: ReturnType<typeof getDB> extends Promise<infer T> ? T : never,
  returnItem: Return,
  options: ImportOptions
): Promise<boolean> {
  const existing = await db.get('returns', returnItem.id);

  if (existing) {
    if (options.skipExisting) {
      return false;
    }
    if (options.overwriteExisting) {
      const updatedReturn = {
        ...returnItem,
        returnDate: new Date(returnItem.returnDate),
        createdAt: new Date(returnItem.createdAt),
      };
      await db.put('returns', updatedReturn);
      return true;
    }
    return false;
  }

  const newReturn = {
    ...returnItem,
    returnDate: new Date(returnItem.returnDate),
    createdAt: new Date(returnItem.createdAt),
  };
  await db.add('returns', newReturn);
  return true;
}

/**
 * 画像データをインポート
 */
async function importImage(
  db: ReturnType<typeof getDB> extends Promise<infer T> ? T : never,
  image: ExportImage,
  options: ImportOptions
): Promise<boolean> {
  const existing = await db.get('images', image.id);

  if (existing) {
    if (options.skipExisting) {
      return false;
    }
    if (options.overwriteExisting) {
      // Base64をBlobに変換
      const blob = await base64ToBlob(image.imageData);
      const updatedImage: Image = {
        ...image,
        imageData: blob,
        createdAt: new Date(image.createdAt),
      };
      await db.put('images', updatedImage);
      return true;
    }
    return false;
  }

  // Base64をBlobに変換
  const blob = await base64ToBlob(image.imageData);
  const newImage: Image = {
    ...image,
    imageData: blob,
    createdAt: new Date(image.createdAt),
  };
  await db.add('images', newImage);
  return true;
}

/**
 * リマインダーデータをインポート
 */
async function importReminder(
  db: ReturnType<typeof getDB> extends Promise<infer T> ? T : never,
  reminder: Reminder,
  options: ImportOptions
): Promise<boolean> {
  const existing = await db.get('reminders', reminder.id);

  if (existing) {
    if (options.skipExisting) {
      return false;
    }
    if (options.overwriteExisting) {
      const updatedReminder = {
        ...reminder,
        userId: options.userId || reminder.userId,
        reminderDate: new Date(reminder.reminderDate),
        createdAt: new Date(reminder.createdAt),
      };
      await db.put('reminders', updatedReminder);
      return true;
    }
    return false;
  }

  const newReminder = {
    ...reminder,
    userId: options.userId || reminder.userId,
    reminderDate: new Date(reminder.reminderDate),
    createdAt: new Date(reminder.createdAt),
  };
  await db.add('reminders', newReminder);
  return true;
}

/**
 * Base64文字列をBlobに変換
 */
async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}

/**
 * エクスポートデータの検証
 */
export function validateExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const exportData = data as Partial<ExportData>;

  // 必須フィールドのチェック
  if (!exportData.version || !exportData.exportDate || !exportData.data) {
    return false;
  }

  // データ構造のチェック
  const { gifts, persons, returns, images, reminders } = exportData.data;
  if (!Array.isArray(gifts) || !Array.isArray(persons) || 
      !Array.isArray(returns) || !Array.isArray(images) || 
      !Array.isArray(reminders)) {
    return false;
  }

  return true;
}
