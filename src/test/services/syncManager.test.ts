import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncManager } from '../../services/syncManager';
import { firestoreGiftRepository } from '../../repositories/firebase/giftRepository';
import { firestorePersonRepository } from '../../repositories/firebase/personRepository';
import { isFirebaseEnabled } from '../../lib/firebase';
import { onSnapshot } from 'firebase/firestore';

// Define mock instances using vi.hoisted
const { mockGiftRepoInstance, mockPersonRepoInstance } = vi.hoisted(() => {
  return {
    mockGiftRepoInstance: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      createWithId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockPersonRepoInstance: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      createWithId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  };
});

// Mock dependencies
vi.mock('../../database/repositories/giftRepository', () => ({
  GiftRepository: vi.fn(() => mockGiftRepoInstance),
}));

vi.mock('../../database/repositories/personRepository', () => ({
  PersonRepository: vi.fn(() => mockPersonRepoInstance),
}));

vi.mock('../../repositories/firebase/giftRepository', () => ({
  firestoreGiftRepository: {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    createWithId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../../repositories/firebase/personRepository', () => ({
  firestorePersonRepository: {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    createWithId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../../lib/firebase', () => ({
  isFirebaseEnabled: vi.fn(),
  db: {},
}));

vi.mock('../../services/firestoreService', () => ({
  firestoreService: {
    getUserCollectionPath: vi.fn((userId, collection) => `users/${userId}/${collection}`),
  }
}));

vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

describe('SyncManager', () => {
  const mockUserId = 'test-user-id';
  const mockDate = new Date('2023-01-01T12:00:00Z');

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Setup default mock behaviors
    (isFirebaseEnabled as any).mockReturnValue(true);
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock crypto.randomUUID
    Object.defineProperty(crypto, 'randomUUID', {
      writable: true,
      value: vi.fn(() => 'mock-uuid'),
    });
    
    // Navigator onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Setup Repository mocks
    mockGiftRepoInstance.getAll.mockResolvedValue([]);
    mockGiftRepoInstance.get.mockResolvedValue(null);
    mockGiftRepoInstance.create.mockResolvedValue('new-id');
    mockGiftRepoInstance.update.mockResolvedValue(undefined);
    mockGiftRepoInstance.delete.mockResolvedValue(undefined);

    mockPersonRepoInstance.getAll.mockResolvedValue([]);
    mockPersonRepoInstance.get.mockResolvedValue(null);
    mockPersonRepoInstance.create.mockResolvedValue('new-id');
    mockPersonRepoInstance.update.mockResolvedValue(undefined);
    mockPersonRepoInstance.delete.mockResolvedValue(undefined);

    (firestoreGiftRepository.getAll as any).mockResolvedValue([]);
    (firestorePersonRepository.getAll as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    syncManager.clearSyncQueue();
    syncManager.stopRealtimeSync();
  });

  it('should add operation to sync queue and execute if online', async () => {
    const operation = {
      type: 'create' as const,
      collection: 'gifts' as const,
      documentId: 'gift-1',
      data: { id: 'gift-1', name: 'Test Gift', userId: mockUserId },
    };

    await syncManager.addToSyncQueue(operation);

    expect(localStorage.setItem).toHaveBeenCalledWith('syncQueue', expect.stringContaining('gift-1'));
    expect(firestoreGiftRepository.createWithId).toHaveBeenCalled();
  });

  it('should queue operation if offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
    });

    const operation = {
      type: 'create' as const,
      collection: 'gifts' as const,
      documentId: 'gift-2',
      data: { name: 'Test Gift', userId: mockUserId },
    };

    await syncManager.addToSyncQueue(operation);

    const status = syncManager.getSyncStatus();
    expect(status.pendingOperations).toBe(1);
    expect(firestoreGiftRepository.createWithId).not.toHaveBeenCalled();
  });

  it('should execute sync and process queue', async () => {
    // Manually add to queue via addToSyncQueue while offline
    Object.defineProperty(window.navigator, 'onLine', { value: false });
    await syncManager.addToSyncQueue({
      type: 'update',
      collection: 'gifts',
      documentId: 'gift-1',
      data: { name: 'Updated Gift', userId: mockUserId },
    });
    
    Object.defineProperty(window.navigator, 'onLine', { value: true });
    
    const result = await syncManager.triggerSync(mockUserId);
    
    expect(result.success).toBe(true);
    expect(result.processed).toBe(1);
    expect(firestoreGiftRepository.update).toHaveBeenCalledWith(mockUserId, 'gift-1', expect.anything());
  });

  it('should sync gifts from remote to local (new item)', async () => {
    const remoteGift = {
      id: 'remote-gift-1',
      updatedAt: new Date(mockDate.getTime() + 1000), // Newer
      name: 'Remote Gift',
    };
    (firestoreGiftRepository.getAll as any).mockResolvedValue([remoteGift]);
    mockGiftRepoInstance.getAll.mockResolvedValue([]);

    await syncManager.triggerSync(mockUserId);

    expect(mockGiftRepoInstance.create).toHaveBeenCalledWith(remoteGift, { skipRemote: true });
  });

  it('should sync gifts from remote to local (update item)', async () => {
    const remoteGift = {
      id: 'gift-1',
      updatedAt: new Date(mockDate.getTime() + 1000), // Newer
      name: 'Remote Gift Updated',
    };
    const localGift = {
      id: 'gift-1',
      updatedAt: mockDate, // Older
      name: 'Local Gift',
    };

    (firestoreGiftRepository.getAll as any).mockResolvedValue([remoteGift]);
    mockGiftRepoInstance.getAll.mockResolvedValue([localGift]);

    await syncManager.triggerSync(mockUserId);

    expect(mockGiftRepoInstance.update).toHaveBeenCalledWith(remoteGift, { skipRemote: true });
  });

  it('should sync gifts from local to remote (new item)', async () => {
    const localGift = {
      id: 'local-gift-1',
      updatedAt: mockDate,
      name: 'Local Gift',
      userId: mockUserId,
    };

    (firestoreGiftRepository.getAll as any).mockResolvedValue([]);
    mockGiftRepoInstance.getAll.mockResolvedValue([localGift]);
    // Simulate not found in firestore individual get
    (firestoreGiftRepository.get as any).mockResolvedValue(null);

    await syncManager.triggerSync(mockUserId);

    expect(firestoreGiftRepository.createWithId).toHaveBeenCalledWith(
      mockUserId, 
      localGift.id, 
      expect.objectContaining({ name: 'Local Gift' })
    );
  });

  it('should sync gifts from local to remote (update item)', async () => {
    const localGift = {
      id: 'gift-1',
      updatedAt: new Date(mockDate.getTime() + 1000), // Newer
      name: 'Local Gift Updated',
      userId: mockUserId,
    };
    const remoteGift = {
      id: 'gift-1',
      updatedAt: mockDate, // Older
      name: 'Remote Gift',
    };

    (firestoreGiftRepository.getAll as any).mockResolvedValue([remoteGift]);
    mockGiftRepoInstance.getAll.mockResolvedValue([localGift]);

    await syncManager.triggerSync(mockUserId);

    expect(firestoreGiftRepository.update).toHaveBeenCalledWith(
      mockUserId, 
      localGift.id, 
      localGift
    );
  });
  
  it('should handle realtime sync updates', async () => {
    const callbacks: any[] = [];
    (onSnapshot as any).mockImplementation((query: any, onNext: any, onError: any) => {
      callbacks.push(onNext);
      return vi.fn(); // unsubscribe function
    });

    syncManager.startRealtimeSync(mockUserId);
    
    // callbacks[0] is gifts, callbacks[1] is persons
    const onGiftsNext = callbacks[0];

    // Simulate snapshot
    const mockSnapshot = {
      size: 1,
      metadata: { hasPendingWrites: false },
      docChanges: () => [{
        type: 'added',
        doc: {
          id: 'new-gift',
          data: () => ({
            personId: 'p1',
            giftName: 'Realtime Gift',
            receivedDate: { toDate: () => new Date() },
            amount: 1000,
            category: 'other',
            returnStatus: 'none',
            memo: '',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          })
        }
      }]
    };
    
    // First call (will be skipped as initial load)
    await onGiftsNext(mockSnapshot);
    
    // Second call (should process)
    await onGiftsNext(mockSnapshot);
    
    expect(mockGiftRepoInstance.create).toHaveBeenCalled();
  });

  it('should stop realtime sync', () => {
    const mockUnsubscribe = vi.fn();
    (onSnapshot as any).mockReturnValue(mockUnsubscribe);

    syncManager.startRealtimeSync(mockUserId);
    expect(syncManager.isRealtimeSyncActive()).toBe(true);

    syncManager.stopRealtimeSync();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2); // Gifts and Persons
    expect(syncManager.isRealtimeSyncActive()).toBe(false);
  });
  
  it('should handle sync errors gracefully', async () => {
    (firestoreGiftRepository.getAll as any).mockRejectedValue(new Error('Network Error'));
    
    const result = await syncManager.triggerSync(mockUserId);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

});
