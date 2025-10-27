import { getDB } from '../schema';
import { Person } from '@/types';
import { firestorePersonRepository } from '@/repositories/firebase/personRepository';
import { isFirebaseEnabled } from '@/lib/firebase';

export class PersonRepository {
  async create(person: Person): Promise<void> {
    const db = await getDB();
    await db.add('persons', person);
    
    // Firestoreに同期（同じIDを使用）
    if (isFirebaseEnabled() && person.userId && person.id) {
      try {
        // IDを含む完全なオブジェクトをFirestoreに保存
        const { id, userId, ...personData } = person;
        await firestorePersonRepository.createWithId(userId, id, personData);
      } catch (error) {
        console.error('Failed to sync person to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
      }
    }
  }
  
  async get(id: string): Promise<Person | undefined> {
    const db = await getDB();
    return await db.get('persons', id);
  }
  
  async getAll(userId: string): Promise<Person[]> {
    const db = await getDB();
    return await db.getAllFromIndex('persons', 'userId', userId);
  }
  
  async update(person: Person): Promise<void> {
    const db = await getDB();
    await db.put('persons', person);
    
    // Firestoreに同期
    if (isFirebaseEnabled() && person.userId) {
      try {
        await firestorePersonRepository.update(person.userId, person.id, person);
      } catch (error) {
        console.error('Failed to sync person update to Firestore:', error);
        // IndexedDBには保存されているので、エラーは無視（後で同期マネージャーが再試行）
      }
    }
  }
  
  async delete(id: string, userId?: string): Promise<void> {
    const db = await getDB();
    await db.delete('persons', id);
    
    // Firestoreに同期
    if (isFirebaseEnabled() && userId) {
      try {
        await firestorePersonRepository.delete(userId, id);
      } catch (error) {
        console.error('Failed to sync person deletion to Firestore:', error);
        // IndexedDBからは削除されているので、エラーは無視
      }
    }
  }
  
  async search(userId: string, searchText: string): Promise<Person[]> {
    const db = await getDB();
    const persons = await db.getAllFromIndex('persons', 'userId', userId);
    
    const searchLower = searchText.toLowerCase();
    return persons.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.furigana?.toLowerCase().includes(searchLower) ||
      p.memo?.toLowerCase().includes(searchLower)
    );
  }
  
  async getByName(userId: string, name: string): Promise<Person | undefined> {
    const db = await getDB();
    const persons = await db.getAllFromIndex('persons', 'userId', userId);
    return persons.find(p => p.name === name);
  }
}
