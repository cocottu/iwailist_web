import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSync } from '../../hooks/useSync';
import { syncManager } from '../../services/syncManager';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { isFirebaseEnabled } from '../../lib/firebase';

// Mock dependencies
vi.mock('../../services/syncManager', () => ({
  syncManager: {
    getSyncStatus: vi.fn(),
    triggerSync: vi.fn(),
    clearSyncQueue: vi.fn(),
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  isFirebaseEnabled: vi.fn(),
}));

describe('useSync', () => {
  const mockSyncStatus = {
    isSyncing: false,
    lastSyncTime: new Date('2023-01-01T12:00:00Z'),
    pendingOperations: 0,
    isOnline: true,
  };

  const mockUser = { uid: 'test-uid' };

  beforeEach(() => {
    vi.resetAllMocks();
    (syncManager.getSyncStatus as any).mockReturnValue(mockSyncStatus);
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useOnlineStatus as any).mockReturnValue(true);
    (isFirebaseEnabled as any).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial sync status', () => {
    const { result } = renderHook(() => useSync());

    expect(result.current.isSyncing).toBe(mockSyncStatus.isSyncing);
    expect(result.current.lastSyncTime).toEqual(mockSyncStatus.lastSyncTime);
    expect(result.current.pendingOperations).toBe(mockSyncStatus.pendingOperations);
    expect(result.current.error).toBeNull();
  });

  it('should update sync status periodically', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSync());

    const updatedStatus = { ...mockSyncStatus, pendingOperations: 5 };
    (syncManager.getSyncStatus as any).mockReturnValue(updatedStatus);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.pendingOperations).toBe(5);
    vi.useRealTimers();
  });

  it('should perform sync successfully', async () => {
    (syncManager.triggerSync as any).mockResolvedValue({
      success: true,
      errors: [],
    });

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(syncManager.triggerSync).toHaveBeenCalledWith(mockUser.uid);
    expect(result.current.error).toBeNull();
  });

  it('should handle sync failure', async () => {
    (syncManager.triggerSync as any).mockResolvedValue({
      success: false,
      errors: [{ error: new Error('Sync failed') }],
    });

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(syncManager.triggerSync).toHaveBeenCalledWith(mockUser.uid);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('同期に失敗しました');
  });

  it('should handle partial sync failure', async () => {
     (syncManager.triggerSync as any).mockResolvedValue({
      success: true, // Overall success true but with errors
      errors: [{ error: new Error('Partial error') }],
    });

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(syncManager.triggerSync).toHaveBeenCalledWith(mockUser.uid);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('一部のデータの同期に失敗しました');
  });

  it('should handle unexpected error during sync', async () => {
    (syncManager.triggerSync as any).mockRejectedValue(new Error('Unexpected error'));

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Unexpected error');
  });

  it('should skip sync if user is not logged in', async () => {
    (useAuth as any).mockReturnValue({ user: null });
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(syncManager.triggerSync).not.toHaveBeenCalled();
  });

  it('should skip sync if Firebase is disabled', async () => {
    (isFirebaseEnabled as any).mockReturnValue(false);
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(syncManager.triggerSync).not.toHaveBeenCalled();
  });

  it('should trigger auto-sync when coming online', async () => {
    // Start offline
    (useOnlineStatus as any).mockReturnValue(false);
    const { rerender } = renderHook(() => useSync());
    
    // Mock sync success for the next call
    (syncManager.triggerSync as any).mockResolvedValue({ success: true, errors: [] });

    // Simulate coming online
    (useOnlineStatus as any).mockReturnValue(true);
    rerender();

    // Wait for useEffect
    await waitFor(() => {
       expect(syncManager.triggerSync).toHaveBeenCalledWith(mockUser.uid);
    });
  });

  it('should retry sync', async () => {
    (syncManager.triggerSync as any).mockResolvedValue({ success: true, errors: [] });
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.retrySync();
    });

    expect(syncManager.triggerSync).toHaveBeenCalledWith(mockUser.uid);
  });

  it('should clear sync queue', () => {
    const { result } = renderHook(() => useSync());

    act(() => {
      result.current.clearSyncQueue();
    });

    expect(syncManager.clearSyncQueue).toHaveBeenCalled();
    expect(syncManager.getSyncStatus).toHaveBeenCalled();
  });
  
  it('should clear error state', async () => {
     (syncManager.triggerSync as any).mockResolvedValue({
      success: false,
      errors: [{ error: new Error('Sync failed') }],
    });
    
    const { result } = renderHook(() => useSync());
    
    await act(async () => {
      await result.current.sync();
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
        result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
});
