/**
 * Firebase Authentication サービス
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '../lib/firebase';
import { User, convertFirebaseUser, AuthErrorCode } from '../types/firebase';

class AuthService {
  /**
   * Email/Passwordでサインアップ
   */
  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> {
    if (!isFirebaseEnabled() || !auth || !db) {
      throw new Error('Firebase is not enabled');
    }

    try {
      // Firebase Authenticationでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // displayNameを設定
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Firestoreにユーザープロファイル作成
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: displayName || '',
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return convertFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Email/Passwordでログイン
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    if (!isFirebaseEnabled() || !auth) {
      throw new Error('Firebase is not enabled');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return convertFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Google OAuthでログイン
   */
  async signInWithGoogle(): Promise<User> {
    if (!isFirebaseEnabled() || !auth || !db) {
      throw new Error('Firebase is not enabled');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);

      // 初回ログイン時はFirestoreにユーザープロファイル作成
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return convertFirebaseUser(result.user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * ログアウト
   */
  async signOut(): Promise<void> {
    if (!isFirebaseEnabled() || !auth) {
      throw new Error('Firebase is not enabled');
    }

    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * パスワードリセットメール送信
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseEnabled() || !auth) {
      throw new Error('Firebase is not enabled');
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 認証状態の永続化設定
   */
  async setPersistence(): Promise<void> {
    if (!isFirebaseEnabled() || !auth) {
      throw new Error('Firebase is not enabled');
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser(): FirebaseUser | null {
    if (!isFirebaseEnabled() || !auth) {
      return null;
    }
    return auth.currentUser;
  }

  /**
   * 認証エラーハンドリング
   */
  private handleAuthError(error: unknown): Error {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code: string }).code;

      switch (code) {
        case AuthErrorCode.EMAIL_ALREADY_IN_USE:
          return new Error('このメールアドレスは既に使用されています');
        case AuthErrorCode.INVALID_EMAIL:
          return new Error('メールアドレスの形式が正しくありません');
        case AuthErrorCode.WEAK_PASSWORD:
          return new Error('パスワードは6文字以上で設定してください');
        case AuthErrorCode.USER_NOT_FOUND:
          return new Error('ユーザーが見つかりません');
        case AuthErrorCode.WRONG_PASSWORD:
          return new Error('パスワードが正しくありません');
        case AuthErrorCode.TOO_MANY_REQUESTS:
          return new Error('リクエストが多すぎます。しばらく待ってから再試行してください');
        case AuthErrorCode.NETWORK_REQUEST_FAILED:
          return new Error('ネットワークエラーが発生しました');
        default:
          return new Error('認証エラーが発生しました');
      }
    }

    return error instanceof Error ? error : new Error('不明なエラーが発生しました');
  }
}

export const authService = new AuthService();
