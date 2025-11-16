import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReminderCard } from '@/components/reminders/ReminderCard'
import { Gift, GiftCategory, Reminder, ReturnStatus } from '@/types'

const baseNow = new Date('2025-01-10T09:00:00Z')
const dayMs = 24 * 60 * 60 * 1000

const createReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'reminder-1',
  userId: 'user-1',
  giftId: 'gift-1',
  reminderDate: new Date(baseNow),
  message: 'お礼の連絡をする',
  completed: false,
  createdAt: new Date(baseNow),
  ...overrides
})

const sampleGift: Gift = {
  id: 'gift-1',
  userId: 'user-1',
  personId: 'person-1',
  giftName: '内祝いセット',
  receivedDate: new Date(baseNow),
  amount: 5000,
  category: GiftCategory.CELEBRATION,
  returnStatus: ReturnStatus.PENDING,
  memo: 'サンプルギフト',
  createdAt: new Date(baseNow),
  updatedAt: new Date(baseNow)
}

const renderReminderCard = (reminder: Reminder, gift?: Gift) => {
  const onComplete = vi.fn()
  const onDelete = vi.fn()

  render(
    <MemoryRouter>
      <ReminderCard
        reminder={reminder}
        gift={gift}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </MemoryRouter>
  )

  return { onComplete, onDelete }
}

describe('ReminderCard', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.setSystemTime(baseNow)
  })

  afterEach(() => {
    cleanup()
  })

  it('完了済みのリマインダーは完了バッジを表示し、完了ボタンを非表示にする', () => {
    renderReminderCard(createReminder({ completed: true }))

    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(screen.queryByTitle('完了にする')).toBeNull()
  })

  it.each([
    { offsetDays: -2, expected: '期限切れ' },
    { offsetDays: 0, expected: '今日' },
    { offsetDays: 2, expected: 'あと2日' },
    { offsetDays: 5, expected: 'あと5日' },
    { offsetDays: 10, expected: 'あと10日' }
  ])('日数によって緊急度バッジを切り替える ($expected)', ({ offsetDays, expected }) => {
    const reminder = createReminder({
      reminderDate: new Date(baseNow.getTime() + offsetDays * dayMs)
    })

    renderReminderCard(reminder)

    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('完了ボタンを押すとonCompleteが呼び出される', () => {
    const reminder = createReminder()
    const { onComplete } = renderReminderCard(reminder)

    fireEvent.click(screen.getByTitle('完了にする'))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(reminder.id)
  })

  it('削除ボタンを押すとonDeleteが呼び出される', () => {
    const reminder = createReminder()
    const { onDelete } = renderReminderCard(reminder)

    fireEvent.click(screen.getByText('削除'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(reminder.id)
  })

  it('紐づく贈答品がある場合にリンクを表示する', () => {
    renderReminderCard(createReminder(), sampleGift)

    const giftLink = screen.getByRole('link', { name: /内祝いセット/ })
    expect(giftLink).toHaveAttribute('href', '/gifts/gift-1')
  })
})
