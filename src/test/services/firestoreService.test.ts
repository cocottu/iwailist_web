import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreService } from '../../services/firestoreService';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseLib from '../../lib/firebase';

// Firebase Firestoreのモック
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: class {
      static fromDate = vi.fn((date) => ({ toDate: () => date }));
      static now = vi.fn();
      toDate() { return new Date(); }
    },
    serverTimestamp: vi.fn().mockReturnValue('mock-server-timestamp'),
  };
});

// Lib Firebaseのモック
vi.mock('../../lib/firebase', () => {
  return {
    db: {},
    isFirebaseEnabled: vi.fn().mockReturnValue(true),
    getEnvironmentCollectionName: vi.fn((name) => `test-env-${name}`),
  };
});

describe('firestoreService', () => {
  const mockCollection = 'test-collection';
  const mockDocId = 'test-doc';
  const mockData = { name: 'Test', value: 123 };

  beforeEach(() => {
    vi.resetAllMocks();
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    (firebaseFirestore.doc as any).mockReturnValue('mock-doc-ref');
    (firebaseFirestore.collection as any).mockReturnValue('mock-collection-ref');
    (firebaseFirestore.serverTimestamp as any).mockReturnValue('mock-server-timestamp');
  });

  describe('createDocument', () => {
    it('正常にドキュメントを作成できる', async () => {
      await firestoreService.createDocument(mockCollection, mockDocId, mockData);

      expect(firebaseFirestore.doc).toHaveBeenCalledWith(firebaseLib.db, mockCollection, mockDocId);
      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          ...mockData,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it('undefinedを含むデータはクリーンアップされる', async () => {
        const dataWithUndefined = {
            name: 'Test',
            value: undefined,
            nested: {
                prop: 'valid',
                invalid: undefined
            },
            array: [1, undefined, 2]
        };

        await firestoreService.createDocument(mockCollection, mockDocId, dataWithUndefined);

        expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
            'mock-doc-ref',
            expect.objectContaining({
                name: 'Test',
                nested: {
                    prop: 'valid'
                },
                array: [1, 2]
            })
        );
    });

    it('Firebaseが無効な場合はエラーを投げる', async () => {
      (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);

      await expect(
        firestoreService.createDocument(mockCollection, mockDocId, mockData)
      ).rejects.toThrow('Firestore is not enabled');
    });
  });

  describe('getDocument', () => {
    it('ドキュメントが存在する場合、データを返す', async () => {
      (firebaseFirestore.getDoc as any).mockResolvedValue({
        exists: () => true,
        id: mockDocId,
        data: () => mockData,
      });

      const result = await firestoreService.getDocument(mockCollection, mockDocId);

      expect(result).toEqual({ id: mockDocId, ...mockData });
    });

    it('ドキュメントが存在しない場合、nullを返す', async () => {
      (firebaseFirestore.getDoc as any).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestoreService.getDocument(mockCollection, mockDocId);

      expect(result).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('正常にドキュメントを更新できる', async () => {
      await firestoreService.updateDocument(mockCollection, mockDocId, { name: 'Updated' });

      expect(firebaseFirestore.updateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          name: 'Updated',
          updatedAt: expect.anything(),
        })
      );
    });
  });

  describe('deleteDocument', () => {
    it('正常にドキュメントを削除できる', async () => {
      await firestoreService.deleteDocument(mockCollection, mockDocId);

      expect(firebaseFirestore.deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });
  });

  describe('getCollection', () => {
    it('コレクション内の全ドキュメントを取得できる', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: '1' }) },
        { id: '2', data: () => ({ name: '2' }) },
      ];
      (firebaseFirestore.getDocs as any).mockResolvedValue({ docs: mockDocs });

      const result = await firestoreService.getCollection(mockCollection);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', name: '1' });
    });
  });

  describe('queryDocuments', () => {
    it('クエリを実行してドキュメントを取得できる', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: '1' }) },
      ];
      (firebaseFirestore.getDocs as any).mockResolvedValue({ docs: mockDocs });
      (firebaseFirestore.query as any).mockReturnValue('mock-query');

      const result = await firestoreService.queryDocuments(mockCollection, []);

      expect(firebaseFirestore.query).toHaveBeenCalled();
      expect(firebaseFirestore.getDocs).toHaveBeenCalledWith('mock-query');
      expect(result).toHaveLength(1);
    });
  });

  describe('getUserCollectionPath', () => {
    it('正しいコレクションパスを生成する', () => {
      const path = firestoreService.getUserCollectionPath('user123', 'gifts');
      expect(path).toBe('test-env-users/user123/gifts');
    });
  });

  describe('timestamp変換', () => {
    it('dateToTimestamp', () => {
      const date = new Date('2023-01-01');
      const timestamp = firestoreService.dateToTimestamp(date);
      
      expect(firebaseFirestore.Timestamp.fromDate).toHaveBeenCalledWith(date);
    });

    it('timestampToDate', () => {
      const date = new Date('2023-01-01');
      const timestamp = { toDate: () => date };
      const result = firestoreService.timestampToDate(timestamp as any);
      
      expect(result).toEqual(date);
    });
  });
});
