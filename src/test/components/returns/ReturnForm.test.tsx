import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils'
import { ReturnForm } from '@/components/returns/ReturnForm'
import { ReturnRepository, ImageRepository } from '@/database'

// CameraCaptureコンポーネントのモック
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui')
  return {
    ...actual,
    CameraCapture: ({ onCapture, onCancel }: { onCapture: (url: string) => void; onCancel: () => void }) => (
      <div data-testid="camera-capture">
        <button onClick={() => onCapture('data:image/jpeg;base64,test')}>撮影</button>
        <button onClick={onCancel}>カメラキャンセル</button>
      </div>
    ),
  }
})

// リポジトリのモック
vi.mock('@/database', () => ({
  ReturnRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn(),
    update: vi.fn(),
  })),
  ImageRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn(),
    deleteByEntityId: vi.fn(),
  })),
}))

describe('ReturnForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()
  let mockReturnRepo: any
  let mockImageRepo: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockReturnRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    }
    mockImageRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      deleteByEntityId: vi.fn().mockResolvedValue(undefined),
    }

    ;(ReturnRepository as any).mockImplementation(() => mockReturnRepo)
    ;(ImageRepository as any).mockImplementation(() => mockImageRepo)
  })

  it('新規登録フォームが正しく表示される', () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('お返しを登録')).toBeInTheDocument()
    expect(screen.getByText('登録する')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('編集フォームが正しく表示される', () => {
    const returnData = {
      id: 'return-1',
      giftId: 'gift-1',
      returnName: 'お返しギフト',
      returnDate: new Date('2024-01-15'),
      amount: 5000,
      memo: 'テストメモ',
      createdAt: new Date('2024-01-15'),
    }

    render(
      <ReturnForm
        giftId="gift-1"
        returnData={returnData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('お返し情報を編集')).toBeInTheDocument()
    expect(screen.getByDisplayValue('お返しギフト')).toBeInTheDocument()
    expect(screen.getByText('更新する')).toBeInTheDocument()
  })

  it('お返し品名が未入力の場合はエラーを表示', async () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('登録する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('お返し品名は必須です')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('正しい入力でフォームが送信される', async () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // お返し品名を入力
    const nameInput = screen.getByPlaceholderText('カタログギフト、お菓子など')
    fireEvent.change(nameInput, { target: { value: 'カタログギフト' } })

    const submitButton = screen.getByText('登録する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReturnRepo.create).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('キャンセルボタンが正しく動作する', () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('メモを入力できる', () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const memoInput = screen.getByPlaceholderText('お返しの詳細など')
    fireEvent.change(memoInput, { target: { value: 'テストメモ' } })

    expect(memoInput).toHaveValue('テストメモ')
  })

  it('写真撮影ボタンでカメラが表示される', async () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cameraButton = screen.getByText('📷 写真を撮影')
    fireEvent.click(cameraButton)

    await waitFor(() => {
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument()
    })
  })

  it('編集時に既存データが更新される', async () => {
    const returnData = {
      id: 'return-1',
      giftId: 'gift-1',
      returnName: 'お返しギフト',
      returnDate: new Date('2024-01-15'),
      amount: 5000,
      memo: 'テストメモ',
      createdAt: new Date('2024-01-15'),
    }

    render(
      <ReturnForm
        giftId="gift-1"
        returnData={returnData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByDisplayValue('お返しギフト')
    fireEvent.change(nameInput, { target: { value: '更新されたギフト' } })

    const submitButton = screen.getByText('更新する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReturnRepo.update).toHaveBeenCalled()
      expect(mockImageRepo.deleteByEntityId).toHaveBeenCalledWith('return-1')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('金額を入力できる', () => {
    render(
      <ReturnForm
        giftId="gift-1"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const amountInput = screen.getByPlaceholderText('5000')
    fireEvent.change(amountInput, { target: { value: '3000' } })

    expect(amountInput).toHaveValue(3000)
  })
})
