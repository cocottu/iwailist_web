import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/ui/Card'

describe('Card', () => {
  it('正しくレンダリングされる', () => {
    render(<Card>テストカード</Card>)
    expect(screen.getByText('テストカード')).toBeInTheDocument()
  })

  it('基本のスタイルが適用される', () => {
    render(<Card>テストカード</Card>)
    const card = screen.getByText('テストカード').parentElement
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('rounded-lg')
  })

  it('ホバー効果が正しく適用される', () => {
    render(<Card hover>ホバーカード</Card>)
    const card = screen.getByText('ホバーカード').parentElement
    expect(card).toHaveClass('hover:shadow-md')
    expect(card).toHaveClass('transition-shadow')
  })

  it('クリック可能なカードが正しく動作する', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>クリックカード</Card>)
    
    const card = screen.getByText('クリックカード').parentElement
    expect(card).toHaveClass('cursor-pointer')
    
    fireEvent.click(card!)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Card className="custom-card">カスタムカード</Card>)
    const card = screen.getByText('カスタムカード').parentElement
    expect(card).toHaveClass('custom-card')
  })

  it('複数の子要素が正しくレンダリングされる', () => {
    render(
      <Card>
        <h2>タイトル</h2>
        <p>説明文</p>
        <button>アクションボタン</button>
      </Card>
    )
    
    expect(screen.getByText('タイトル')).toBeInTheDocument()
    expect(screen.getByText('説明文')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アクションボタン' })).toBeInTheDocument()
  })

  it('ホバー効果なしでクリック可能なカード', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick} hover={false}>クリックカード</Card>)
    
    const card = screen.getByText('クリックカード').parentElement
    expect(card).toHaveClass('cursor-pointer')
    expect(card).not.toHaveClass('hover:shadow-md', 'hover:border-gray-300', 'transition-shadow')
    
    fireEvent.click(card!)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
