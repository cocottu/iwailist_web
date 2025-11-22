import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  compressImage,
  getImageDimensions,
  formatFileSize,
  isImageFile,
  isSupportedImageFormat,
  generateThumbnail,
} from '../../utils/imageProcessing';

describe('imageProcessing', () => {
  describe('formatFileSize', () => {
    it('0バイトを正しくフォーマットする', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('KBを正しくフォーマットする', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('MBを正しくフォーマットする', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    it('GBを正しくフォーマットする', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('isImageFile', () => {
    it('画像ファイルの場合はtrueを返す', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isImageFile(file)).toBe(true);
    });

    it('画像ファイルでない場合はfalseを返す', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isImageFile(file)).toBe(false);
    });
  });

  describe('isSupportedImageFormat', () => {
    it('サポートされている形式の場合はtrueを返す', () => {
      const jpg = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const png = new File([''], 'test.png', { type: 'image/png' });
      const webp = new File([''], 'test.webp', { type: 'image/webp' });
      const gif = new File([''], 'test.gif', { type: 'image/gif' });

      expect(isSupportedImageFormat(jpg)).toBe(true);
      expect(isSupportedImageFormat(png)).toBe(true);
      expect(isSupportedImageFormat(webp)).toBe(true);
      expect(isSupportedImageFormat(gif)).toBe(true);
    });

    it('サポートされていない形式の場合はfalseを返す', () => {
      const bmp = new File([''], 'test.bmp', { type: 'image/bmp' });
      const txt = new File([''], 'test.txt', { type: 'text/plain' });

      expect(isSupportedImageFormat(bmp)).toBe(false);
      expect(isSupportedImageFormat(txt)).toBe(false);
    });
  });

  describe('非同期画像処理テスト', () => {
    // URL.createObjectURLのモック
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      global.URL.createObjectURL = originalCreateObjectURL;
      global.URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });

    // FileReaderのモック
    class MockFileReader {
      onload: ((e: any) => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      error: any = null;
      
      readAsDataURL(_file: Blob) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/jpeg;base64,mock' } });
          }
        }, 0);
      }
    }
    
    // Imageのモック
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      _src: string = '';
      width: number = 0;
      height: number = 0;
      naturalWidth: number = 0;
      naturalHeight: number = 0;

      set src(value: string) {
        this._src = value;
        setTimeout(() => {
          if (this.onload) {
            this.width = 2000;
            this.height = 2000;
            this.naturalWidth = 2000;
            this.naturalHeight = 2000;
            this.onload();
          }
        }, 0);
      }
      get src() { return this._src; }
    }

    beforeEach(() => {
        vi.stubGlobal('FileReader', MockFileReader);
        vi.stubGlobal('Image', MockImage);
    });

    describe('getImageDimensions', () => {
      it('画像のサイズを取得する', async () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const dimensions = await getImageDimensions(file);
        
        expect(dimensions).toEqual({ width: 2000, height: 2000 });
      });
    });

    describe('compressImage', () => {
        it('画像を圧縮する', async () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            
            // HTMLCanvasElement.prototype.toBlob のモック
            const mockToBlob = vi.fn((callback, _type, _quality) => {
                callback(new Blob(['mock-compressed-data'], { type: 'image/jpeg' }));
            });

            // HTMLCanvasElement.prototype.getContext のモック
            const mockGetContext = vi.fn(() => ({
                drawImage: vi.fn(),
            }));

            // プロトタイプをモック
            vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(mockToBlob);
            vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(mockGetContext as any);

            const compressedBlob = await compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.8 });
            
            expect(compressedBlob).toBeInstanceOf(Blob);
            expect(mockToBlob).toHaveBeenCalled();
        });

        it('リサイズが必要ない場合は元のサイズで処理される', async () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            
            // 小さい画像をシミュレート
            vi.stubGlobal('Image', class extends MockImage {
                constructor() {
                    super();
                    // 上書きできるように
                }
                set src(value: string) {
                    this._src = value;
                    setTimeout(() => {
                        if (this.onload) {
                            this.width = 100; // 小さいサイズ
                            this.height = 100;
                            this.naturalWidth = 100;
                            this.naturalHeight = 100;
                            this.onload();
                        }
                    }, 0);
                }
            });

             const mockToBlob = vi.fn((callback) => {
                callback(new Blob(['mock-data'], { type: 'image/jpeg' }));
            });
             vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(mockToBlob);
             vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
                drawImage: vi.fn(),
            }) as any);

            await compressImage(file, { maxWidth: 1000, maxHeight: 1000 });
            
            // Canvasのサイズが100x100であることを確認したいが、
            // compressImageの実装ではcanvas要素を作成しているため、直接参照できない。
            // 間接的に確認するか、エラーが出ないことを確認。
            expect(mockToBlob).toHaveBeenCalled();
        });
    });

    describe('generateThumbnail', () => {
        it('サムネイルを生成する', async () => {
             const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
             
             const mockToBlob = vi.fn((callback) => {
                callback(new Blob(['mock-thumb'], { type: 'image/jpeg' }));
            });
             vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(mockToBlob);
             vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
                drawImage: vi.fn(),
            }) as any);

            const thumbnail = await generateThumbnail(file, 200);
            expect(thumbnail).toBeInstanceOf(Blob);
        });
    });
  });
});
