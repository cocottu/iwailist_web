import { getDB } from '../schema';
import { Return } from '@/types';

export class ReturnRepository {
  async create(returnData: Return): Promise<void> {
    const db = await getDB();
    await db.add('returns', returnData);
  }
  
  async get(id: string): Promise<Return | undefined> {
    const db = await getDB();
    return await db.get('returns', id);
  }
  
  async getByGiftId(giftId: string): Promise<Return[]> {
    const db = await getDB();
    return await db.getAllFromIndex('returns', 'giftId', giftId);
  }
  
  async update(returnData: Return): Promise<void> {
    const db = await getDB();
    await db.put('returns', returnData);
  }
  
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('returns', id);
  }
  
  async deleteByGiftId(giftId: string): Promise<void> {
    const db = await getDB();
    const returns = await this.getByGiftId(giftId);
    const tx = db.transaction('returns', 'readwrite');
    const store = tx.objectStore('returns');
    
    for (const returnData of returns) {
      await store.delete(returnData.id);
    }
    
    await tx.done;
  }
}
