import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils/testUtils'
import { GiftList } from '@/pages/GiftList'
import { mockGifts, mockPersons } from '@/test/mocks/mockData'
import { GiftRepository, PersonRepository } from '@/database'

// リポジトリのモック
vi.mock('@/database', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
  })),
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
  })),
}))

describe('GiftList', () => {
  let mockGiftRepo: any
  let mockPersonRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockGiftRepo = {
      query: vi.fn(),
    }
    mockPersonRepo = {
      getAll: vi.fn(),
    }
    
    ;(GiftRepository as any).mockImplementation(() => mockGiftRepo)
    ;(PersonRepository as any).mockImplementation(() => mockPersonRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    mockPersonRepo.getAll.mockImplementation(() => new Promise(() => {}))
    mockGiftRepo.query.mockImplementation(() => new Promise(() => {}))

    render(<GiftList />)
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
  })

  it('贈答品一覧が正しく表示される', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    expect(screen.getByText('3件の贈答品が登録されています')).toBeInTheDocument()
    expect(screen.getByText('テストギフト')).toBeInTheDocument()
    expect(screen.getByText('お菓子セット')).toBeInTheDocument()
    expect(screen.getByText('お酒')).toBeInTheDocument()
  })

  it('新規登録ボタンが正しく表示される', async () => {
    mockPersonRepo.getAll.mockResolvedValue([])
    mockGiftRepo.query.mockResolvedValue([])

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    const newButton = screen.getByRole('link', { name: /新規登録/ })
    expect(newButton).toHaveAttribute('href', '/gifts/new')
  })

  it('フィルター機能が正しく動作する', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    // 検索フィールドの確認
    const searchInput = screen.getByPlaceholderText('贈答品名で検索...')
    expect(searchInput).toBeInTheDocument()

    // カテゴリフィルターの確認
    const categorySelect = screen.getByDisplayValue('すべてのカテゴリ')
    expect(categorySelect).toBeInTheDocument()

    // 状況フィルターの確認
    const statusSelect = screen.getByDisplayValue('すべての状況')
    expect(statusSelect).toBeInTheDocument()

    // リセットボタンの確認
    expect(screen.getByText('リセット')).toBeInTheDocument()
  })

  it('検索フィルターが正しく動作する', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('贈答品名で検索...')
    
    // 検索テキストを入力
    fireEvent.change(searchInput, { target: { value: 'テスト' } })

    await waitFor(() => {
      const calls = mockGiftRepo.query.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[1]).toMatchObject({
        searchText: 'テスト'
      })
    })
  })

      it('カテゴリフィルターが正しく動作する', async () => {
        mockPersonRepo.getAll.mockResolvedValue(mockPersons)
        mockGiftRepo.query.mockResolvedValue(mockGifts)

        render(<GiftList />)

        await waitFor(() => {
          expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
        })

        const categorySelect = screen.getByDisplayValue('すべてのカテゴリ')
        
        // カテゴリを選択
        fireEvent.change(categorySelect, { target: { value: '結婚祝い' } })

        await waitFor(() => {
          const calls = mockGiftRepo.query.mock.calls
          // クエリが呼び出されたことを確認
          expect(calls.length).toBeGreaterThan(1)
        })
      })

  it('状況フィルターが正しく動作する', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    const statusSelect = screen.getByDisplayValue('すべての状況')
    
    // 状況を選択
    fireEvent.change(statusSelect, { target: { value: 'pending' } })

    await waitFor(() => {
      const calls = mockGiftRepo.query.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[1]).toMatchObject({
        returnStatus: 'pending'
      })
    })
  })

  it('リセットボタンが正しく動作する', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
    })

    // フィルターを設定
    const searchInput = screen.getByPlaceholderText('贈答品名で検索...')
    fireEvent.change(searchInput, { target: { value: 'テスト' } })

    // リセットボタンをクリック
    const resetButton = screen.getByText('リセット')
    fireEvent.click(resetButton)

    // フィルターがリセットされることを確認
    expect(searchInput).toHaveValue('')
  })

  it('贈答品がない場合のEmptyStateが表示される', async () => {
    mockPersonRepo.getAll.mockResolvedValue([])
    mockGiftRepo.query.mockResolvedValue([])

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('贈答品が見つかりません')).toBeInTheDocument()
    })

    expect(screen.getByText('最初の贈答品を登録')).toBeInTheDocument()
  })

  it('贈答品の詳細情報が正しく表示される', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('テストギフト')).toBeInTheDocument()
    })

    // 人物名の表示確認
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    
    // カテゴリの表示確認（最初の贈答品の詳細情報のみ）
    const categoryLabels = screen.getAllByText('カテゴリ:')
    const firstCategoryValue = categoryLabels[0].parentElement?.querySelector('.text-gray-900')
    expect(firstCategoryValue).toHaveTextContent('お祝い')
    
    // 金額の表示確認（金額がある場合）
    expect(screen.getByText('5,000円')).toBeInTheDocument()
  })

      it('贈答品のステータスバッジが正しく表示される', async () => {
        const giftsWithStatus = [
          { ...mockGifts[0], returnStatus: 'pending' as const },
          { ...mockGifts[1], returnStatus: 'completed' as const },
          { ...mockGifts[2], returnStatus: 'not_required' as const },
        ]

        mockPersonRepo.getAll.mockResolvedValue(mockPersons)
        mockGiftRepo.query.mockResolvedValue(giftsWithStatus)

        render(<GiftList />)

        await waitFor(() => {
          // セレクトオプションとバッジの両方に同じテキストがあるため、getAllByTextを使用
          expect(screen.getAllByText('未対応')).toHaveLength(2) // セレクトオプションとバッジ
          expect(screen.getAllByText('対応済')).toHaveLength(2) // セレクトオプションとバッジ
          expect(screen.getAllByText('不要')).toHaveLength(2) // セレクトオプションとバッジ
        })
      })

  it('詳細ボタンが正しく動作する', async () => {
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)
    mockGiftRepo.query.mockResolvedValue(mockGifts)

    render(<GiftList />)

    await waitFor(() => {
      expect(screen.getByText('テストギフト')).toBeInTheDocument()
    })

    const detailLinks = screen.getAllByRole('link', { name: '詳細を見る' })
    expect(detailLinks[0]).toHaveAttribute('href', '/gifts/1')
  })

      it('複数のフィルターが同時に適用される', async () => {
        mockPersonRepo.getAll.mockResolvedValue(mockPersons)
        mockGiftRepo.query.mockResolvedValue(mockGifts)

        render(<GiftList />)

        await waitFor(() => {
          expect(screen.getByText('贈答品一覧')).toBeInTheDocument()
        })

        // 複数のフィルターを設定
        const searchInput = screen.getByPlaceholderText('贈答品名で検索...')
        const statusSelect = screen.getByDisplayValue('すべての状況')

        // 検索テキストを入力
        fireEvent.change(searchInput, { target: { value: 'テスト' } })
        
        // 状況を選択
        fireEvent.change(statusSelect, { target: { value: 'pending' } })

        // 最後の呼び出しを確認（すべてのフィルターが適用された状態）
        await waitFor(() => {
          const calls = mockGiftRepo.query.mock.calls
          const lastCall = calls[calls.length - 1]
          // フィルターが正しく適用されていることを確認
          expect(lastCall[1]).toHaveProperty('searchText', 'テスト')
          expect(lastCall[1]).toHaveProperty('returnStatus', 'pending')
        })
      })
})
