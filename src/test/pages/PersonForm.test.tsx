import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PersonForm } from '@/pages/PersonForm';

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
  PersonRepository: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      id: '1',
      userId: 'user-1',
      name: 'Test Person',
      furigana: 'テストパーソン',
      relationship: 'friend',
      contact: 'test@example.com',
      memo: 'Test memo',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined)
  }))
}));

describe('PersonForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('新規作成モード', () => {
    it('正しくレンダリングされる', async () => {
      render(
        <MemoryRouter initialEntries={['/persons/new']}>
          <Routes>
            <Route path="/persons/new" element={<PersonForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('人物を登録')).toBeInTheDocument();
      });
    });

    it('必要なフォームフィールドが表示される', async () => {
      render(
        <MemoryRouter initialEntries={['/persons/new']}>
          <Routes>
            <Route path="/persons/new" element={<PersonForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('氏名')).toBeInTheDocument();
        expect(screen.getByText('フリガナ')).toBeInTheDocument();
        expect(screen.getByText('関係性')).toBeInTheDocument();
      });
    });
  });

  describe('編集モード', () => {
    it('既存データがロードされる', async () => {
      render(
        <MemoryRouter initialEntries={['/persons/1']}>
          <Routes>
            <Route path="/persons/:id" element={<PersonForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('人物を編集')).toBeInTheDocument();
      });
    });

    it('フォームに既存データが入力される', async () => {
      render(
        <MemoryRouter initialEntries={['/persons/1']}>
          <Routes>
            <Route path="/persons/:id" element={<PersonForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test Person');
        expect(nameInput).toBeInTheDocument();
      });
    });
  });

  describe('バリデーション', () => {
    it('フォームに氏名フィールドが存在する', async () => {
      render(
        <MemoryRouter initialEntries={['/persons/new']}>
          <Routes>
            <Route path="/persons/new" element={<PersonForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('人物を登録')).toBeInTheDocument();
      });

      // フォームに氏名ラベルが存在する
      expect(screen.getByText('氏名')).toBeInTheDocument();
    });
  });

});
