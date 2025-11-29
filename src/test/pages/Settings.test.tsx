import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../../pages/Settings';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Mock components
vi.mock('../../components/settings/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings Content</div>
}));

describe('Settings Page', () => {
  it('renders header', () => {
    renderWithRouter(<Settings />);
    expect(screen.getByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument();
    expect(screen.getByText('アプリケーションの設定を管理します')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    renderWithRouter(<Settings />);
    expect(screen.getByRole('button', { name: '通知設定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一般設定' })).toBeInTheDocument();
  });

  it('shows notification settings by default', () => {
    renderWithRouter(<Settings />);
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    expect(screen.queryByText('運営者情報')).not.toBeInTheDocument();
  });

  it('switches tabs and shows legal links', () => {
    renderWithRouter(<Settings />);
    
    fireEvent.click(screen.getByRole('button', { name: '一般設定' }));
    expect(screen.getByText('運営者情報')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-settings')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '通知設定' }));
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('has correct links in general settings', () => {
    renderWithRouter(<Settings />);
    
    fireEvent.click(screen.getByRole('button', { name: '一般設定' }));
    
    const operatorLink = screen.getByRole('link', { name: /運営者情報/ });
    expect(operatorLink).toHaveAttribute('href', '/legal/operator');
    
    const privacyLink = screen.getByRole('link', { name: /プライバシーポリシー/ });
    expect(privacyLink).toHaveAttribute('href', '/legal/privacy');
    
    const contactLink = screen.getByRole('link', { name: /お問い合わせ/ });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
