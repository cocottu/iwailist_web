import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

describe('usePWAInstall', () => {
  // window.matchMediaのモック
  const mockMatchMedia = vi.fn();
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('初期状態が正しいこと', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('スタンドアロンモードの場合、isInstalledがtrueになること', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it('beforeinstallpromptイベントが発生するとisInstallableがtrueになること', () => {
    const { result } = renderHook(() => usePWAInstall());
    const preventDefault = vi.fn();

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      window.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(true);
  });

  it('appinstalledイベントが発生するとisInstalledがtrueになること', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it('promptInstallが正しく動作すること', async () => {
    const { result } = renderHook(() => usePWAInstall());
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted' });

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'prompt', { value: prompt });
      Object.defineProperty(event, 'userChoice', { value: userChoice });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(prompt).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
  });

  it('deferredPromptがない場合にpromptInstallを呼んでもエラーにならないこと', async () => {
    const { result } = renderHook(() => usePWAInstall());
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
        await result.current.promptInstall();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ インストールプロンプトが利用できません');
    consoleWarnSpy.mockRestore();
  });

  it('dismissInstallPromptでisInstallableがfalseになること', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    act(() => {
        result.current.dismissInstallPrompt();
    });

    expect(result.current.isInstallable).toBe(false);
  });
});
