/**
 * データエクスポートサービス
 * IndexedDBのデータをJSON形式でエクスポート
 */

import { getDB } from '@/database';
import { Gift, Person, Return, Image, Reminder } from '@/types';

export interface ExportData {
  version: string;
  exportDate: string;
  userId: string | null;
  data: {
    gifts: Gift[];
    persons: Person[];
    returns: Return[];
    images: ExportImage[];
    reminders: Reminder[];
  };
  metadata: {
    giftsCount: number;
    personsCount: number;
    returnsCount: number;
    imagesCount: number;
    remindersCount: number;
  };
}

export interface ExportImage extends Omit<Image, 'imageData'> {
  imageData: string; // Base64エンコードされた画像データ
}

/**
 * 全データをエクスポート
 */
export async function exportAllData(userId: string | null): Promise<ExportData> {
  const db = await getDB();

  // 各テーブルからデータを取得
  const gifts = await db.getAll('gifts');
  const persons = await db.getAll('persons');
  const returns = await db.getAll('returns');
  const images = await db.getAll('images');
  const reminders = await db.getAll('reminders');

  // ユーザーIDでフィルタリング（ログイン時のみ）
  const filteredGifts = userId ? gifts.filter(g => g.userId === userId) : gifts;
  const filteredPersons = userId ? persons.filter(p => p.userId === userId) : persons;
  const filteredReminders = userId ? reminders.filter(r => r.userId === userId) : reminders;

  // お返しと画像は贈答品に紐づくのでフィルタリング
  const giftIds = new Set(filteredGifts.map(g => g.id));
  const filteredReturns = returns.filter(r => giftIds.has(r.giftId));
  const filteredImages = images.filter(img => {
    if (img.entityType === 'gift') {
      return giftIds.has(img.entityId);
    }
    // お返しの画像
    const returnIds = new Set(filteredReturns.map(r => r.id));
    return returnIds.has(img.entityId);
  });

  // 画像データをBase64に変換
  const exportImages: ExportImage[] = await Promise.all(
    filteredImages.map(async (img) => {
      // imageDataが存在する場合のみBase64に変換
      const base64 = img.imageData ? await blobToBase64(img.imageData) : '';
      return {
        ...img,
        imageData: base64,
      };
    })
  );

  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    userId,
    data: {
      gifts: filteredGifts,
      persons: filteredPersons,
      returns: filteredReturns,
      images: exportImages,
      reminders: filteredReminders,
    },
    metadata: {
      giftsCount: filteredGifts.length,
      personsCount: filteredPersons.length,
      returnsCount: filteredReturns.length,
      imagesCount: exportImages.length,
      remindersCount: filteredReminders.length,
    },
  };

  return exportData;
}

/**
 * データをJSONファイルとしてダウンロード
 */
export async function downloadExportData(userId: string | null): Promise<void> {
  const exportData = await exportAllData(userId);
  
  // JSONを文字列化
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Blobを作成
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // ダウンロードリンクを作成
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `iwailist-export-${new Date().toISOString().split('T')[0]}.json`;
  
  // クリックしてダウンロード
  document.body.appendChild(link);
  link.click();
  
  // クリーンアップ
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 特定のエンティティのみをエクスポート
 */
export async function exportEntity(
  entityType: 'gifts' | 'persons' | 'returns' | 'reminders',
  entityId: string
): Promise<void> {
  const db = await getDB();
  
  let data: unknown;
  let filename: string;

  switch (entityType) {
    case 'gifts': {
      const gift = await db.get('gifts', entityId);
      if (!gift) throw new Error('贈答品が見つかりません');
      
      // 関連するお返しと画像も含める
      const returns = await db.getAllFromIndex('returns', 'giftId', entityId);
      const images = await db.getAllFromIndex('images', 'entityId', entityId);
      
      // 画像をBase64に変換
      const exportImages = await Promise.all(
        images.map(async (img) => ({
          ...img,
          imageData: img.imageData ? await blobToBase64(img.imageData) : '',
        }))
      );
      
      data = {
        gift,
        returns,
        images: exportImages,
      };
      filename = `gift-${entityId}-${Date.now()}.json`;
      break;
    }
    case 'persons': {
      const person = await db.get('persons', entityId);
      if (!person) throw new Error('人物が見つかりません');
      data = person;
      filename = `person-${entityId}-${Date.now()}.json`;
      break;
    }
    case 'returns': {
      const returnItem = await db.get('returns', entityId);
      if (!returnItem) throw new Error('お返しが見つかりません');
      data = returnItem;
      filename = `return-${entityId}-${Date.now()}.json`;
      break;
    }
    case 'reminders': {
      const reminder = await db.get('reminders', entityId);
      if (!reminder) throw new Error('リマインダーが見つかりません');
      data = reminder;
      filename = `reminder-${entityId}-${Date.now()}.json`;
      break;
    }
  }

  // ダウンロード
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * BlobをBase64文字列に変換
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * エクスポートデータのサイズを取得（MB単位）
 */
export async function getExportDataSize(userId: string | null): Promise<number> {
  const exportData = await exportAllData(userId);
  const jsonString = JSON.stringify(exportData);
  const sizeInBytes = new Blob([jsonString]).size;
  return sizeInBytes / (1024 * 1024); // MB
}
