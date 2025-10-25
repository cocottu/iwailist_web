import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@/utils/notifications';
import { toast } from 'sonner';

// Sonnerをモック
vi.mock('sonner', () => ({
  toast: vi.fn((_message: string, _options?: unknown) => {
    return 'toast-id';
  }),
}));

// toast のメソッドをモック
Object.assign(toast, {
  success: vi.fn((_message: string, _options?: unknown) => 'toast-id'),
  error: vi.fn((_message: string, _options?: unknown) => 'toast-id'),
  warning: vi.fn((_message: string, _options?: unknown) => 'toast-id'),
  info: vi.fn((_message: string, _options?: unknown) => 'toast-id'),
  loading: vi.fn((_message: string) => 'toast-id'),
  custom: vi.fn((_content: unknown, _options?: unknown) => 'toast-id'),
  promise: vi.fn((promise: Promise<unknown>, _messages: unknown) => promise),
  dismiss: vi.fn((_toastId?: string | number) => {}),
});

describe('NotificationManager (Sonnerベース)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('notificationsオブジェクトが定義されている', () => {
      expect(notifications).toBeDefined();
      expect(typeof notifications.show).toBe('function');
      expect(typeof notifications.success).toBe('function');
      expect(typeof notifications.error).toBe('function');
      expect(typeof notifications.warning).toBe('function');
      expect(typeof notifications.info).toBe('function');
    });
  });

  describe('showメソッド', () => {
    it('情報通知を表示できる', () => {
      notifications.show({
        message: 'Test notification',
        type: 'info'
      });
      
      expect(toast.info).toHaveBeenCalledWith(
        'Test notification',
        expect.objectContaining({ duration: undefined })
      );
    });

    it('タイトル付きの通知を表示できる', () => {
      notifications.show({
        title: 'Test Title',
        message: 'Test message',
        type: 'success'
      });
      
      expect(toast.success).toHaveBeenCalledWith(
        'Test Title',
        expect.objectContaining({ description: 'Test message' })
      );
    });

    it('カスタム期間を指定できる', () => {
      notifications.show({
        message: 'Test notification',
        duration: 1000
      });
      
      expect(toast.info).toHaveBeenCalledWith(
        'Test notification',
        expect.objectContaining({ duration: 1000 })
      );
    });

    it('異なるタイプの通知を表示できる', () => {
      notifications.show({
        message: 'Success message',
        type: 'success'
      });
      expect(toast.success).toHaveBeenCalled();

      notifications.show({
        message: 'Error message',
        type: 'error'
      });
      expect(toast.error).toHaveBeenCalled();

      notifications.show({
        message: 'Warning message',
        type: 'warning'
      });
      expect(toast.warning).toHaveBeenCalled();

      notifications.show({
        message: 'Info message',
        type: 'info'
      });
      expect(toast.info).toHaveBeenCalled();
    });
  });

  describe('便利メソッド', () => {
    it('successメソッドが呼び出せる', () => {
      notifications.success('Operation successful');
      
      expect(toast.success).toHaveBeenCalledWith(
        'Operation successful',
        expect.any(Object)
      );
    });

    it('タイトル付きの成功通知を表示できる', () => {
      notifications.success('Successfully saved', 'Success');
      
      expect(toast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({ description: 'Successfully saved' })
      );
    });

    it('errorメソッドが呼び出せる', () => {
      notifications.error('Something went wrong');
      
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong',
        expect.any(Object)
      );
    });

    it('warningメソッドが呼び出せる', () => {
      notifications.warning('Please be careful');
      
      expect(toast.warning).toHaveBeenCalledWith(
        'Please be careful',
        expect.any(Object)
      );
    });

    it('infoメソッドが呼び出せる', () => {
      notifications.info('FYI: Update available');
      
      expect(toast.info).toHaveBeenCalledWith(
        'FYI: Update available',
        expect.any(Object)
      );
    });

    it('複数の通知を同時に呼び出せる', () => {
      notifications.success('First notification');
      notifications.error('Second notification');
      notifications.warning('Third notification');

      expect(toast.success).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('確認トーストを表示する', () => {
      notifications.confirm({
        title: 'Confirm',
        message: 'Are you sure?'
      });

      expect(toast).toHaveBeenCalledWith(
        'Confirm',
        expect.objectContaining({
          description: 'Are you sure?',
          duration: Infinity,
        })
      );
    });

    it('タイトルなしの確認トーストを表示する', () => {
      notifications.confirm({
        message: 'Are you sure?'
      });

      expect(toast).toHaveBeenCalledWith(
        'Are you sure?',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });
  });

  describe('追加メソッド', () => {
    it('loadingメソッドが呼び出せる', () => {
      const id = notifications.loading('Loading...');
      
      expect(toast.loading).toHaveBeenCalledWith('Loading...');
      expect(id).toBe('toast-id');
    });

    it('dismissメソッドが呼び出せる', () => {
      notifications.dismiss('toast-id');
      
      expect(toast.dismiss).toHaveBeenCalledWith('toast-id');
    });

    it('customメソッドが呼び出せる', () => {
      const customContent = (_id: string | number) => ({ type: 'div', props: { children: 'Custom content' } } as React.ReactElement);
      notifications.custom(customContent, { duration: 2000 });
      
      expect(toast.custom).toHaveBeenCalledWith(customContent, { duration: 2000 });
    });
  });
});
