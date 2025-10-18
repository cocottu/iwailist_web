import { getDB } from '../schema';
import { Image } from '@/types';

export class ImageRepository {
  async create(image: Image): Promise<void> {
    const db = await getDB();
    await db.add('images', image);
  }
  
  async get(id: string): Promise<Image | undefined> {
    const db = await getDB();
    return await db.get('images', id);
  }
  
  async getByEntityId(entityId: string): Promise<Image[]> {
    const db = await getDB();
    return await db.getAllFromIndex('images', 'entityId', entityId);
  }
  
  async getByEntityType(entityType: 'gift' | 'return'): Promise<Image[]> {
    const db = await getDB();
    return await db.getAllFromIndex('images', 'entityType', entityType);
  }
  
  async update(image: Image): Promise<void> {
    const db = await getDB();
    await db.put('images', image);
  }
  
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('images', id);
  }
  
  async deleteByEntityId(entityId: string): Promise<void> {
    const db = await getDB();
    const images = await this.getByEntityId(entityId);
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    
    for (const image of images) {
      await store.delete(image.id);
    }
    
    await tx.done;
  }
  
  async reorder(entityId: string, imageIds: string[]): Promise<void> {
    const db = await getDB();
    const images = await this.getByEntityId(entityId);
    
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    
    for (let i = 0; i < imageIds.length; i++) {
      const image = images.find(img => img.id === imageIds[i]);
      if (image) {
        image.order = i;
        await store.put(image);
      }
    }
    
    await tx.done;
  }
}
