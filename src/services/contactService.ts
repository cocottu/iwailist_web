/**
 * お問い合わせサービス
 * Firestoreを使用したお問い合わせの送信・取得・返信機能
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import {
  Contact,
  ContactFormData,
  ContactReply,
  ContactStatus,
  ContactCategory,
} from '@/types';
import { FirestoreContact, FirestoreContactReply } from '@/types/firebase';

const CONTACTS_COLLECTION = 'contacts';

/**
 * Firestoreのお問い合わせデータをアプリ内の型に変換
 */
const convertFromFirestore = (id: string, data: FirestoreContact): Contact => {
  return {
    id,
    userId: data.userId,
    name: data.name,
    email: data.email,
    category: data.category as ContactCategory,
    message: data.message,
    status: data.status as ContactStatus,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    replies: (data.replies || []).map((reply: FirestoreContactReply) => ({
      id: reply.id,
      userId: reply.userId,
      isAdmin: reply.isAdmin,
      message: reply.message,
      createdAt: reply.createdAt.toDate(),
    })),
  };
};

/**
 * お問い合わせを送信
 */
export const submitContact = async (
  userId: string,
  formData: ContactFormData
): Promise<Contact> => {
  if (!isFirebaseEnabled() || !db) {
    throw new Error('Firebaseが有効になっていません');
  }

  const contactData: Omit<FirestoreContact, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    userId,
    name: formData.name || undefined,
    email: formData.email || undefined,
    category: formData.category,
    message: formData.message,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    replies: [],
  };

  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), contactData);
  
  // 作成したドキュメントを取得して返す
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('お問い合わせの作成に失敗しました');
  }

  return convertFromFirestore(docRef.id, docSnap.data() as FirestoreContact);
};

/**
 * ユーザーのお問い合わせ一覧を取得
 */
export const getUserContacts = async (userId: string): Promise<Contact[]> => {
  if (!isFirebaseEnabled() || !db) {
    return [];
  }

  const q = query(
    collection(db, CONTACTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) =>
    convertFromFirestore(doc.id, doc.data() as FirestoreContact)
  );
};

/**
 * 全てのお問い合わせを取得（管理者用）
 */
export const getAllContacts = async (): Promise<Contact[]> => {
  if (!isFirebaseEnabled() || !db) {
    return [];
  }

  const q = query(
    collection(db, CONTACTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) =>
    convertFromFirestore(doc.id, doc.data() as FirestoreContact)
  );
};

/**
 * お問い合わせを取得
 */
export const getContact = async (contactId: string): Promise<Contact | null> => {
  if (!isFirebaseEnabled() || !db) {
    return null;
  }

  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return convertFromFirestore(docSnap.id, docSnap.data() as FirestoreContact);
};

/**
 * お問い合わせに返信を追加
 */
export const addReply = async (
  contactId: string,
  userId: string,
  message: string,
  isAdmin: boolean
): Promise<ContactReply> => {
  if (!isFirebaseEnabled() || !db) {
    throw new Error('Firebaseが有効になっていません');
  }

  const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const reply: FirestoreContactReply = {
    id: replyId,
    userId,
    isAdmin,
    message,
    createdAt: Timestamp.now(),
  };

  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  await updateDoc(docRef, {
    replies: arrayUnion(reply),
    updatedAt: serverTimestamp(),
  });

  return {
    id: replyId,
    userId,
    isAdmin,
    message,
    createdAt: reply.createdAt.toDate(),
  };
};

/**
 * お問い合わせのステータスを更新（管理者用）
 */
export const updateContactStatus = async (
  contactId: string,
  status: ContactStatus
): Promise<void> => {
  if (!isFirebaseEnabled() || !db) {
    throw new Error('Firebaseが有効になっていません');
  }

  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

/**
 * カテゴリの表示名を取得
 */
export const getCategoryLabel = (category: ContactCategory): string => {
  switch (category) {
    case ContactCategory.BUG:
      return 'バグ報告';
    case ContactCategory.FEATURE:
      return '機能要望';
    case ContactCategory.OTHER:
      return 'その他';
    default:
      return 'その他';
  }
};

/**
 * ステータスの表示名を取得
 */
export const getStatusLabel = (status: ContactStatus): string => {
  switch (status) {
    case ContactStatus.OPEN:
      return '未対応';
    case ContactStatus.IN_PROGRESS:
      return '対応中';
    case ContactStatus.CLOSED:
      return '完了';
    default:
      return '不明';
  }
};

/**
 * ステータスの色クラスを取得
 */
export const getStatusColorClass = (status: ContactStatus): string => {
  switch (status) {
    case ContactStatus.OPEN:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case ContactStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case ContactStatus.CLOSED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};
