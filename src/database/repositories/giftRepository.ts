import { getDB } from '../schema';
import { Gift, GiftFilters } from '@/types';
import { firestoreGiftRepository } from '@/repositories/firebase/giftRepository';
import { isFirebaseEnabled } from '@/lib/firebase';

export class GiftRepository {
  async create(gift: Gift): Promise<void> {
    const db = await getDB();
    await db.add('gifts', gift);
    
    console.log('[GiftRepository] Gift added to IndexedDB:', gift.id);
    console.log('[GiftRepository] Firebase enabled:', isFirebaseEnabled());
    console.log('[GiftRepository] Gift userId:', gift.userId);
    console.log('[GiftRepository] Gift id:', gift.id);
    
    // Firestoreに同期（同じIDを使用）
    if (isFirebaseEnabled() && gift.userId && gift.id) {
      try {
        console.log('[GiftRepository] Syncing gift to Firestore...');
        // IDを含む完全なオブジェクトをFirestoreに保存
        const { id, userId, ...giftData } = gift;
        await firestoreGiftRepository.createWithId(userId, id, giftData);
        console.log('[GiftRepository] Gift successfully synced to Firestore:', id);
      } catch (error) {
        console.error('[GiftRepository] Failed to sync gift to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
      }
    } else {
      console.warn('[GiftRepository] Skipping Firestore sync - Firebase enabled:', isFirebaseEnabled(), ', userId:', gift.userId, ', id:', gift.id);
    }
  }
  
  async get(id: string): Promise<Gift | undefined> {
    const db = await getDB();
    return await db.get('gifts', id);
  }
  
  async getAll(userId: string): Promise<Gift[]> {
    const db = await getDB();
    return await db.getAllFromIndex('gifts', 'userId', userId);
  }
  
  async update(gift: Gift): Promise<void> {
    const db = await getDB();
    await db.put('gifts', gift);
    
    // Firestoreに同期
    if (isFirebaseEnabled() && gift.userId) {
      try {
        await firestoreGiftRepository.update(gift.userId, gift.id, gift);
      } catch (error) {
        console.error('Failed to sync gift update to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
      }
    }
  }
  
  async delete(id: string, userId?: string): Promise<void> {
    const db = await getDB();
    await db.delete('gifts', id);
    
    // Firestoreに同期
    if (isFirebaseEnabled() && userId) {
      try {
        await firestoreGiftRepository.delete(userId, id);
      } catch (error) {
        console.error('Failed to sync gift deletion to Firestore:', error);
        // IndexedDBからは削除されているので、エラーは無視
      }
    }
  }
  
  async query(userId: string, filters: GiftFilters = {}): Promise<Gift[]> {
    const db = await getDB();
    let gifts = await db.getAllFromIndex('gifts', 'userId', userId);
    
    // フィルタリング
    if (filters.returnStatus) {
      gifts = gifts.filter(g => g.returnStatus === filters.returnStatus);
    }
    if (filters.category) {
      gifts = gifts.filter(g => g.category === filters.category);
    }
    if (filters.personId) {
      gifts = gifts.filter(g => g.personId === filters.personId);
    }
    if (filters.dateRange) {
      gifts = gifts.filter(g => 
        g.receivedDate >= filters.dateRange!.start &&
        g.receivedDate <= filters.dateRange!.end
      );
    }
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      gifts = gifts.filter(g => 
        g.giftName.toLowerCase().includes(searchText) ||
        g.memo?.toLowerCase().includes(searchText)
      );
    }
    
    // 日付でソート（新しい順）
    return gifts.sort((a, b) => b.receivedDate.getTime() - a.receivedDate.getTime());
  }
  
  async getByPersonId(personId: string): Promise<Gift[]> {
    const db = await getDB();
    return await db.getAllFromIndex('gifts', 'personId', personId);
  }
  
  async getPendingReturns(): Promise<Gift[]> {
    const db = await getDB();
    return await db.getAllFromIndex('gifts', 'returnStatus', 'pending');
  }
  
  async getStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    totalAmount: number;
    monthlyAmount: number;
  }> {
    const gifts = await this.getAll(userId);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const total = gifts.length;
    const pending = gifts.filter(g => g.returnStatus === 'pending').length;
    const completed = gifts.filter(g => g.returnStatus === 'completed').length;
    const totalAmount = gifts.reduce((sum, g) => sum + (g.amount || 0), 0);
    const monthlyAmount = gifts
      .filter(g => g.receivedDate >= thisMonth)
      .reduce((sum, g) => sum + (g.amount || 0), 0);
    
    return {
      total,
      pending,
      completed,
      totalAmount,
      monthlyAmount
    };
  }
}
