/**
 * Firestore Gift Repository
 */
import { Timestamp } from 'firebase/firestore';
import { firestoreService, where, orderBy } from '../../services/firestoreService';
import { Gift, GiftCategory, ReturnStatus } from '../../types';
import { FirestoreGift } from '../../types/firebase';

class FirestoreGiftRepository {
  /**
   * 贈答品を作成（自動ID生成）
   */
  async create(userId: string, gift: Omit<Gift, 'id'>): Promise<string> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    const giftId = crypto.randomUUID();

    const firestoreGift: Omit<FirestoreGift, 'createdAt' | 'updatedAt'> = {
      personId: gift.personId,
      giftName: gift.giftName,
      receivedDate: Timestamp.fromDate(gift.receivedDate),
      amount: gift.amount,
      category: gift.category,
      returnStatus: gift.returnStatus,
      memo: gift.memo,
      syncStatus: 'synced',
    };

    await firestoreService.createDocument(collectionPath, giftId, firestoreGift);
    return giftId;
  }

  /**
   * 贈答品を作成（ID指定）
   */
  async createWithId(userId: string, giftId: string, gift: Omit<Gift, 'id' | 'userId'>): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');

    const firestoreGift: Omit<FirestoreGift, 'createdAt' | 'updatedAt'> = {
      personId: gift.personId,
      giftName: gift.giftName,
      receivedDate: Timestamp.fromDate(gift.receivedDate),
      amount: gift.amount,
      category: gift.category,
      returnStatus: gift.returnStatus,
      memo: gift.memo,
      syncStatus: 'synced',
    };

    await firestoreService.createDocument(collectionPath, giftId, firestoreGift);
  }

  /**
   * 贈答品を取得
   */
  async get(userId: string, giftId: string): Promise<Gift | null> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    const firestoreGift = await firestoreService.getDocument<FirestoreGift & { id: string }>(
      collectionPath,
      giftId
    );

    if (!firestoreGift) {
      return null;
    }

    return this.convertToGift(firestoreGift, userId);
  }

  /**
   * 全贈答品を取得
   */
  async getAll(userId: string): Promise<Gift[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    const firestoreGifts = await firestoreService.queryDocuments<FirestoreGift & { id: string }>(
      collectionPath,
      [orderBy('receivedDate', 'desc')]
    );

    return firestoreGifts.map((fg) => this.convertToGift(fg, userId));
  }

  /**
   * 贈答品を更新
   */
  async update(userId: string, giftId: string, updates: Partial<Gift>): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');

    const firestoreUpdates: Partial<FirestoreGift> = {};

    if (updates.giftName !== undefined) firestoreUpdates.giftName = updates.giftName;
    if (updates.personId !== undefined) firestoreUpdates.personId = updates.personId;
    if (updates.receivedDate !== undefined) {
      firestoreUpdates.receivedDate = Timestamp.fromDate(updates.receivedDate);
    }
    if (updates.amount !== undefined) firestoreUpdates.amount = updates.amount;
    if (updates.category !== undefined) firestoreUpdates.category = updates.category;
    if (updates.returnStatus !== undefined) firestoreUpdates.returnStatus = updates.returnStatus;
    if (updates.memo !== undefined) firestoreUpdates.memo = updates.memo;

    await firestoreService.updateDocument(collectionPath, giftId, firestoreUpdates);
  }

  /**
   * 贈答品を削除
   */
  async delete(userId: string, giftId: string): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    await firestoreService.deleteDocument(collectionPath, giftId);
  }

  /**
   * お返し状況でフィルタリング
   */
  async getByReturnStatus(
    userId: string,
    status: 'pending' | 'completed' | 'not_required'
  ): Promise<Gift[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    const firestoreGifts = await firestoreService.queryDocuments<FirestoreGift & { id: string }>(
      collectionPath,
      [
        where('returnStatus', '==', status),
        orderBy('receivedDate', 'desc'),
      ]
    );

    return firestoreGifts.map((fg) => this.convertToGift(fg, userId));
  }

  /**
   * 人物IDでフィルタリング
   */
  async getByPersonId(userId: string, personId: string): Promise<Gift[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'gifts');
    const firestoreGifts = await firestoreService.queryDocuments<FirestoreGift & { id: string }>(
      collectionPath,
      [
        where('personId', '==', personId),
        orderBy('receivedDate', 'desc'),
      ]
    );

    return firestoreGifts.map((fg) => this.convertToGift(fg, userId));
  }

  /**
   * FirestoreGift → Gift変換
   */
  private convertToGift(firestoreGift: FirestoreGift & { id: string }, userId?: string): Gift {
    return {
      id: firestoreGift.id,
      userId: userId || '',
      personId: firestoreGift.personId,
      giftName: firestoreGift.giftName,
      receivedDate: firestoreGift.receivedDate.toDate(),
      amount: firestoreGift.amount,
      category: firestoreGift.category as GiftCategory,
      returnStatus: firestoreGift.returnStatus as ReturnStatus,
      memo: firestoreGift.memo,
      createdAt: firestoreGift.createdAt.toDate(),
      updatedAt: firestoreGift.updatedAt.toDate(),
    };
  }
}

export const firestoreGiftRepository = new FirestoreGiftRepository();
