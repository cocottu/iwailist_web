import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('正しくレンダリングされる', () => {
    render(<EmptyState message="テストメッセージ" />)
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
  })

  it('メッセージが正しく表示される', () => {
    render(<EmptyState message="データがありません" />)
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('アクションボタンが正しく表示される', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        message="テストメッセージ"
        action={{
          label: 'アクション',
          onClick: handleClick
        }}
      />
    )
    
    const button = screen.getByRole('button', { name: 'アクション' })
    expect(button).toBeInTheDocument()
  })

  it('アクションボタンがクリックされた時に正しく発火する', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        message="テストメッセージ"
        action={{
          label: 'アクション',
          onClick: handleClick
        }}
      />
    )
    
    const button = screen.getByRole('button', { name: 'アクション' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('アイコンが正しく表示される', () => {
    const TestIcon = () => <span data-testid="test-icon">📦</span>
    render(
      <EmptyState
        message="テストメッセージ"
        icon={<TestIcon />}
      />
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('アイコンとアクションが同時に表示される', () => {
    const handleClick = vi.fn()
    const TestIcon = () => <span data-testid="test-icon">📦</span>
    render(
      <EmptyState
        message="テストメッセージ"
        icon={<TestIcon />}
        action={{
          label: 'アクション',
          onClick: handleClick
        }}
      />
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument()
  })

  it('アクションなしでも正しく動作する', () => {
    render(<EmptyState message="アクションなしメッセージ" />)
    expect(screen.getByText('アクションなしメッセージ')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('アイコンなしでも正しく動作する', () => {
    render(<EmptyState message="アイコンなしメッセージ" />)
    expect(screen.getByText('アイコンなしメッセージ')).toBeInTheDocument()
  })

  it('基本のスタイルが適用される', () => {
    render(<EmptyState message="テストメッセージ" />)
    const container = screen.getByText('テストメッセージ').closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-12', 'px-4')
  })

  it('メッセージのスタイルが正しく適用される', () => {
    render(<EmptyState message="テストメッセージ" />)
    const message = screen.getByText('テストメッセージ')
    expect(message).toHaveClass('text-gray-500', 'text-center', 'mb-4')
  })

  it('アクションボタンのスタイルが正しく適用される', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        message="テストメッセージ"
        action={{
          label: 'アクション',
          onClick: handleClick
        }}
      />
    )
    
    const button = screen.getByRole('button', { name: 'アクション' })
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'border',
      'border-transparent',
      'text-sm',
      'font-medium',
      'rounded-md',
      'text-white',
      'bg-blue-600',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-blue-500'
    )
  })

  it('アイコンのスタイルが正しく適用される', () => {
    const TestIcon = () => <span>📦</span>
    render(
      <EmptyState
        message="テストメッセージ"
        icon={<TestIcon />}
      />
    )
    
    const iconContainer = screen.getByText('📦').closest('div')
    expect(iconContainer).toHaveClass('mb-4', 'text-gray-400')
  })

  it('複数のアクションクリックが正しく処理される', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        message="テストメッセージ"
        action={{
          label: 'アクション',
          onClick: handleClick
        }}
      />
    )
    
    const button = screen.getByRole('button', { name: 'アクション' })
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('長いメッセージでも正しく表示される', () => {
    const longMessage = 'これは非常に長いメッセージです。複数行にわたって表示される可能性があります。'
    render(<EmptyState message={longMessage} />)
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('空のメッセージでも正しく動作する', () => {
    render(<EmptyState message="" />)
    const containers = screen.getAllByRole('generic')
    const mainContainer = containers.find(el => 
      el.classList.contains('flex') && 
      el.classList.contains('flex-col') && 
      el.classList.contains('items-center')
    )
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('py-12', 'px-4')
  })
})
