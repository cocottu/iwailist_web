import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>)
    expect(screen.getByRole('button', { name: 'テストボタン' })).toBeInTheDocument()
  })

  it('異なるバリアントが正しく適用される', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600')

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border', 'border-gray-300')
  })

  it('異なるサイズが正しく適用される', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('ローディング状態が正しく表示される', () => {
    render(<Button loading>ローディング中</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument()
  })

  it('無効状態が正しく適用される', () => {
    render(<Button disabled>無効ボタン</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('クリックイベントが正しく発火する', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>クリックボタン</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ローディング中はクリックイベントが発火しない', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>ローディング中</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('無効状態ではクリックイベントが発火しない', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>無効ボタン</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Button className="custom-class">カスタムボタン</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('その他のpropsが正しく渡される', () => {
    render(<Button data-testid="test-button" type="submit">Submit</Button>)
    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
