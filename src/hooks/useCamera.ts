/**
 * カメラフック
 * Phase 2: カメラ撮影機能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCameraStream,
  getCameraDevices,
  capturePhoto,
  stopCameraStream,
  blobToDataURL,
  type CameraDevice,
  type CameraConstraints
} from '@/utils/camera';
import { compressImage } from '@/utils/imageProcessing';
import { AppError } from '@/types';

/**
 * カメラフックの戻り値
 */
export interface UseCameraReturn {
  /** カメラストリーム */
  stream: MediaStream | null;
  /** カメラデバイスのリスト */
  devices: CameraDevice[];
  /** 現在のデバイスID */
  currentDeviceId: string | null;
  /** カメラ起動中かどうか */
  isActive: boolean;
  /** 処理中かどうか */
  isProcessing: boolean;
  /** エラー */
  error: AppError | null;
  /** カメラを起動する */
  startCamera: (deviceId?: string) => Promise<void>;
  /** カメラを停止する */
  stopCamera: () => void;
  /** カメラを切り替える */
  switchCamera: () => Promise<void>;
  /** 写真を撮影する（Data URL） */
  capturePhotoAsDataURL: (videoElement: HTMLVideoElement) => Promise<string>;
  /** 写真を撮影する（Blob） */
  capturePhotoAsBlob: (videoElement: HTMLVideoElement) => Promise<Blob>;
}

/**
 * カメラフックのオプション
 */
export interface UseCameraOptions {
  /** デフォルトの向き */
  defaultFacingMode?: 'user' | 'environment';
  /** 自動起動するかどうか */
  autoStart?: boolean;
  /** 画像を圧縮するかどうか */
  compress?: boolean;
  /** 圧縮オプション */
  compressOptions?: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
}

/**
 * カメラを操作するカスタムフック
 * @param options オプション
 * @returns カメラ操作用のオブジェクト
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    defaultFacingMode = 'environment',
    autoStart = false,
    compress = true,
    compressOptions
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);

  const streamRef = useRef<MediaStream | null>(null);

  // カメラデバイスのリストを取得
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const deviceList = await getCameraDevices();
        setDevices(deviceList);
      } catch (err) {
        console.error('Failed to get camera devices:', err);
        // デバイスリストの取得に失敗してもエラー扱いにしない
      }
    };

    loadDevices();
  }, []);

  // 自動起動
  useEffect(() => {
    if (autoStart) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
      }
    };
  }, [autoStart]);

  /**
   * カメラを起動する
   */
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // 既存のストリームを停止
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
        streamRef.current = null;
      }

      const constraints: CameraConstraints = {
        facingMode,
        width: 1920,
        height: 1080
      };

      // デバイスIDが指定されている場合はそれを使用
      const mediaStream = deviceId
        ? await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: false
          })
        : await getCameraStream(constraints);

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCurrentDeviceId(deviceId || null);
      setIsActive(true);
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        (err as AppError).type || 'PERMISSION_ERROR',
        'カメラの起動に失敗しました',
        err as Error
      );
      setError(appError);
      setIsActive(false);
    } finally {
      setIsProcessing(false);
    }
  }, [facingMode]);

  /**
   * カメラを停止する
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
      setCurrentDeviceId(null);
      setIsActive(false);
    }
  }, []);

  /**
   * カメラを切り替える
   */
  const switchCamera = useCallback(async () => {
    if (devices.length <= 1) {
      return; // デバイスが1つ以下の場合は切り替えない
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 向きを切り替え
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);

      // 該当する向きのデバイスを探す
      const targetDevice = devices.find(d => d.facingMode === newFacingMode);
      
      if (targetDevice) {
        await startCamera(targetDevice.deviceId);
      } else {
        // 見つからない場合は次のデバイスを使用
        const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        await startCamera(devices[nextIndex].deviceId);
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        (err as AppError).type || 'PERMISSION_ERROR',
        'カメラの切り替えに失敗しました',
        err as Error
      );
      setError(appError);
    } finally {
      setIsProcessing(false);
    }
  }, [devices, facingMode, currentDeviceId, startCamera]);

  /**
   * 写真を撮影してData URLとして返す
   */
  const capturePhotoAsDataURL = useCallback(async (videoElement: HTMLVideoElement): Promise<string> => {
    try {
      setIsProcessing(true);
      setError(null);

      let blob = await capturePhoto(videoElement);

      // 圧縮が有効な場合
      if (compress) {
        blob = await compressImage(blob, compressOptions);
      }

      const dataURL = await blobToDataURL(blob);
      return dataURL;
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        (err as AppError).type || 'STORAGE_ERROR',
        '写真の撮影に失敗しました',
        err as Error
      );
      setError(appError);
      throw appError;
    } finally {
      setIsProcessing(false);
    }
  }, [compress, compressOptions]);

  /**
   * 写真を撮影してBlobとして返す
   */
  const capturePhotoAsBlob = useCallback(async (videoElement: HTMLVideoElement): Promise<Blob> => {
    try {
      setIsProcessing(true);
      setError(null);

      let blob = await capturePhoto(videoElement);

      // 圧縮が有効な場合
      if (compress) {
        blob = await compressImage(blob, compressOptions);
      }

      return blob;
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        (err as AppError).type || 'STORAGE_ERROR',
        '写真の撮影に失敗しました',
        err as Error
      );
      setError(appError);
      throw appError;
    } finally {
      setIsProcessing(false);
    }
  }, [compress, compressOptions]);

  return {
    stream,
    devices,
    currentDeviceId,
    isActive,
    isProcessing,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhotoAsDataURL,
    capturePhotoAsBlob
  };
}
