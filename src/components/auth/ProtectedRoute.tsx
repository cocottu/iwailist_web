/**
 * 認証保護ルート
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isFirebaseEnabled } from '../../lib/firebase';
import { Loading } from '../ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Firebase無効の場合はそのまま表示（オフラインモード）
  if (!isFirebaseEnabled()) {
    return <>{children}</>;
  }

  // 読み込み中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // 未認証の場合はログインページへ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
