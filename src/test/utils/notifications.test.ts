import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifications } from '@/utils/notifications';

describe('NotificationManager', () => {
  beforeEach(() => {
    // テスト前にコンテナをクリーンアップ
    const existingContainer = document.getElementById('notification-container');
    if (existingContainer) {
      existingContainer.remove();
    }
  });

  afterEach(() => {
    // テスト後にコンテナをクリーンアップ
    const container = document.getElementById('notification-container');
    if (container) {
      container.remove();
    }
  });

  describe('初期化', () => {
    it('通知コンテナが存在する', () => {
      // notificationsオブジェクトが初期化されている
      expect(notifications).toBeDefined();
      expect(typeof notifications.show).toBe('function');
      expect(typeof notifications.success).toBe('function');
      expect(typeof notifications.error).toBe('function');
    });
  });

  describe('メソッド', () => {
    it('showメソッドが呼び出せる', () => {
      expect(() => {
        notifications.show({
          message: 'Test notification',
          type: 'info'
        });
      }).not.toThrow();
    });

    it('タイトル付きの通知を表示できる', () => {
      expect(() => {
        notifications.show({
          title: 'Test Title',
          message: 'Test message',
          type: 'success'
        });
      }).not.toThrow();
    });

    it('異なるタイプの通知を表示できる', () => {
      const types = ['success', 'error', 'warning', 'info'] as const;
      
      types.forEach(type => {
        expect(() => {
          notifications.show({
            message: `Test ${type}`,
            type
          });
        }).not.toThrow();
      });
    });

    it('カスタム期間を指定できる', () => {
      expect(() => {
        notifications.show({
          message: 'Test notification',
          duration: 1000
        });
      }).not.toThrow();
    });
  });

  describe('confirm', () => {
    it('確認ダイアログを表示してtrueを返す', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const result = await notifications.confirm({
        title: 'Confirm',
        message: 'Are you sure?'
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(result).toBe(true);
      
      confirmSpy.mockRestore();
    });

    it('確認ダイアログを表示してfalseを返す', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const result = await notifications.confirm({
        message: 'Are you sure?'
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(result).toBe(false);
      
      confirmSpy.mockRestore();
    });

    it('タイトルとメッセージを組み合わせて表示する', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      await notifications.confirm({
        title: 'Delete Item',
        message: 'This action cannot be undone'
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Delete Item')
      );
      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('This action cannot be undone')
      );
      
      confirmSpy.mockRestore();
    });
  });

  describe('便利メソッド', () => {
    it('successメソッドが呼び出せる', () => {
      expect(() => {
        notifications.success('Operation successful');
      }).not.toThrow();
    });

    it('タイトル付きの成功通知を表示できる', () => {
      expect(() => {
        notifications.success('Saved', 'Success');
      }).not.toThrow();
    });

    it('errorメソッドが呼び出せる', () => {
      expect(() => {
        notifications.error('Something went wrong');
      }).not.toThrow();
    });

    it('warningメソッドが呼び出せる', () => {
      expect(() => {
        notifications.warning('Please be careful');
      }).not.toThrow();
    });

    it('infoメソッドが呼び出せる', () => {
      expect(() => {
        notifications.info('FYI: Update available');
      }).not.toThrow();
    });

    it('複数の通知を同時に呼び出せる', () => {
      expect(() => {
        notifications.success('First notification');
        notifications.error('Second notification');
        notifications.warning('Third notification');
      }).not.toThrow();
    });
  });
});
