/**
 * 認証コンテキスト
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../lib/firebase';
import { User, convertFirebaseUser } from '../types/firebase';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled() || !auth) {
      setLoading(false);
      return;
    }

    // 認証状態の永続化設定
    authService.setPersistence().catch(console.error);

    // 認証状態の監視
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // トークンをローカルストレージに保存
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('authToken', token);

            // ユーザー情報を設定
            setUser(convertFirebaseUser(firebaseUser));
          } catch (error) {
            console.error('Error getting user token:', error);
            setUser(null);
          }
        } else {
          // ログアウト状態
          localStorage.removeItem('authToken');
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    );

    // トークンの定期更新 (55分ごと)
    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true); // 強制更新
          localStorage.setItem('authToken', token);
        } catch (error) {
          console.error('Token refresh failed:', error);
          // 再ログイン促進
          await authService.signOut();
        }
      }
    }, 55 * 60 * 1000); // 55分

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const user = await authService.signUpWithEmail(email, password, displayName);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await authService.sendPasswordReset(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
