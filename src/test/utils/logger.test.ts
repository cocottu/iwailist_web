import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/utils/logger';

describe('Logger', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('開発環境ではdebugメッセージを出力する', () => {
      logger.debug('Test debug message', { data: 'test' });
      
      // DEV環境の場合、console.debugが呼ばれる
      if (import.meta.env.DEV) {
        expect(consoleDebugSpy).toHaveBeenCalled();
        expect(consoleDebugSpy.mock.calls[0][0]).toContain('[DEBUG]');
        expect(consoleDebugSpy.mock.calls[0][0]).toContain('Test debug message');
      }
    });

    it('複数の引数を受け取ることができる', () => {
      const arg1 = { id: 1 };
      const arg2 = 'test';
      
      logger.debug('Message with args', arg1, arg2);
      
      if (import.meta.env.DEV) {
        expect(consoleDebugSpy).toHaveBeenCalled();
      }
    });
  });

  describe('info', () => {
    it('開発環境ではinfoメッセージを出力する', () => {
      logger.info('Test info message');
      
      if (import.meta.env.DEV) {
        expect(consoleInfoSpy).toHaveBeenCalled();
        expect(consoleInfoSpy.mock.calls[0][0]).toContain('[INFO]');
        expect(consoleInfoSpy.mock.calls[0][0]).toContain('Test info message');
      }
    });

    it('追加の引数を渡すことができる', () => {
      logger.info('Info with data', { user: 'test' });
      
      if (import.meta.env.DEV) {
        expect(consoleInfoSpy).toHaveBeenCalled();
      }
    });
  });

  describe('warn', () => {
    it('開発環境ではwarnメッセージを出力する', () => {
      logger.warn('Test warning message');
      
      if (import.meta.env.DEV) {
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]');
        expect(consoleWarnSpy.mock.calls[0][0]).toContain('Test warning message');
      }
    });
  });

  describe('error', () => {
    it('エラーメッセージを出力する', () => {
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]');
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Test error message');
    });

    it('本番環境では詳細な引数を出力しない', () => {
      const errorData = { stack: 'error stack' };
      logger.error('Error with stack', errorData);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      if (import.meta.env.PROD) {
        // 本番環境では追加引数は含まれない
        expect(consoleErrorSpy.mock.calls[0].length).toBe(1);
      } else {
        // 開発環境では追加引数も含まれる
        expect(consoleErrorSpy.mock.calls[0].length).toBeGreaterThan(1);
      }
    });
  });

  describe('productionError', () => {
    it('本番環境用の簡潔なエラーログを出力する', () => {
      logger.productionError('Production error');
      
      if (import.meta.env.PROD) {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]');
        expect(consoleErrorSpy.mock.calls[0][0]).toContain('Production error');
      }
    });

    it('開発環境では何も出力しない', () => {
      logger.productionError('Production error');
      
      if (import.meta.env.DEV) {
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      }
    });
  });
});
