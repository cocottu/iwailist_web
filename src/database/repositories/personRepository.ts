import { getDB } from '../schema';
import { Person } from '@/types';

export class PersonRepository {
  async create(person: Person): Promise<void> {
    const db = await getDB();
    await db.add('persons', person);
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
  }
  
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('persons', id);
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
