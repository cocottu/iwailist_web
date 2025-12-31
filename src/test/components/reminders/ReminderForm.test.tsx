import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { ReminderRepository } from '@/database'

// date-fnsのモック
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      if (formatStr === 'yyyy-MM-dd') {
        return date.toISOString().split('T')[0]
      }
      return date.toISOString()
    }),
    addDays: vi.fn((date: Date, days: number) => {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }),
    addWeeks: vi.fn((date: Date, weeks: number) => {
      const result = new Date(date)
      result.setDate(result.getDate() + weeks * 7)
      return result
    }),
    addMonths: vi.fn((date: Date, months: number) => {
      const result = new Date(date)
      result.setMonth(result.getMonth() + months)
      return result
    }),
  }
})

// リポジトリのモック
vi.mock('@/database', () => ({
  ReminderRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn(),
    update: vi.fn(),
  })),
}))

describe('ReminderForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()
  let mockReminderRepo: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockReminderRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    }

    ;(ReminderRepository as any).mockImplementation(() => mockReminderRepo)
  })

  it('新規登録フォームが正しく表示される', () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('リマインダーを設定')).toBeInTheDocument()
    expect(screen.getByText('対象の贈答品')).toBeInTheDocument()
    expect(screen.getByText('テストギフト')).toBeInTheDocument()
    expect(screen.getByText('設定する')).toBeInTheDocument()
  })

  it('編集フォームが正しく表示される', () => {
    const reminderData = {
      id: 'reminder-1',
      userId: 'demo-user',
      giftId: 'gift-1',
      reminderDate: new Date('2024-02-01'),
      message: '既存のリマインダー',
      completed: false,
      createdAt: new Date('2024-01-01'),
    }

    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        reminderData={reminderData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('リマインダーを編集')).toBeInTheDocument()
    expect(screen.getByDisplayValue('既存のリマインダー')).toBeInTheDocument()
    expect(screen.getByText('更新する')).toBeInTheDocument()
  })

  it('メッセージが未入力の場合はエラーを表示', async () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // メッセージをクリア
    const messageInput = screen.getByPlaceholderText('お返しを準備する、連絡するなど')
    fireEvent.change(messageInput, { target: { value: '' } })

    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('メッセージは必須です')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('正しい入力でフォームが送信される', async () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReminderRepo.create).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('キャンセルボタンが正しく動作する', () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('クイック選択ボタンが表示される（新規作成時）', () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('明日')).toBeInTheDocument()
    expect(screen.getByText('3日後')).toBeInTheDocument()
    expect(screen.getByText('1週間後')).toBeInTheDocument()
    expect(screen.getByText('2週間後')).toBeInTheDocument()
    expect(screen.getByText('1ヶ月後')).toBeInTheDocument()
  })

  it('クイック選択ボタンが非表示（編集時）', () => {
    const reminderData = {
      id: 'reminder-1',
      userId: 'demo-user',
      giftId: 'gift-1',
      reminderDate: new Date('2024-02-01'),
      message: '既存のリマインダー',
      completed: false,
      createdAt: new Date('2024-01-01'),
    }

    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        reminderData={reminderData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.queryByText('明日')).not.toBeInTheDocument()
    expect(screen.queryByText('3日後')).not.toBeInTheDocument()
  })

  it('クイック選択ボタンで日付が変更される', async () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const tomorrowButton = screen.getByText('明日')
    fireEvent.click(tomorrowButton)

    // フォームが送信できることを確認
    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReminderRepo.create).toHaveBeenCalled()
    })
  })

  it('1ヶ月後ボタンで日付が変更される', async () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const monthButton = screen.getByText('1ヶ月後')
    fireEvent.click(monthButton)

    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReminderRepo.create).toHaveBeenCalled()
    })
  })

  it('編集時に既存データが更新される', async () => {
    const reminderData = {
      id: 'reminder-1',
      userId: 'demo-user',
      giftId: 'gift-1',
      reminderDate: new Date('2024-02-01'),
      message: '既存のリマインダー',
      completed: false,
      createdAt: new Date('2024-01-01'),
    }

    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        reminderData={reminderData}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const messageInput = screen.getByDisplayValue('既存のリマインダー')
    fireEvent.change(messageInput, { target: { value: '更新されたメッセージ' } })

    const submitButton = screen.getByText('更新する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockReminderRepo.update).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('エラー入力時にエラーがクリアされる', async () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // メッセージをクリアしてエラーを発生させる
    const messageInput = screen.getByPlaceholderText('お返しを準備する、連絡するなど')
    fireEvent.change(messageInput, { target: { value: '' } })

    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('メッセージは必須です')).toBeInTheDocument()
    })

    // 入力するとエラーがクリアされる
    fireEvent.change(messageInput, { target: { value: 'テストメッセージ' } })

    await waitFor(() => {
      expect(screen.queryByText('メッセージは必須です')).not.toBeInTheDocument()
    })
  })

  it('保存中は入力が無効になる', async () => {
    mockReminderRepo.create.mockImplementation(() => new Promise(() => {}))

    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('設定する')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('保存中...')).toBeInTheDocument()
    })
  })

  it('デフォルトメッセージにギフト名が含まれる', () => {
    render(
      <ReminderForm
        giftId="gift-1"
        giftName="テストギフト"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const messageInput = screen.getByPlaceholderText('お返しを準備する、連絡するなど')
    expect(messageInput).toHaveValue('テストギフトのお返しを準備する')
  })
})
