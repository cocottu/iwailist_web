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
    if (!isFirebaseEnabled() || !db) {
      throw new Error('Firestore is not enabled');
    }

    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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
    await updateDoc(docRef, {
      ...data,
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
}

export const firestoreService = new FirestoreService();

// ヘルパー関数
export { where, orderBy, limit, serverTimestamp };
