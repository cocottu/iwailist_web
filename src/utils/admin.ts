/**
 * 運営者判定ユーティリティ
 * Firestoreのユーザードキュメントから運営者フラグを取得
 */

import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseEnabled } from '@/lib/firebase';

// キャッシュ用の変数
let adminStatusCache: Record<string, { isAdmin: boolean; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5分間キャッシュ

/**
 * ユーザーが運営者かどうかを確認する
 * Firestoreのユーザードキュメントの isAdmin フィールドをチェック
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  if (!isFirebaseEnabled() || !db) {
    return false;
  }

  // キャッシュをチェック
  const cached = adminStatusCache[userId];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.isAdmin;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      // ドキュメントが存在しない場合は管理者ではない
      adminStatusCache[userId] = { isAdmin: false, timestamp: Date.now() };
      return false;
    }

    const userData = userDoc.data();
    const adminStatus = userData?.isAdmin === true;

    // キャッシュに保存
    adminStatusCache[userId] = { isAdmin: adminStatus, timestamp: Date.now() };

    return adminStatus;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
};

/**
 * キャッシュをクリア
 */
export const clearAdminCache = (userId?: string) => {
  if (userId) {
    delete adminStatusCache[userId];
  } else {
    adminStatusCache = {};
  }
};

/**
 * キャッシュを強制的に更新
 */
export const refreshAdminStatus = async (userId: string): Promise<boolean> => {
  clearAdminCache(userId);
  return isAdmin(userId);
};
