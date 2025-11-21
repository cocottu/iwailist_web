import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from '../../services/storageService';
import * as firebaseStorage from 'firebase/storage';
import * as firebaseLib from '../../lib/firebase';
import * as imageProcessing from '../../utils/imageProcessing';

// Firebase Storageのモック
vi.mock('firebase/storage', () => {
  return {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
    deleteObject: vi.fn(),
    listAll: vi.fn(),
  };
});

// Lib Firebaseのモック
vi.mock('../../lib/firebase', () => {
  return {
    storage: {},
    isFirebaseEnabled: vi.fn().mockReturnValue(true),
    getEnvironmentStoragePath: vi.fn((path) => `test-env/${path}`),
  };
});

// ImageProcessingのモック
vi.mock('../../utils/imageProcessing', () => {
  return {
    compressImage: vi.fn().mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' })),
  };
});

describe('storageService', () => {
  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const userId = 'user123';

  beforeEach(() => {
    vi.resetAllMocks();
    (firebaseLib.isFirebaseEnabled as any).mockReturnValue(true);
    // デフォルトで成功するように設定
    (firebaseStorage.ref as any).mockReturnValue('mock-ref');
    (firebaseStorage.getDownloadURL as any).mockResolvedValue('https://example.com/image.jpg');
    (firebaseStorage.uploadBytes as any).mockResolvedValue({});
    (firebaseStorage.deleteObject as any).mockResolvedValue(undefined);
    (firebaseStorage.listAll as any).mockResolvedValue({ items: [] });
    (imageProcessing.compressImage as any).mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' }));
  });

  describe('uploadImage', () => {
    it('正常に画像をアップロードできる', async () => {
      const mockRef = 'mock-ref';
      const mockUrl = 'https://example.com/image.jpg';
      (firebaseStorage.ref as any).mockReturnValue(mockRef);
      (firebaseStorage.getDownloadURL as any).mockResolvedValue(mockUrl);

      const result = await storageService.uploadImage(userId, mockFile, 'test.jpg');

      expect(imageProcessing.compressImage).toHaveBeenCalledWith(mockFile, expect.any(Object));
      expect(firebaseLib.getEnvironmentStoragePath).toHaveBeenCalledWith(`users/${userId}/test.jpg`);
      expect(firebaseStorage.ref).toHaveBeenCalledWith(firebaseLib.storage, `test-env/users/${userId}/test.jpg`);
      expect(firebaseStorage.uploadBytes).toHaveBeenCalledWith(mockRef, expect.any(Blob), { contentType: 'image/jpeg' });
      expect(result).toEqual({
        url: mockUrl,
        path: `test-env/users/${userId}/test.jpg`,
      });
    });

    it('Firebaseが無効な場合はエラーを投げる', async () => {
      (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);

      await expect(
        storageService.uploadImage(userId, mockFile, 'test.jpg')
      ).rejects.toThrow('Firebase Storage is not enabled');
    });

    it('アップロード失敗時にエラーを投げる', async () => {
      (firebaseStorage.uploadBytes as any).mockRejectedValue(new Error('Upload failed'));

      await expect(
        storageService.uploadImage(userId, mockFile, 'test.jpg')
      ).rejects.toThrow('画像のアップロードに失敗しました');
    });
  });

  describe('uploadImages', () => {
    it('複数画像をアップロードできる', async () => {
      const files = [mockFile, mockFile];
      const mockRef = 'mock-ref';
      const mockUrl = 'https://example.com/image.jpg';
      
      (firebaseStorage.ref as any).mockReturnValue(mockRef);
      (firebaseStorage.getDownloadURL as any).mockResolvedValue(mockUrl);

      // uploadImageが内部で呼ばれるため、スパイするか、結果を確認する
      // ここではuploadImageの実装がuploadBytesなどを呼ぶので、それらの呼び出し回数を確認

      const results = await storageService.uploadImages(userId, files, 'gifts');

      expect(results).toHaveLength(2);
      expect(firebaseStorage.uploadBytes).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteImage', () => {
    it('画像を削除できる', async () => {
      const mockPath = 'path/to/image.jpg';
      (firebaseStorage.ref as any).mockReturnValue('mock-ref');
      
      await storageService.deleteImage(mockPath);

      expect(firebaseStorage.deleteObject).toHaveBeenCalled();
    });

    it('存在しない画像の削除エラーは無視される', async () => {
      const mockPath = 'path/to/image.jpg';
      const error = { code: 'storage/object-not-found' };
      (firebaseStorage.deleteObject as any).mockRejectedValue(error);

      await expect(storageService.deleteImage(mockPath)).resolves.not.toThrow();
    });

    it('その他のエラーはスローされる', async () => {
      const mockPath = 'path/to/image.jpg';
      const error = { code: 'storage/unknown' };
      (firebaseStorage.deleteObject as any).mockRejectedValue(error);

      await expect(storageService.deleteImage(mockPath)).rejects.toThrow('画像の削除に失敗しました');
    });
  });

  describe('deleteImages', () => {
    it('複数画像を削除できる', async () => {
      const paths = ['path1', 'path2'];
      (firebaseStorage.ref as any).mockReturnValue('mock-ref');

      await storageService.deleteImages(paths);

      expect(firebaseStorage.deleteObject).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteDirectory', () => {
    it('ディレクトリ内の全画像を削除できる', async () => {
      const mockItems = ['item1', 'item2'];
      (firebaseStorage.listAll as any).mockResolvedValue({ items: mockItems });
      (firebaseStorage.ref as any).mockReturnValue('mock-ref');

      await storageService.deleteDirectory(userId, 'gifts');

      expect(firebaseStorage.listAll).toHaveBeenCalled();
      expect(firebaseStorage.deleteObject).toHaveBeenCalledTimes(2);
    });
    
    it('エラー発生時にエラーを投げる', async () => {
        (firebaseStorage.listAll as any).mockRejectedValue(new Error('List failed'));
        
        await expect(storageService.deleteDirectory(userId, 'gifts')).rejects.toThrow('ディレクトリの削除に失敗しました');
    });
  });

  describe('getDownloadURL', () => {
    it('ダウンロードURLを取得できる', async () => {
      const mockUrl = 'https://example.com/image.jpg';
      (firebaseStorage.getDownloadURL as any).mockResolvedValue(mockUrl);
      (firebaseStorage.ref as any).mockReturnValue('mock-ref');

      const url = await storageService.getDownloadURL('path/to/image.jpg');

      expect(url).toBe(mockUrl);
    });

    it('取得失敗時にエラーを投げる', async () => {
      (firebaseStorage.getDownloadURL as any).mockRejectedValue(new Error('Failed'));

      await expect(storageService.getDownloadURL('path')).rejects.toThrow('画像URLの取得に失敗しました');
    });
  });

  describe('getStorageUsage', () => {
      it('使用量（ファイル数）を取得できる', async () => {
          (firebaseStorage.listAll as any).mockResolvedValue({ items: ['1', '2', '3'] });
          
          const count = await storageService.getStorageUsage(userId);
          
          expect(count).toBe(3);
      });

      it('Firebaseが無効な場合は0を返す', async () => {
          (firebaseLib.isFirebaseEnabled as any).mockReturnValue(false);
          const count = await storageService.getStorageUsage(userId);
          expect(count).toBe(0);
      });

      it('エラー時は0を返す', async () => {
        (firebaseStorage.listAll as any).mockRejectedValue(new Error('Failed'));
        const count = await storageService.getStorageUsage(userId);
        expect(count).toBe(0);
      });
  });
  
});
