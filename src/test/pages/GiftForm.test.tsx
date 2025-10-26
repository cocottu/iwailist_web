import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GiftForm } from '@/pages/GiftForm';

// AuthContextのモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    loading: false,
    isAuthenticated: true,
  }),
}));

// データベースをモック
vi.mock('@/database', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      id: '1',
      userId: 'user-1',
      personId: 'person-1',
      giftName: 'Test Gift',
      receivedDate: new Date('2024-01-01'),
      amount: 10000,
      category: 'wedding',
      returnStatus: 'pending',
      memo: 'Test memo',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined)
  })),
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'person-1',
        userId: 'user-1',
        name: 'Test Person',
        relationship: 'friend',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  }))
}));

describe('GiftForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('新規作成モード', () => {
    it('正しくレンダリングされる', async () => {
      render(
        <MemoryRouter initialEntries={['/gifts/new']}>
          <Routes>
            <Route path="/gifts/new" element={<GiftForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('贈答品を登録')).toBeInTheDocument();
      });
    });

  });

  describe('編集モード', () => {
    it('既存データがロードされる', async () => {
      render(
        <MemoryRouter initialEntries={['/gifts/1']}>
          <Routes>
            <Route path="/gifts/:id" element={<GiftForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('贈答品を編集')).toBeInTheDocument();
      });
    });

    it('フォームに既存データが入力される', async () => {
      render(
        <MemoryRouter initialEntries={['/gifts/1']}>
          <Routes>
            <Route path="/gifts/:id" element={<GiftForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const giftNameInput = screen.getByDisplayValue('Test Gift');
        expect(giftNameInput).toBeInTheDocument();
      });
    });
  });


});
