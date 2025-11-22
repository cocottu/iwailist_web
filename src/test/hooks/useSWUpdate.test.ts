import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSWUpdate } from '../../hooks/useSWUpdate';

describe('useSWUpdate', () => {
  const originalNavigator = global.navigator;
  const mockUpdate = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockServiceWorker = {
    ready: Promise.resolve({
      update: mockUpdate,
      addEventListener: mockAddEventListener,
      installing: null,
      active: true,
    }),
    controller: {},
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // navigator.serviceWorkerのモック
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: mockServiceWorker,
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('初期状態が正しいこと', async () => {
    const { result } = renderHook(() => useSWUpdate());

    expect(result.current.needRefresh).toBe(false);
    expect(result.current.offlineReady).toBe(false);

    await waitFor(() => {
      expect(result.current.offlineReady).toBe(true);
    });
  });

  it('updateServiceWorkerが呼ばれるとregistration.updateが実行される', async () => {
    const { result } = renderHook(() => useSWUpdate());
    await waitFor(() => expect(mockAddEventListener).toHaveBeenCalled());

    await act(async () => {
      await result.current.updateServiceWorker(false);
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('reloadPageがtrueの場合、window.location.reloadが呼ばれる', async () => {
    const mockReload = vi.fn();
    const originalLocation = window.location;
    
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    const { result } = renderHook(() => useSWUpdate());
    await waitFor(() => expect(mockAddEventListener).toHaveBeenCalled());

    await act(async () => {
      await result.current.updateServiceWorker(true);
    });

    expect(mockReload).toHaveBeenCalled();
    
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('Service Workerがサポートされていない場合、何もしない', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    });

    const { result } = renderHook(() => useSWUpdate());
    
    expect(result.current.needRefresh).toBe(false);
  });
});
