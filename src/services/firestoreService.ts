/**
 * Firestore基本サービス
 */
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from '../lib/firebase';

class FirestoreService {
  /**
   * ドキュメント作成
   */
  async createDocument<T extends DocumentData>(
    collectionPath: string,
    docId: string,
    data: T
  ): Promise<void> {
    console.log('[FirestoreService] createDocument called');
    console.log('[FirestoreService] Collection path:', collectionPath);
    console.log('[FirestoreService] Document ID:', docId);
    console.log('[FirestoreService] isFirebaseEnabled:', isFirebaseEnabled());
    console.log('[FirestoreService] db:', db ? 'initialized' : 'null');
    
    if (!isFirebaseEnabled() || !db) {
      const error = new Error('Firestore is not enabled');
      console.error('[FirestoreService] Error:', error);
      throw error;
    }

    const docRef = doc(db, collectionPath, docId);
    console.log('[FirestoreService] Document reference created:', docRef.path);
    
    try {
      const sanitizedData = this.removeUndefined(data ?? {});
      await setDoc(docRef, {
        ...sanitizedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('[FirestoreService] Document successfully created:', docRef.path);
    } catch (error) {
      console.error('[FirestoreService] setDoc failed:', error);
      throw error;
    }
  }

  /**
   * ドキュメント取得
   */
  async getDocument<T>(
    collectionPath: string,
    docId: string
  ): Promise<T | null> {
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  }

  /**
   * ドキュメント更新
   */
  async updateDocument<T extends DocumentData>(
    collectionPath: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const docRef = doc(db, collectionPath, docId);
    const sanitizedData = this.removeUndefined(data ?? {});
    await updateDoc(docRef, {
      ...sanitizedData,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * ドキュメント削除
   */
  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  }

  /**
   * コレクション内の全ドキュメント取得
   */
  async getCollection<T>(collectionPath: string): Promise<T[]> {
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const collectionRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(collectionRef);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  /**
   * クエリ実行
   */
  async queryDocuments<T>(
    collectionPath: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  /**
   * ユーザー専用のコレクションパスを生成
   */
  getUserCollectionPath(userId: string, collectionName: string): string {
    return `users/${userId}/${collectionName}`;
  }

  /**
   * Timestamp → Date変換
   */
  timestampToDate(timestamp: Timestamp | undefined): Date | undefined {
    return timestamp ? timestamp.toDate() : undefined;
  }

  /**
   * Date → Timestamp変換
   */
  dateToTimestamp(date: Date | undefined): Timestamp | undefined {
    return date ? Timestamp.fromDate(date) : undefined;
  }

  private removeUndefined<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Timestamp || obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.removeUndefined(item))
        .filter((item) => item !== undefined) as unknown as T;
    }

    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      const entries = Object.entries(obj as Record<string, unknown>);

      for (const [key, value] of entries) {
        if (value === undefined) {
          continue;
        }

        const isPlainObject =
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Timestamp) &&
          !(value instanceof Date) &&
          value.constructor === Object;

        if (isPlainObject) {
          result[key] = this.removeUndefined(value);
        } else if (Array.isArray(value)) {
          result[key] = this.removeUndefined(value);
        } else {
          result[key] = value;
        }
      }

      return result as T;
    }

    return obj;
  }
}

export const firestoreService = new FirestoreService();

// ヘルパー関数
export { where, orderBy, limit, serverTimestamp };
