/**
 * Firebase Authentication サービス
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
      console.error('Firebase is not enabled. Please check your environment variables.');
      throw new Error('Firebase is not enabled');
    }

    console.log('Starting Google sign-in process...');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      let result;
      
      try {
        // ポップアップ方式を試行
        console.log('Attempting popup sign-in...');
        result = await signInWithPopup(auth, provider);
        console.log('Popup sign-in successful');
      } catch (popupError: unknown) {
        console.error('Popup sign-in error:', popupError);
        
        // ポップアップがブロックされた場合はリダイレクト方式にフォールバック
        if (
          typeof popupError === 'object' && 
          popupError !== null && 
          'code' in popupError && 
          (popupError as { code: string }).code === 'auth/popup-blocked'
        ) {
          console.log('Popup blocked, falling back to redirect method');
          await signInWithRedirect(auth, provider);
          // リダイレクト方式の場合は即座にreturnせず、リダイレクトが完了するのを待つ
          throw new Error('Redirecting to Google login...');
        }
        throw popupError;
      }

      // 初回ログイン時はFirestoreにユーザープロファイル作成
      console.log('Creating/checking user profile in Firestore...');
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('Creating new user profile...');
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        console.log('User profile already exists');
      }

      console.log('Google sign-in completed successfully');
      return convertFirebaseUser(result.user);
    } catch (error: unknown) {
      console.error('Google sign-in failed:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * リダイレクト認証の結果を処理
   */
  async handleRedirectResult(): Promise<User | null> {
    if (!isFirebaseEnabled() || !auth || !db) {
      return null;
    }

    try {
      const result = await getRedirectResult(auth);
      
      if (!result || !result.user) {
        return null;
      }

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
      console.error('Redirect result error:', error);
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
        // Google OAuth関連エラー
        case AuthErrorCode.POPUP_CLOSED_BY_USER:
          return new Error('ログインがキャンセルされました');
        case AuthErrorCode.POPUP_BLOCKED:
          return new Error('ポップアップがブロックされました。ポップアップを許可してから再試行してください');
        case AuthErrorCode.UNAUTHORIZED_DOMAIN:
          return new Error('このドメインは認証が許可されていません。Firebase Consoleで承認済みドメインを確認してください');
        case AuthErrorCode.CANCELLED_POPUP_REQUEST:
          return new Error('ログインリクエストがキャンセルされました');
        case AuthErrorCode.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
          return new Error('このメールアドレスは既に別の認証方法で登録されています');
        default:
          // エラーコードをログに出力（デバッグ用）
          console.error('Unhandled auth error code:', code);
          return new Error(`認証エラーが発生しました (${code})`);
      }
    }

    return error instanceof Error ? error : new Error('不明なエラーが発生しました');
  }
}

export const authService = new AuthService();
