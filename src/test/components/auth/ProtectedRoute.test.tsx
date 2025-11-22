import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import * as AuthContext from '../../../contexts/AuthContext';
import * as firebaseLib from '../../../lib/firebase';

// AuthContextのモック
vi.mock('../../../contexts/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  };
});

// Lib Firebaseのモック
vi.mock('../../../lib/firebase', () => {
  return {
    isFirebaseEnabled: vi.fn(),
  };
});

// Loadingコンポーネントのモック
vi.mock('../../../components/ui/Loading', () => {
  return {
    Loading: () => <div data-testid="loading">Loading...</div>,
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Firebaseが無効な場合はchildrenを表示する', () => {
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);
    (AuthContext.useAuth as any).mockReturnValue({ isAuthenticated: false, loading: false });

    render(
        <MemoryRouter>
            <ProtectedRoute>
                <div data-testid="child">Child Content</div>
            </ProtectedRoute>
        </MemoryRouter>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('読み込み中はLoadingを表示する', () => {
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (AuthContext.useAuth as any).mockReturnValue({ isAuthenticated: false, loading: true });

    render(
        <MemoryRouter>
            <ProtectedRoute>
                <div data-testid="child">Child Content</div>
            </ProtectedRoute>
        </MemoryRouter>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('未認証の場合はログインページへリダイレクトする', () => {
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (AuthContext.useAuth as any).mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="child">Child Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('認証済みの場合はchildrenを表示する', () => {
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (AuthContext.useAuth as any).mockReturnValue({ isAuthenticated: true, loading: false });

    render(
        <MemoryRouter>
            <ProtectedRoute>
                <div data-testid="child">Child Content</div>
            </ProtectedRoute>
        </MemoryRouter>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
