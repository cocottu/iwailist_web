import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Contact from '../../pages/Contact';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    import.meta.env.VITE_SLACK_CONTACT_WEBHOOK_URL = 'https://hooks.slack.com/services/test';
  });

  it('renders header', () => {
    renderWithRouter(<Contact />);
    expect(screen.getByRole('heading', { level: 1, name: 'お問い合わせ' })).toBeInTheDocument();
    expect(screen.getByText(/ご質問・お問い合わせ/)).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderWithRouter(<Contact />);
    expect(screen.getByLabelText(/お名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/お問い合わせ種別/)).toBeInTheDocument();
    expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument();
    expect(screen.getByLabelText(/プライバシーポリシー/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithRouter(<Contact />);
    
    const submitButtons = screen.getAllByRole('button', { name: '送信する' });
    fireEvent.click(submitButtons[0]);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('お問い合わせ内容を入力してください')).toBeInTheDocument();
      expect(screen.getByText('プライバシーポリシーへの同意が必要です')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithRouter(<Contact />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButtons = screen.getAllByRole('button', { name: '送信する' });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('shows confirmation modal on valid submit', async () => {
    renderWithRouter(<Contact />);
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '送信内容の確認' })).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    renderWithRouter(<Contact />);
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '送信内容の確認' })).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: '送信する' });
    // モーダル内のボタン（2番目）をクリック
    fireEvent.click(confirmButtons[1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<Contact />);
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '送信内容の確認' })).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: '送信する' });
    // モーダル内のボタン（2番目）をクリック
    fireEvent.click(confirmButtons[1]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles missing webhook URL', async () => {
    import.meta.env.VITE_SLACK_CONTACT_WEBHOOK_URL = '';

    renderWithRouter(<Contact />);
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '送信内容の確認' })).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: '送信する' });
    // モーダル内のボタン（2番目）をクリック
    fireEvent.click(confirmButtons[1]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Slack Webhook URLが設定されていません')
      );
    });
  });

  it('allows canceling confirmation modal', async () => {
    renderWithRouter(<Contact />);
    
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシー/);
    fireEvent.click(privacyCheckbox);
    
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '送信内容の確認' })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '送信内容の確認' })).not.toBeInTheDocument();
    });
  });
});
