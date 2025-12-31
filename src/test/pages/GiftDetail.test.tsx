import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/utils/testUtils'
import { GiftDetail } from '@/pages/GiftDetail'
import { mockGift, mockPerson, mockImages } from '@/test/mocks/mockData'
import { GiftRepository, PersonRepository, ImageRepository } from '@/database'

// react-router-domのモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  }
})

// AuthContextのモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    loading: false,
    isAuthenticated: true,
  }),
}))

// リポジトリのモック
vi.mock('@/database', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    delete: vi.fn(),
  })),
  PersonRepository: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
  })),
  ImageRepository: vi.fn().mockImplementation(() => ({
    getByEntityId: vi.fn(),
    deleteByEntityId: vi.fn(),
  })),
}))

// ReturnHistoryコンポーネントのモック
vi.mock('@/components/returns/ReturnHistory', () => ({
  ReturnHistory: ({ giftId }: { giftId: string }) => (
    <div data-testid="return-history">お返し履歴 - {giftId}</div>
  ),
}))

// ReminderFormコンポーネントのモック
vi.mock('@/components/reminders/ReminderForm', () => ({
  ReminderForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div data-testid="reminder-form">
      <button onClick={onSuccess}>保存</button>
      <button onClick={onCancel}>キャンセル</button>
    </div>
  ),
}))

describe('GiftDetail', () => {
  let mockGiftRepo: any
  let mockPersonRepo: any
  let mockImageRepo: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()

    mockGiftRepo = {
      get: vi.fn(),
      delete: vi.fn(),
    }
    mockPersonRepo = {
      get: vi.fn(),
    }
    mockImageRepo = {
      getByEntityId: vi.fn(),
      deleteByEntityId: vi.fn(),
    }

    ;(GiftRepository as any).mockImplementation(() => mockGiftRepo)
    ;(PersonRepository as any).mockImplementation(() => mockPersonRepo)
    ;(ImageRepository as any).mockImplementation(() => mockImageRepo)
  })

  it('ローディング状態が正しく表示される', () => {
    mockGiftRepo.get.mockImplementation(() => new Promise(() => {}))
    
    render(<GiftDetail />)
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument()
  })

  it('贈答品の詳細が正しく表示される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('テストギフト')).toBeInTheDocument()
    })

    expect(screen.getByText('基本情報')).toBeInTheDocument()
    expect(screen.getAllByText('田中太郎').length).toBeGreaterThan(0)
    expect(screen.getByText('お祝い')).toBeInTheDocument()
  })

  it('贈答品が見つからない場合はEmptyStateを表示', async () => {
    mockGiftRepo.get.mockResolvedValue(null)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('贈答品が見つかりません')).toBeInTheDocument()
    })

    expect(screen.getByText('一覧に戻る')).toBeInTheDocument()
  })

  it('画像ギャラリーが正しく表示される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue(mockImages)

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('写真')).toBeInTheDocument()
    })
  })

  it('お返し状況バッジが正しく表示される - pending', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, returnStatus: 'pending' })
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('未対応')).toBeInTheDocument()
    })
  })

  it('お返し状況バッジが正しく表示される - completed', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, returnStatus: 'completed' })
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('対応済')).toBeInTheDocument()
    })
  })

  it('お返し状況バッジが正しく表示される - not_required', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, returnStatus: 'not_required' })
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('不要')).toBeInTheDocument()
    })
  })

  it('メモが正しく表示される', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, memo: 'テスト用のメモ' })
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('メモ')).toBeInTheDocument()
      expect(screen.getByText('テスト用のメモ')).toBeInTheDocument()
    })
  })

  it('人物情報が正しく表示される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('贈り主情報')).toBeInTheDocument()
    })

    expect(screen.getByText('友人')).toBeInTheDocument()
    expect(screen.getByText('たなかたろう')).toBeInTheDocument()
  })

  it('お返し履歴コンポーネントが表示される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByTestId('return-history')).toBeInTheDocument()
    })
  })

  it('編集リンクが正しく設定される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      const editButtons = screen.getAllByText('編集')
      expect(editButtons.length).toBeGreaterThan(0)
    })
  })

  it('削除ボタンが正しく動作する - キャンセル', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    // window.confirmをモック（キャンセル）
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockGiftRepo.delete).not.toHaveBeenCalled()
  })

  it('削除ボタンが正しく動作する - 確認', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])
    mockGiftRepo.delete.mockResolvedValue(undefined)
    mockImageRepo.deleteByEntityId.mockResolvedValue(undefined)

    // window.confirmをモック（確認）
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockImageRepo.deleteByEntityId).toHaveBeenCalledWith('1')
      expect(mockGiftRepo.delete).toHaveBeenCalledWith('1', 'demo-user')
      expect(mockNavigate).toHaveBeenCalledWith('/gifts')
    })
  })

  it('金額が正しく表示される', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, amount: 10000 })
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('10,000円')).toBeInTheDocument()
    })
  })

  it('リマインダー設定ボタンでフォームが表示される', async () => {
    mockGiftRepo.get.mockResolvedValue(mockGift)
    mockPersonRepo.get.mockResolvedValue(mockPerson)
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('⏰ リマインダー設定')).toBeInTheDocument()
    })

    const reminderButton = screen.getByText('⏰ リマインダー設定')
    fireEvent.click(reminderButton)

    await waitFor(() => {
      expect(screen.getByTestId('reminder-form')).toBeInTheDocument()
    })
  })

  it('personIdがない場合は不明な人物と表示される', async () => {
    mockGiftRepo.get.mockResolvedValue({ ...mockGift, personId: undefined })
    mockImageRepo.getByEntityId.mockResolvedValue([])

    render(<GiftDetail />)

    await waitFor(() => {
      expect(screen.getByText('不明な人物')).toBeInTheDocument()
    })
  })
})
