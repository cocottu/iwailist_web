import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from '../../pages/SignUp';
import { useAuth } from '../../contexts/AuthContext';
import { isFirebaseEnabled } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  isFirebaseEnabled: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  Link: (props: any) => <a href={props.to}>{props.children}</a>,
}));

describe('SignUp Page', () => {
  const mockNavigate = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignInWithGoogle = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useAuth as any).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      isAuthenticated: false,
      loading: false,
    });
    (isFirebaseEnabled as any).mockReturnValue(true);
  });

  it('renders sign up form', () => {
    render(<SignUp />);
    expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@example.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('redirects to dashboard if already authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    render(<SignUp />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to login if firebase is disabled', () => {
    (isFirebaseEnabled as any).mockReturnValue(false);
    render(<SignUp />);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows loading state while checking auth', () => {
    (useAuth as any).mockReturnValue({
      loading: true,
    });
    render(<SignUp />);
    expect(screen.getByText('認証状態を確認中...')).toBeInTheDocument();
  });

  it('validates password mismatch', () => {
    render(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('example@example.com'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('validates password length', () => {
    render(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('example@example.com'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: '12345' } });
    fireEvent.change(passwordInputs[1], { target: { value: '12345' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    expect(screen.getByText('パスワードは6文字以上で設定してください')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp with correct values', async () => {
    render(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('山田 太郎'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('example@example.com'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@test.com', 'password123', 'Test User');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles signUp error', async () => {
    mockSignUp.mockRejectedValue(new Error('Sign up failed'));
    render(<SignUp />);
    
    fireEvent.change(screen.getByPlaceholderText('example@example.com'), { target: { value: 'test@test.com' } });
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
        expect(screen.getByText('Sign up failed')).toBeInTheDocument();
    });
  });

  it('calls signInWithGoogle', async () => {
    render(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /Googleで登録/ }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('handles signInWithGoogle error', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('Google error'));
    render(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /Googleで登録/ }));
    await waitFor(() => {
        expect(screen.getByText('Google error')).toBeInTheDocument();
    });
  });
  
  it('ignores redirecting error in google sign in', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignInWithGoogle.mockRejectedValue(new Error('Redirecting...'));
      render(<SignUp />);
      fireEvent.click(screen.getByRole('button', { name: /Googleで登録/ }));
      
      await waitFor(() => {
          expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
      
      // Error should not be displayed (setError not called with this error)
      expect(screen.queryByText('Redirecting...')).not.toBeInTheDocument();
      consoleSpy.mockRestore();
  });
  
  it('navigates to offline mode', () => {
      render(<SignUp />);
      fireEvent.click(screen.getByRole('button', { name: 'オフラインモードで続ける' }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
