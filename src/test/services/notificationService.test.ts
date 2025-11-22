import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  showNotification,
  showReminderNotification,
  showReturnDeadlineNotification,
  scheduleNotification,
  getNotificationSettings,
  saveNotificationSettings,
  clearNotification,
  clearAllNotifications
} from '../../services/notificationService';

describe('notificationService', () => {
  const mockShowNotification = vi.fn();
  const mockGetNotifications = vi.fn();
  const mockNotificationClose = vi.fn();
  
  const mockRegistration = {
    showNotification: mockShowNotification,
    getNotifications: mockGetNotifications,
  };

  const mockServiceWorker = {
    ready: Promise.resolve(mockRegistration),
  };

  const mockNotification = {
    permission: 'default',
    requestPermission: vi.fn(),
  };
  
  // Mock Notification Constructor
  const mockNotificationConstructor = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Setup Navigator ServiceWorker
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true, // Allow deletion
    });

    // Setup Window Notification
    Object.defineProperty(window, 'Notification', {
      value: class MockNotificationClass {
        static permission = mockNotification.permission;
        static requestPermission = mockNotification.requestPermission;
        constructor(title: string, options: any) {
            mockNotificationConstructor(title, options);
        }
      },
      writable: true,
      configurable: true, // Allow deletion
    });

    // Reset mock functions behaviors
    mockShowNotification.mockResolvedValue(undefined);
    mockGetNotifications.mockResolvedValue([{ close: mockNotificationClose }]);
    mockNotification.requestPermission.mockResolvedValue('granted');
    mockNotification.permission = 'default';
    
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
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should check if notification is supported', () => {
    expect(isNotificationSupported()).toBe(true);
    
    // Test false case
    delete (window as any).Notification;
    expect(isNotificationSupported()).toBe(false);
  });

  it('should get notification permission', () => {
    (window.Notification as any).permission = 'granted';
    expect(getNotificationPermission()).toEqual({ permission: 'granted', isSupported: true });

    (window.Notification as any).permission = 'denied';
    expect(getNotificationPermission()).toEqual({ permission: 'denied', isSupported: true });
    
    delete (window as any).Notification;
    expect(getNotificationPermission()).toEqual({ permission: 'denied', isSupported: false });
  });

  it('should request notification permission', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe('granted');
    expect(mockNotification.requestPermission).toHaveBeenCalled();
  });
  
  it('should handle denied permission request', async () => {
     mockNotification.requestPermission.mockResolvedValue('denied');
     const result = await requestNotificationPermission();
     expect(result).toBe('denied');
  });
  
  it('should handle error during permission request', async () => {
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission error'));
      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
  });
  
  it('should return denied if not supported', async () => {
      delete (window as any).Notification;
      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
  });

  it('should show notification using Service Worker', async () => {
    (window.Notification as any).permission = 'granted';
    
    await showNotification({ title: 'Test', body: 'Body' });
    
    expect(mockShowNotification).toHaveBeenCalledWith('Test', expect.objectContaining({ body: 'Body' }));
  });

  it('should not show notification if permission not granted', async () => {
    (window.Notification as any).permission = 'denied';
    await showNotification({ title: 'Test', body: 'Body' });
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should show reminder notification', async () => {
    (window.Notification as any).permission = 'granted';
    await showReminderNotification('Gift', 'Message', 'id1');
    
    expect(mockShowNotification).toHaveBeenCalledWith('リマインダー', expect.objectContaining({
        body: 'Gift: Message',
        tag: 'reminder-id1'
    }));
  });

  it('should show return deadline notification (future)', async () => {
    (window.Notification as any).permission = 'granted';
    await showReturnDeadlineNotification('Gift', 3, 'id1');
    
    expect(mockShowNotification).toHaveBeenCalledWith('お返し期限のお知らせ', expect.objectContaining({
        body: 'Giftのお返し期限まであと3日です'
    }));
  });
  
  it('should show return deadline notification (today)', async () => {
    (window.Notification as any).permission = 'granted';
    await showReturnDeadlineNotification('Gift', 0, 'id1');
    
    expect(mockShowNotification).toHaveBeenCalledWith('お返し期限のお知らせ', expect.objectContaining({
        body: 'Giftのお返し期限は今日です'
    }));
  });
  
  it('should show return deadline notification (past)', async () => {
    (window.Notification as any).permission = 'granted';
    await showReturnDeadlineNotification('Gift', -2, 'id1');
    
    expect(mockShowNotification).toHaveBeenCalledWith('お返し期限のお知らせ', expect.objectContaining({
        body: 'Giftのお返し期限が2日過ぎています'
    }));
  });

  it('should schedule notification', async () => {
    (window.Notification as any).permission = 'granted';
    const futureDate = new Date(Date.now() + 1000);
    
    await scheduleNotification(futureDate, { title: 'Scheduled', body: 'Body' });
    
    vi.advanceTimersByTime(1000);
    await Promise.resolve(); // Allow async callback to execute
    
    expect(mockShowNotification).toHaveBeenCalledWith('Scheduled', expect.anything());
  });
  
  it('should show scheduled notification immediately if date is past', async () => {
      (window.Notification as any).permission = 'granted';
      const pastDate = new Date(Date.now() - 1000);
      
      await scheduleNotification(pastDate, { title: 'Past', body: 'Body' });
      
      expect(mockShowNotification).toHaveBeenCalledWith('Past', expect.anything());
  });
  
  it('should not schedule if delay is too large', async () => {
      (window.Notification as any).permission = 'granted';
      const farFutureDate = new Date(Date.now() + 2147483647 + 10000);
      
      await scheduleNotification(farFutureDate, { title: 'Far Future', body: 'Body' });
      
      vi.advanceTimersByTime(2147483647 + 10000);
      expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should manage notification settings', () => {
    const settings = getNotificationSettings();
    expect(settings.enabled).toBe(false); // Default

    const newSettings = { enabled: true, reminderTime: '10:00', reminderDaysBefore: 1 };
    saveNotificationSettings(newSettings);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(getNotificationSettings()).toEqual(newSettings);
  });

  it('should clear specific notification', async () => {
    await clearNotification('tag1');
    expect(mockGetNotifications).toHaveBeenCalledWith({ tag: 'tag1' });
    expect(mockNotificationClose).toHaveBeenCalled();
  });

  it('should clear all notifications', async () => {
    await clearAllNotifications();
    expect(mockGetNotifications).toHaveBeenCalledWith();
    expect(mockNotificationClose).toHaveBeenCalled();
  });
  
  it('should handle error when clearing notifications', async () => {
      mockGetNotifications.mockRejectedValue(new Error('Error'));
      await clearNotification('tag1');
      // Should not throw
  });

});
