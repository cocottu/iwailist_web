import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../pages/Settings';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock components
vi.mock('../../components/settings/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings Content</div>
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('Settings Page', () => {
  it('renders header', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument();
    expect(screen.getByText('アプリケーションの設定を管理します')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByRole('button', { name: '通知設定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一般設定' })).toBeInTheDocument();
  });

  it('shows notification settings by default', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('switches tabs', () => {
    renderWithProviders(<Settings />);
    
    // 一般設定タブに切り替え
    fireEvent.click(screen.getByRole('button', { name: '一般設定' }));
    expect(screen.getByText('テーマ')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-settings')).not.toBeInTheDocument();

    // 通知設定タブに戻す
    fireEvent.click(screen.getByRole('button', { name: '通知設定' }));
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('displays theme options in general settings', () => {
    renderWithProviders(<Settings />);
    
    // 一般設定タブに切り替え
    fireEvent.click(screen.getByRole('button', { name: '一般設定' }));
    
    // テーマオプションが表示されていることを確認
    expect(screen.getByText('ライト')).toBeInTheDocument();
    expect(screen.getByText('ダーク')).toBeInTheDocument();
    expect(screen.getByText('システム')).toBeInTheDocument();
  });
});
