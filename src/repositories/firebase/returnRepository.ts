/**
 * Firestore Return Repository
 */
import { Timestamp } from 'firebase/firestore';
import { firestoreService, orderBy } from '../../services/firestoreService';
import { Return } from '../../types';
import { FirestoreReturn } from '../../types/firebase';

class FirestoreReturnRepository {
  /**
   * お返しを作成
   */
  async create(
    userId: string,
    giftId: string,
    returnData: Omit<Return, 'id' | 'giftId' | 'createdAt'>
  ): Promise<string> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, `gifts/${giftId}/returns`);
    const returnId = crypto.randomUUID();

    const firestoreReturn: Omit<FirestoreReturn, 'createdAt'> = {
      returnName: returnData.returnName,
      returnDate: Timestamp.fromDate(returnData.returnDate),
      amount: returnData.amount,
      memo: returnData.memo,
    };

    await firestoreService.createDocument(collectionPath, returnId, firestoreReturn);
    return returnId;
  }

  /**
   * お返しを取得
   */
  async get(userId: string, giftId: string, returnId: string): Promise<Return | null> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, `gifts/${giftId}/returns`);
    const firestoreReturn = await firestoreService.getDocument<FirestoreReturn & { id: string }>(
      collectionPath,
      returnId
    );

    if (!firestoreReturn) {
      return null;
    }

    return this.convertToReturn(firestoreReturn, giftId);
  }

  /**
   * 贈答品のお返し一覧を取得
   */
  async getByGiftId(userId: string, giftId: string): Promise<Return[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, `gifts/${giftId}/returns`);
    const firestoreReturns = await firestoreService.queryDocuments<FirestoreReturn & { id: string }>(
      collectionPath,
      [orderBy('returnDate', 'desc')]
    );

    return firestoreReturns.map((fr) => this.convertToReturn(fr, giftId));
  }

  /**
   * お返しを更新
   */
  async update(
    userId: string,
    giftId: string,
    returnId: string,
    updates: Partial<Return>
  ): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, `gifts/${giftId}/returns`);

    const firestoreUpdates: Partial<FirestoreReturn> = {};

    if (updates.returnName !== undefined) firestoreUpdates.returnName = updates.returnName;
    if (updates.returnDate !== undefined) {
      firestoreUpdates.returnDate = Timestamp.fromDate(updates.returnDate);
    }
    if (updates.amount !== undefined) firestoreUpdates.amount = updates.amount;
    if (updates.memo !== undefined) firestoreUpdates.memo = updates.memo;

    await firestoreService.updateDocument(collectionPath, returnId, firestoreUpdates);
  }

  /**
   * お返しを削除
   */
  async delete(userId: string, giftId: string, returnId: string): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, `gifts/${giftId}/returns`);
    await firestoreService.deleteDocument(collectionPath, returnId);
  }

  /**
   * 贈答品の全お返しを削除
   */
  async deleteByGiftId(userId: string, giftId: string): Promise<void> {
    const returns = await this.getByGiftId(userId, giftId);
    
    for (const returnData of returns) {
      await this.delete(userId, giftId, returnData.id);
    }
  }

  /**
   * FirestoreReturn → Return変換
   */
  private convertToReturn(firestoreReturn: FirestoreReturn & { id: string }, giftId: string): Return {
    return {
      id: firestoreReturn.id,
      giftId: giftId,
      returnName: firestoreReturn.returnName,
      returnDate: firestoreReturn.returnDate.toDate(),
      amount: firestoreReturn.amount,
      memo: firestoreReturn.memo,
      createdAt: firestoreReturn.createdAt.toDate(),
    };
  }
}

export const firestoreReturnRepository = new FirestoreReturnRepository();
