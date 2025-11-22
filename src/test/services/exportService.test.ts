import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportAllData, downloadExportData, exportEntity, getExportDataSize } from '../../services/exportService';
import { getDB } from '../../database';

// Mock dependencies
vi.mock('../../database', () => ({
  getDB: vi.fn(),
}));

describe('exportService', () => {
  const mockUserId = 'test-user-id';
  const mockDate = new Date('2023-01-01T12:00:00Z');

  // Mock data
  const mockGifts = [
    { id: 'g1', userId: mockUserId, name: 'Gift 1' },
    { id: 'g2', userId: 'other-user', name: 'Gift 2' },
  ];
  const mockPersons = [
    { id: 'p1', userId: mockUserId, name: 'Person 1' },
    { id: 'p2', userId: 'other-user', name: 'Person 2' },
  ];
  const mockReturns = [
    { id: 'r1', giftId: 'g1', name: 'Return 1' }, // Belongs to user
    { id: 'r2', giftId: 'g2', name: 'Return 2' }, // Other user
  ];
  const mockImages = [
    { id: 'i1', entityId: 'g1', entityType: 'gift', imageData: new Blob(['fake-image']), name: 'Image 1' },
    { id: 'i2', entityId: 'r1', entityType: 'return', imageData: new Blob(['fake-image-2']), name: 'Image 2' },
    { id: 'i3', entityId: 'g2', entityType: 'gift', imageData: new Blob(['fake-image-3']), name: 'Image 3' },
  ];
  const mockReminders = [
    { id: 'rem1', userId: mockUserId, content: 'Reminder 1' },
  ];

  // Mock DB Interface
  const mockDB = {
    getAll: vi.fn(),
    get: vi.fn(),
    getAllFromIndex: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    (getDB as any).mockResolvedValue(mockDB);

    mockDB.getAll.mockImplementation((storeName) => {
      switch (storeName) {
        case 'gifts': return Promise.resolve(mockGifts);
        case 'persons': return Promise.resolve(mockPersons);
        case 'returns': return Promise.resolve(mockReturns);
        case 'images': return Promise.resolve(mockImages);
        case 'reminders': return Promise.resolve(mockReminders);
        default: return Promise.resolve([]);
      }
    });

    // Mock FileReader
    class MockFileReader {
      result: string | null = null;
      onloadend: (() => void) | null = null;
      onerror: ((error: any) => void) | null = null;
      readAsDataURL(_blob: Blob) {
        this.result = 'data:image/png;base64,fakebase64';
        if (this.onloadend) this.onloadend();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    // Mock URL and Document methods
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn(),
    });

    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    const mockBody = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    };
    
    vi.stubGlobal('document', {
      createElement: vi.fn((tag) => {
        if (tag === 'a') return mockLink;
        return {};
      }),
      body: mockBody,
    });
    
    vi.stubGlobal('Blob', class MockBlob {
      content: any[];
      size: number;
      constructor(content: any[], _options?: any) {
        this.content = content;
        this.size = 100; // Mock size
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should export all data filtered by userId', async () => {
    const result = await exportAllData(mockUserId);

    expect(result.userId).toBe(mockUserId);
    expect(result.data.gifts).toHaveLength(1); // Only g1
    expect(result.data.gifts[0].id).toBe('g1');
    expect(result.data.persons).toHaveLength(1); // Only p1
    expect(result.data.returns).toHaveLength(1); // Only r1 (linked to g1)
    expect(result.data.images).toHaveLength(2); // i1 (g1) and i2 (r1)
    expect(result.data.reminders).toHaveLength(1);

    // Check if imageData is converted (mocked value)
    expect(result.data.images[0].imageData).toBe('data:image/png;base64,fakebase64');
  });

  it('should export all data without userId filter (if null)', async () => {
    const result = await exportAllData(null);

    expect(result.userId).toBeNull();
    expect(result.data.gifts).toHaveLength(2);
    expect(result.data.persons).toHaveLength(2);
  });

  it('should download export data', async () => {
    await downloadExportData(mockUserId);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should get export data size', async () => {
    const size = await getExportDataSize(mockUserId);
    expect(size).toBeGreaterThan(0);
    expect(size).toBe(100 / (1024 * 1024));
  });

  it('should export specific gift entity', async () => {
    const giftId = 'g1';
    mockDB.get.mockResolvedValue(mockGifts[0]);
    mockDB.getAllFromIndex.mockImplementation((store, _index, value) => {
        if (store === 'returns' && value === giftId) return Promise.resolve([mockReturns[0]]);
        if (store === 'images' && value === giftId) return Promise.resolve([mockImages[0]]);
        return Promise.resolve([]);
    });

    await exportEntity('gifts', giftId);

    expect(mockDB.get).toHaveBeenCalledWith('gifts', giftId);
    expect(document.createElement).toHaveBeenCalledWith('a');
  });
  
  it('should export specific person entity', async () => {
    const personId = 'p1';
    mockDB.get.mockResolvedValue(mockPersons[0]);

    await exportEntity('persons', personId);

    expect(mockDB.get).toHaveBeenCalledWith('persons', personId);
  });

  it('should throw error if entity not found', async () => {
    mockDB.get.mockResolvedValue(undefined);
    
    await expect(exportEntity('gifts', 'non-existent')).rejects.toThrow('贈答品が見つかりません');
  });
  
  it('should throw error if person not found', async () => {
    mockDB.get.mockResolvedValue(undefined);
    
    await expect(exportEntity('persons', 'non-existent')).rejects.toThrow('人物が見つかりません');
  });
  
  it('should throw error if return not found', async () => {
    mockDB.get.mockResolvedValue(undefined);
    
    await expect(exportEntity('returns', 'non-existent')).rejects.toThrow('お返しが見つかりません');
  });
  
  it('should throw error if reminder not found', async () => {
    mockDB.get.mockResolvedValue(undefined);
    
    await expect(exportEntity('reminders', 'non-existent')).rejects.toThrow('リマインダーが見つかりません');
  });
  
  it('should export specific return entity', async () => {
      const id = 'r1';
      mockDB.get.mockResolvedValue(mockReturns[0]);
      await exportEntity('returns', id);
      expect(mockDB.get).toHaveBeenCalledWith('returns', id);
  });
  
  it('should export specific reminder entity', async () => {
      const id = 'rem1';
      mockDB.get.mockResolvedValue(mockReminders[0]);
      await exportEntity('reminders', id);
      expect(mockDB.get).toHaveBeenCalledWith('reminders', id);
  });
});
