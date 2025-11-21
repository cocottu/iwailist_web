import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import * as AuthContext from '../../contexts/AuthContext';
import * as firebaseLib from '../../lib/firebase';

// React Router DOMのモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// AuthContextのモック
vi.mock('../../contexts/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  };
});

// Lib Firebaseのモック
vi.mock('../../lib/firebase', () => {
  return {
    isFirebaseEnabled: vi.fn(),
    getFirebaseConfigStatus: vi.fn(),
  };
});

describe('Login Page', () => {
  const mockSignIn = vi.fn();
  const mockSignInWithGoogle = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (AuthContext.useAuth as any).mockReturnValue({
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      isAuthenticated: false,
      loading: false,
    });
  });

  it('ログインページが正しく描画される', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Googleでログイン/ })).toBeInTheDocument();
  });

  it('メールアドレスとパスワードでログインできる', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('example@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  it('ログイン成功時にリダイレクトする', async () => {
    mockSignIn.mockResolvedValue(undefined);
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('example@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('ログインエラー時にエラーメッセージを表示する', async () => {
    mockSignIn.mockRejectedValue(new Error('Login failed'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('example@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('Googleログインを実行できる', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Googleでログイン/ }));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
  
  it('Googleログインエラー時にエラーメッセージを表示する', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('Google Login failed'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Googleでログイン/ }));

    await waitFor(() => {
      expect(screen.getByText('Google Login failed')).toBeInTheDocument();
    });
  });

  it('認証済みの場合はリダイレクトする', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('ローディング中はローディング表示になる', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('認証状態を確認中...')).toBeInTheDocument();
  });

  it('Firebaseが無効な場合は警告を表示する', () => {
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);
    (firebaseLib.getFirebaseConfigStatus as any).mockReturnValue({ status: {}, missing: [] });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Firebase設定が完了していません。環境変数を設定してください。')).toBeInTheDocument();
  });
});
