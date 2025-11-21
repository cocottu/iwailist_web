import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

describe('useOnlineStatus', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // navigatorのモックを戻す
    Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true
    });
  });

  it('初期状態が正しいこと（オンライン）', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('初期状態が正しいこと（オフライン）', () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      writable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('オンラインイベントで状態が更新されること', () => {
    Object.defineProperty(global, 'navigator', {
        value: { onLine: false },
        writable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('オフラインイベントで状態が更新されること', () => {
    Object.defineProperty(global, 'navigator', {
        value: { onLine: true },
        writable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });
});
