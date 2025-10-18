import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils/testUtils'
import { Dashboard } from '@/pages/Dashboard'
import { mockGifts, mockPersons } from '@/test/mocks/mockData'
import { GiftRepository, PersonRepository } from '@/database'

// リポジトリのモック
vi.mock('@/database', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    getStatistics: vi.fn(),
    getAll: vi.fn(),
  })),
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
  })),
}))

describe('Dashboard', () => {
  let mockGiftRepo: any
  let mockPersonRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // モックリポジトリのインスタンスを作成
    mockGiftRepo = {
      getStatistics: vi.fn(),
      getAll: vi.fn(),
    }
    mockPersonRepo = {
      getAll: vi.fn(),
    }
    
    // コンストラクタのモック
    ;(GiftRepository as any).mockImplementation(() => mockGiftRepo)
    ;(PersonRepository as any).mockImplementation(() => mockPersonRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    // 非同期処理を遅延させる
    mockGiftRepo.getStatistics.mockImplementation(() => new Promise(() => {}))
    mockGiftRepo.getAll.mockImplementation(() => new Promise(() => {}))
    mockPersonRepo.getAll.mockImplementation(() => new Promise(() => {}))

    render(<Dashboard />)
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
  })

  it('統計データが正しく表示される', async () => {
    const mockStats = {
      total: 10,
      pending: 3,
      completed: 7,
      totalAmount: 50000,
      monthlyAmount: 15000,
    }

    mockGiftRepo.getStatistics.mockResolvedValue(mockStats)
    mockGiftRepo.getAll.mockResolvedValue(mockGifts)
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
    })

    // 統計カードの確認 - テキストが分割されている可能性を考慮
    expect(screen.getAllByText('未対応')).toHaveLength(2) // 統計カードと贈答品リストの両方に存在
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('件')).toBeInTheDocument()
    expect(screen.getByText('今月')).toBeInTheDocument()
    expect(screen.getByText('15,000')).toBeInTheDocument()
    expect(screen.getByText('円')).toBeInTheDocument()
    expect(screen.getByText('対応済')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('総額')).toBeInTheDocument()
    expect(screen.getByText('50,000')).toBeInTheDocument()
  })

  it('クイックアクションボタンが正しく表示される', async () => {
    mockGiftRepo.getStatistics.mockResolvedValue({
      total: 0,
      pending: 0,
      completed: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    })
    mockGiftRepo.getAll.mockResolvedValue([])
    mockPersonRepo.getAll.mockResolvedValue([])

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('クイックアクション')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /贈答品を登録/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /人物を登録/ })).toBeInTheDocument()
  })

  it('最近の贈答品が正しく表示される', async () => {
    mockGiftRepo.getStatistics.mockResolvedValue({
      total: 3,
      pending: 1,
      completed: 2,
      totalAmount: 30000,
      monthlyAmount: 10000,
    })
    mockGiftRepo.getAll.mockResolvedValue(mockGifts)
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('最近の贈答品')).toBeInTheDocument()
    })

    // 贈答品の表示確認
    expect(screen.getByText('テストギフト')).toBeInTheDocument()
    expect(screen.getByText(/田中太郎/)).toBeInTheDocument()
    expect(screen.getByText('お祝い')).toBeInTheDocument()
  })

  it('贈答品がない場合のEmptyStateが表示される', async () => {
    mockGiftRepo.getStatistics.mockResolvedValue({
      total: 0,
      pending: 0,
      completed: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    })
    mockGiftRepo.getAll.mockResolvedValue([])
    mockPersonRepo.getAll.mockResolvedValue([])

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('まだ贈答品が登録されていません')).toBeInTheDocument()
    })

    expect(screen.getByText('最初の贈答品を登録')).toBeInTheDocument()
  })

  it('エラー時のEmptyStateが表示される', async () => {
    mockGiftRepo.getStatistics.mockRejectedValue(new Error('Database error'))
    mockGiftRepo.getAll.mockRejectedValue(new Error('Database error'))
    mockPersonRepo.getAll.mockRejectedValue(new Error('Database error'))

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument()
    })

    expect(screen.getByText('再読み込み')).toBeInTheDocument()
  })

  it('再読み込みボタンが正しく動作する', async () => {
    mockGiftRepo.getStatistics
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce({
        total: 1,
        pending: 1,
        completed: 0,
        totalAmount: 5000,
        monthlyAmount: 5000,
      })
    mockGiftRepo.getAll
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce(mockGifts)
    mockPersonRepo.getAll
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce(mockPersons)

    render(<Dashboard />)

    // エラー状態の確認
    await waitFor(() => {
      expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument()
    })

    // 再読み込みボタンをクリック
    const reloadButton = screen.getByText('再読み込み')
    fireEvent.click(reloadButton)

    // 正常な状態に戻ることを確認（タイムアウトを長めに設定）
    await waitFor(() => {
      expect(screen.getByText('最近の贈答品')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('贈答品の詳細リンクが正しく動作する', async () => {
    mockGiftRepo.getStatistics.mockResolvedValue({
      total: 1,
      pending: 1,
      completed: 0,
      totalAmount: 5000,
      monthlyAmount: 5000,
    })
    mockGiftRepo.getAll.mockResolvedValue([mockGifts[0]])
    mockPersonRepo.getAll.mockResolvedValue([mockPersons[0]])

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('最近の贈答品')).toBeInTheDocument()
    })

    const detailLink = screen.getByText('詳細 →')
    expect(detailLink).toHaveAttribute('href', '/gifts/1')
  })

  it('贈答品のステータスバッジが正しく表示される', async () => {
    const giftsWithDifferentStatus = [
      { ...mockGifts[0], returnStatus: 'pending' as any },
      { ...mockGifts[1], returnStatus: 'completed' as any },
      { ...mockGifts[2], returnStatus: 'not_required' as any },
    ]

    mockGiftRepo.getStatistics.mockResolvedValue({
      total: 3,
      pending: 1,
      completed: 1,
      totalAmount: 15000,
      monthlyAmount: 5000,
    })
    mockGiftRepo.getAll.mockResolvedValue(giftsWithDifferentStatus)
    mockPersonRepo.getAll.mockResolvedValue(mockPersons)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getAllByText('未対応')).toHaveLength(2) // 統計カードとバッジ
      expect(screen.getAllByText('対応済')).toHaveLength(2) // 統計カードとバッジ
      expect(screen.getAllByText('不要')).toHaveLength(1) // バッジのみ
    })
  })
})
