import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReturnList } from '../../pages/ReturnList';
import { useAuth } from '../../contexts/AuthContext';
import { syncManager } from '../../services/syncManager';
import { isFirebaseEnabled } from '../../lib/firebase';
import { GiftRepository, ReturnRepository, ImageRepository } from '../../database'; // Import from index

// Mocks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/syncManager', () => ({
  syncManager: {
    triggerSync: vi.fn(),
  },
}));

vi.mock('../../lib/firebase', () => ({
  isFirebaseEnabled: vi.fn(),
}));

// Mock @/database directly because the component imports from there
vi.mock('../../database', () => ({
  GiftRepository: vi.fn(),
  ReturnRepository: vi.fn(),
  ImageRepository: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: (props: any) => <a href={props.to}>{props.children}</a>,
}));

describe('ReturnList', () => {
  const mockGiftRepo = {
    getAll: vi.fn(),
  };
  const mockReturnRepo = {
    getByGiftId: vi.fn(),
  };
  const mockImageRepo = {
    getByEntityId: vi.fn(),
  };

  const mockUser = { uid: 'test-user' };
  
  const mockGifts = [
    { id: 'g1', giftName: 'Gift 1', userId: 'test-user' },
    { id: 'g2', giftName: 'Gift 2', userId: 'test-user' },
  ];
  
  const mockReturns = [
    { id: 'r1', giftId: 'g1', returnName: 'Return 1', returnDate: new Date('2023-01-01'), amount: 5000, memo: 'Memo 1' },
    { id: 'r2', giftId: 'g2', returnName: 'Return 2', returnDate: new Date('2023-02-01'), amount: 3000 },
  ];
  
  const mockImages = [
    { id: 'i1', entityId: 'r1', imageUrl: 'url1', order: 0 },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (isFirebaseEnabled as any).mockReturnValue(false);
    
    (GiftRepository as any).mockImplementation(() => mockGiftRepo);
    (ReturnRepository as any).mockImplementation(() => mockReturnRepo);
    (ImageRepository as any).mockImplementation(() => mockImageRepo);
    
    mockGiftRepo.getAll.mockResolvedValue(mockGifts);
    mockReturnRepo.getByGiftId.mockImplementation((giftId) => {
        if (giftId === 'g1') return Promise.resolve([mockReturns[0]]);
        if (giftId === 'g2') return Promise.resolve([mockReturns[1]]);
        return Promise.resolve([]);
    });
    mockImageRepo.getByEntityId.mockImplementation((id) => {
        if (id === 'r1') return Promise.resolve(mockImages);
        return Promise.resolve([]);
    });
  });

  it('renders loading state initially', async () => {
    // Delay resolution to capture loading state
    mockGiftRepo.getAll.mockReturnValue(new Promise(() => {})); 
    render(<ReturnList />);
    expect(screen.getByText('お返し一覧を読み込み中...')).toBeInTheDocument();
  });

  it('renders return list with data', async () => {
    render(<ReturnList />);
    
    await waitFor(() => {
        expect(screen.queryByText('お返し一覧を読み込み中...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('お返し一覧')).toBeInTheDocument();
    expect(screen.getByText('全2件のお返し記録')).toBeInTheDocument();
    
    expect(screen.getByText('Return 1')).toBeInTheDocument();
    expect(screen.getByText('Return 2')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
    expect(screen.getByText('¥3,000')).toBeInTheDocument();
    
    // Statistics
    expect(screen.getByText('お返し総数').parentElement).toHaveTextContent('2');
    expect(screen.getByText('お返し総額').parentElement).toHaveTextContent('¥8,000');
    expect(screen.getByText('平均金額').parentElement).toHaveTextContent('¥4,000');
  });

  it('filters returns by text', async () => {
    render(<ReturnList />);
    await waitFor(() => expect(screen.queryByText('お返し一覧を読み込み中...')).not.toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText('お返し品名、メモ、贈答品名で検索...');
    fireEvent.change(searchInput, { target: { value: 'Return 1' } });
    
    expect(screen.getByText('Return 1')).toBeInTheDocument();
    expect(screen.queryByText('Return 2')).not.toBeInTheDocument();
    
    // Filter by memo
    fireEvent.change(searchInput, { target: { value: 'Memo' } });
    expect(screen.getByText('Return 1')).toBeInTheDocument();
    
    // Clear filter
    fireEvent.click(screen.getByRole('button', { name: 'クリア' }));
    expect(screen.getByText('Return 1')).toBeInTheDocument();
    expect(screen.getByText('Return 2')).toBeInTheDocument();
  });

  it('shows empty state when no returns', async () => {
    mockGiftRepo.getAll.mockResolvedValue([]);
    render(<ReturnList />);
    await waitFor(() => expect(screen.queryByText('お返し一覧を読み込み中...')).not.toBeInTheDocument());
    
    expect(screen.getByText('まだお返しが登録されていません')).toBeInTheDocument();
  });

  it('shows empty state when filtered result is empty', async () => {
    render(<ReturnList />);
    await waitFor(() => expect(screen.queryByText('お返し一覧を読み込み中...')).not.toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText('お返し品名、メモ、贈答品名で検索...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    
    expect(screen.getByText('検索結果が見つかりません')).toBeInTheDocument();
  });

  it('handles error during load', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGiftRepo.getAll.mockRejectedValue(new Error('Load error'));
    
    render(<ReturnList />);
    await waitFor(() => expect(screen.queryByText('お返し一覧を読み込み中...')).not.toBeInTheDocument());
    
    // Should show empty state or handle gracefully
    expect(screen.getByText('まだお返しが登録されていません')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load returns:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('syncs data if online and firebase enabled', async () => {
    (isFirebaseEnabled as any).mockReturnValue(true);
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    
    render(<ReturnList />);
    
    await waitFor(() => {
        expect(syncManager.triggerSync).toHaveBeenCalledWith('test-user');
    });
  });
  
  it('handles sync error gracefully', async () => {
    (isFirebaseEnabled as any).mockReturnValue(true);
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (syncManager.triggerSync as any).mockRejectedValue(new Error('Sync error'));
    
    render(<ReturnList />);
    
    await waitFor(() => {
        expect(syncManager.triggerSync).toHaveBeenCalled();
    });
    
    // Should still load local data
    expect(mockGiftRepo.getAll).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
