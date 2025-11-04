/**
 * Firestore Person Repository
 */
import { firestoreService, orderBy } from '../../services/firestoreService';
import { Person, Relationship } from '../../types';
import { FirestorePerson } from '../../types/firebase';

class FirestorePersonRepository {
  /**
   * 人物を作成（自動ID生成）
   */
  async create(userId: string, person: Omit<Person, 'id'>): Promise<string> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');
    const personId = crypto.randomUUID();

    const firestorePerson: Omit<FirestorePerson, 'createdAt' | 'updatedAt'> = {
      name: person.name,
      furigana: person.furigana,
      relationship: person.relationship,
      contact: person.contact,
      memo: person.memo,
    };

    await firestoreService.createDocument(collectionPath, personId, firestorePerson);
    return personId;
  }

  /**
   * 人物を作成（ID指定）
   */
  async createWithId(userId: string, personId: string, person: Omit<Person, 'id' | 'userId'>): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');

    const firestorePerson: Omit<FirestorePerson, 'createdAt' | 'updatedAt'> = {
      name: person.name,
      furigana: person.furigana,
      relationship: person.relationship,
      contact: person.contact,
      memo: person.memo,
    };

    await firestoreService.createDocument(collectionPath, personId, firestorePerson);
  }

  /**
   * 人物を取得
   */
  async get(userId: string, personId: string): Promise<Person | null> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');
    const firestorePerson = await firestoreService.getDocument<
      FirestorePerson & { id: string }
    >(collectionPath, personId);

    if (!firestorePerson) {
      return null;
    }

    return this.convertToPerson(firestorePerson, userId);
  }

  /**
   * 全人物を取得
   */
  async getAll(userId: string): Promise<Person[]> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');
    const firestorePersons = await firestoreService.queryDocuments<
      FirestorePerson & { id: string }
    >(collectionPath, [orderBy('name', 'asc')]);

    return firestorePersons.map((fp) => this.convertToPerson(fp, userId));
  }

  /**
   * 人物を更新
   */
  async update(userId: string, personId: string, updates: Partial<Person>): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');

    const firestoreUpdates: Partial<FirestorePerson> = {};

    if (updates.name !== undefined) firestoreUpdates.name = updates.name;
    if (updates.furigana !== undefined) firestoreUpdates.furigana = updates.furigana;
    if (updates.relationship !== undefined) firestoreUpdates.relationship = updates.relationship;
    if (updates.contact !== undefined) firestoreUpdates.contact = updates.contact;
    if (updates.memo !== undefined) firestoreUpdates.memo = updates.memo;

    await firestoreService.updateDocument(collectionPath, personId, firestoreUpdates);
  }

  /**
   * 人物を削除
   */
  async delete(userId: string, personId: string): Promise<void> {
    const collectionPath = firestoreService.getUserCollectionPath(userId, 'persons');
    await firestoreService.deleteDocument(collectionPath, personId);
  }

  /**
   * FirestorePerson → Person変換
   */
  private convertToPerson(firestorePerson: FirestorePerson & { id: string }, userId?: string): Person {
    return {
      id: firestorePerson.id,
      userId: userId || '',
      name: firestorePerson.name,
      furigana: firestorePerson.furigana,
      relationship: firestorePerson.relationship as Relationship,
      contact: firestorePerson.contact,
      memo: firestorePerson.memo,
      createdAt: firestorePerson.createdAt.toDate(),
      updatedAt: firestorePerson.updatedAt.toDate(),
    };
  }
}

export const firestorePersonRepository = new FirestorePersonRepository();
