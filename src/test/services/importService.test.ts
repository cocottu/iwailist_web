import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { importData, importFromFile, validateExportData } from '../../services/importService';
import { getDB } from '../../database';
import { ExportData } from '../../services/exportService';

// Mock dependencies
vi.mock('../../database', () => ({
  getDB: vi.fn(),
}));

describe('importService', () => {
  const mockUserId = 'test-user-id';
  const mockDate = new Date('2023-01-01T12:00:00Z');

  const mockExportData: ExportData = {
    version: '1.0.0',
    exportDate: mockDate.toISOString(),
    userId: mockUserId,
    data: {
      gifts: [{ id: 'g1', userId: mockUserId, name: 'Gift 1', receivedDate: mockDate.toISOString(), createdAt: mockDate.toISOString() } as any],
      persons: [{ id: 'p1', userId: mockUserId, name: 'Person 1', createdAt: mockDate.toISOString() } as any],
      returns: [{ id: 'r1', giftId: 'g1', name: 'Return 1', returnDate: mockDate.toISOString(), createdAt: mockDate.toISOString() } as any],
      images: [{ id: 'i1', entityId: 'g1', entityType: 'gift', imageData: 'data:image/png;base64,fake', createdAt: mockDate.toISOString(), name: 'Image 1' } as any],
      reminders: [{ id: 'rem1', userId: mockUserId, content: 'Reminder 1', reminderDate: mockDate.toISOString(), createdAt: mockDate.toISOString() } as any],
    },
    metadata: {
      giftsCount: 1,
      personsCount: 1,
      returnsCount: 1,
      imagesCount: 1,
      remindersCount: 1,
    },
  };

  const mockDB = {
    get: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getDB as any).mockResolvedValue(mockDB);
    mockDB.get.mockResolvedValue(null); // Default: item not found (new item)
    mockDB.add.mockResolvedValue(undefined);
    mockDB.put.mockResolvedValue(undefined);

    // Mock global fetch for base64ToBlob
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      blob: () => Promise.resolve(new Blob(['fake-blob-content'])),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should validate export data correctly', () => {
    expect(validateExportData(mockExportData)).toBe(true);
    expect(validateExportData(null)).toBe(false);
    expect(validateExportData({})).toBe(false);
    expect(validateExportData({ version: '1.0.0' })).toBe(false);
    expect(validateExportData({ ...mockExportData, data: null })).toBe(false);
  });

  it('should fail if version is incorrect', async () => {
    const invalidData = { ...mockExportData, version: '0.9.0' };
    const result = await importData(invalidData, { skipExisting: false, overwriteExisting: false });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('サポートされていないエクスポートバージョンです');
  });

  it('should import all new data successfully', async () => {
    const result = await importData(mockExportData, { skipExisting: false, overwriteExisting: false });

    expect(result.success).toBe(true);
    expect(result.imported.gifts).toBe(1);
    expect(result.imported.persons).toBe(1);
    expect(result.imported.returns).toBe(1);
    expect(result.imported.images).toBe(1);
    expect(result.imported.reminders).toBe(1);
    expect(result.skipped.gifts).toBe(0);

    expect(mockDB.add).toHaveBeenCalledTimes(5);
  });

  it('should skip existing data if skipExisting is true', async () => {
    mockDB.get.mockResolvedValue({ id: 'existing' }); // Simulate existing

    const result = await importData(mockExportData, { skipExisting: true, overwriteExisting: false });

    expect(result.success).toBe(true);
    expect(result.imported.gifts).toBe(0);
    expect(result.skipped.gifts).toBe(1);
    expect(mockDB.add).not.toHaveBeenCalled();
    expect(mockDB.put).not.toHaveBeenCalled();
  });

  it('should overwrite existing data if overwriteExisting is true', async () => {
    mockDB.get.mockResolvedValue({ id: 'existing' });

    const result = await importData(mockExportData, { skipExisting: false, overwriteExisting: true });

    expect(result.success).toBe(true);
    expect(result.imported.gifts).toBe(1);
    expect(mockDB.put).toHaveBeenCalledTimes(5);
  });

  it('should handle existing data without skip/overwrite (should skip/fail? implementation returns false)', async () => {
    mockDB.get.mockResolvedValue({ id: 'existing' });

    const result = await importData(mockExportData, { skipExisting: false, overwriteExisting: false });

    expect(result.success).toBe(true);
    expect(result.imported.gifts).toBe(0);
    expect(result.skipped.gifts).toBe(1);
    expect(mockDB.put).not.toHaveBeenCalled();
    expect(mockDB.add).not.toHaveBeenCalled();
  });

  it('should handle errors during import of individual items', async () => {
    mockDB.add.mockRejectedValue(new Error('DB Error'));

    const result = await importData(mockExportData, { skipExisting: false, overwriteExisting: false });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(5); // One for each item
    expect(result.imported.gifts).toBe(0);
  });

  it('should import from file', async () => {
    const content = JSON.stringify(mockExportData);
    const file = new File([content], 'export.json', { type: 'application/json' });
    // Polyfill text method
    file.text = () => Promise.resolve(content);
    
    const result = await importFromFile(file, { skipExisting: false, overwriteExisting: false });
    if (!result.success) console.log('Import errors:', result.errors);

    expect(result.success).toBe(true);
    expect(result.imported.gifts).toBe(1);
  });

  it('should handle invalid file content', async () => {
    const content = 'invalid-json';
    const file = new File([content], 'export.json', { type: 'application/json' });
    // Polyfill text method
    file.text = () => Promise.resolve(content);
    
    const result = await importFromFile(file, { skipExisting: false, overwriteExisting: false });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('ファイル読み込みエラー');
  });
  
  it('should override userId if provided', async () => {
      const overrideUserId = 'override-user';
      await importData(mockExportData, { skipExisting: false, overwriteExisting: false, userId: overrideUserId });
      
      expect(mockDB.add).toHaveBeenCalledWith('gifts', expect.objectContaining({ userId: overrideUserId }));
      expect(mockDB.add).toHaveBeenCalledWith('persons', expect.objectContaining({ userId: overrideUserId }));
      expect(mockDB.add).toHaveBeenCalledWith('reminders', expect.objectContaining({ userId: overrideUserId }));
  });
  
  it('should override userId when overwriting existing data', async () => {
      mockDB.get.mockResolvedValue({ id: 'existing', userId: 'old-user' });
      const overrideUserId = 'override-user';
      
      await importData(mockExportData, { skipExisting: false, overwriteExisting: true, userId: overrideUserId });
      
      expect(mockDB.put).toHaveBeenCalledWith('gifts', expect.objectContaining({ userId: overrideUserId }));
  });
});
