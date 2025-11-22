import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Settings from '../../pages/Settings';

// Mock components
vi.mock('../../components/settings/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings Content</div>
}));

describe('Settings Page', () => {
  it('renders header', () => {
    render(<Settings />);
    expect(screen.getByRole('heading', { level: 1, name: '設定' })).toBeInTheDocument();
    expect(screen.getByText('アプリケーションの設定を管理します')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(<Settings />);
    expect(screen.getByRole('button', { name: '通知設定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一般設定' })).toBeInTheDocument();
  });

  it('shows notification settings by default', () => {
    render(<Settings />);
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    expect(screen.queryByText('一般設定は今後追加予定です。')).not.toBeInTheDocument();
  });

  it('switches tabs', () => {
    render(<Settings />);
    
    fireEvent.click(screen.getByRole('button', { name: '一般設定' }));
    expect(screen.getByText('一般設定は今後追加予定です。')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-settings')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '通知設定' }));
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });
});
