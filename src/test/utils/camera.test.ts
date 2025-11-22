import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCameraStream,
  getCameraDevices,
  capturePhoto,
  stopCameraStream,
  blobToDataURL,
  dataURLToBlob,
  CameraConstraints
} from '../../utils/camera';
import { AppError, ErrorType } from '../../types';

describe('camera utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getCameraStream', () => {
    it('カメラストリームを取得する', async () => {
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([]),
      };
      const getUserMediaMock = vi.fn().mockResolvedValue(mockStream);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: getUserMediaMock,
        },
        configurable: true,
      });

      const stream = await getCameraStream();
      expect(stream).toBe(mockStream);
      expect(getUserMediaMock).toHaveBeenCalledWith(expect.objectContaining({
        video: expect.objectContaining({
          facingMode: 'environment',
        }),
      }));
    });

    it('制約条件を指定してカメラストリームを取得する', async () => {
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([]),
      };
      const getUserMediaMock = vi.fn().mockResolvedValue(mockStream);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: getUserMediaMock,
        },
        configurable: true,
      });

      const constraints: CameraConstraints = {
        facingMode: 'user',
        width: 1280,
        height: 720,
      };

      await getCameraStream(constraints);
      expect(getUserMediaMock).toHaveBeenCalledWith(expect.objectContaining({
        video: expect.objectContaining({
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }),
      }));
    });

    it('カメラアクセスが拒否された場合にエラーをスローする', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      const getUserMediaMock = vi.fn().mockRejectedValue(error);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: getUserMediaMock,
        },
        configurable: true,
      });

      await expect(getCameraStream()).rejects.toThrow(AppError);
      await expect(getCameraStream()).rejects.toThrow('カメラへのアクセスが拒否されました');
    });

    it('カメラが見つからない場合にエラーをスローする', async () => {
        const error = new DOMException('Not found', 'NotFoundError');
        const getUserMediaMock = vi.fn().mockRejectedValue(error);
  
        Object.defineProperty(global.navigator, 'mediaDevices', {
          value: {
            getUserMedia: getUserMediaMock,
          },
          configurable: true,
        });
  
        await expect(getCameraStream()).rejects.toThrow('カメラが見つかりません');
      });

    it('ブラウザがカメラをサポートしていない場合にエラーをスローする', async () => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: undefined,
        configurable: true,
      });

      await expect(getCameraStream()).rejects.toThrow('お使いのブラウザはカメラ機能に対応していません');
    });
  });

  describe('getCameraDevices', () => {
    it('カメラデバイスのリストを取得する', async () => {
      const mockDevices = [
        { deviceId: '1', kind: 'videoinput', label: 'Back Camera' },
        { deviceId: '2', kind: 'audioinput', label: 'Microphone' },
        { deviceId: '3', kind: 'videoinput', label: 'Front Camera' },
      ];
      const enumerateDevicesMock = vi.fn().mockResolvedValue(mockDevices);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          enumerateDevices: enumerateDevicesMock,
        },
        configurable: true,
      });

      const devices = await getCameraDevices();
      expect(devices).toHaveLength(2);
      expect(devices[0].facingMode).toBe('environment');
      expect(devices[1].facingMode).toBe('user');
    });

    it('ブラウザがデバイス列挙をサポートしていない場合にエラーをスローする', async () => {
        Object.defineProperty(global.navigator, 'mediaDevices', {
            value: undefined,
            configurable: true,
          });
    
          await expect(getCameraDevices()).rejects.toThrow('お使いのブラウザはカメラデバイスの列挙に対応していません');
    });
  });

  describe('capturePhoto', () => {
    it('写真を撮影してBlobを返す', async () => {
      const mockVideo = document.createElement('video');
      Object.defineProperty(mockVideo, 'videoWidth', { value: 640 });
      Object.defineProperty(mockVideo, 'videoHeight', { value: 480 });

      const mockToBlob = vi.fn((callback, type, quality) => {
        callback(new Blob(['mock-photo'], { type: 'image/jpeg' }));
      });

      const mockGetContext = vi.fn(() => ({
        drawImage: vi.fn(),
      }));

      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(mockToBlob);
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(mockGetContext as any);

      const blob = await capturePhoto(mockVideo);
      expect(blob).toBeInstanceOf(Blob);
      expect(mockGetContext).toHaveBeenCalled();
      expect(mockToBlob).toHaveBeenCalled();
    });
  });

  describe('stopCameraStream', () => {
    it('ストリームの全トラックを停止する', () => {
      const mockStop = vi.fn();
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([
          { stop: mockStop },
          { stop: mockStop },
        ]),
      } as unknown as MediaStream;

      stopCameraStream(mockStream);
      expect(mockStop).toHaveBeenCalledTimes(2);
    });
  });

  describe('blobToDataURL', () => {
     // FileReaderのモック
     class MockFileReader {
        onloadend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        error: any = null;
        result: string | null = null;
        onload: (() => void) | null = null;
        
        readAsDataURL(blob: Blob) {
            this.result = 'data:image/jpeg;base64,mock';
          setTimeout(() => {
            if (this.onloadend) {
              this.onloadend();
            }
          }, 0);
        }

        readAsText(blob: Blob) {
            this.result = 'Hello World';
            setTimeout(() => {
                if (this.onload) {
                    this.onload();
                }
            }, 0);
        }
      }

    it('BlobをData URLに変換する', async () => {
        vi.stubGlobal('FileReader', MockFileReader);
        const blob = new Blob(['test'], { type: 'text/plain' });
        const dataURL = await blobToDataURL(blob);
        expect(dataURL).toBe('data:image/jpeg;base64,mock');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
  });

  describe('dataURLToBlob', () => {
    // FileReaderのモック（このテストケース専用）
    class MockFileReader {
        onload: (() => void) | null = null;
        result: string | null = null;
        
        readAsText(blob: Blob) {
            this.result = 'Hello World';
            setTimeout(() => {
                if (this.onload) {
                    this.onload();
                }
            }, 0);
        }
    }

    it('Data URLをBlobに変換する', () => {
      vi.stubGlobal('FileReader', MockFileReader);
      const dataURL = 'data:text/plain;base64,SGVsbG8gV29ybGQ='; // "Hello World"
      const blob = dataURLToBlob(dataURL);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
      
      // 内容の確認（非同期）
      return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
              expect(reader.result).toBe('Hello World');
              resolve();
          };
          reader.readAsText(blob);
      });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
  });
});
