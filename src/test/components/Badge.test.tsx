import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it('正しくレンダリングされる', () => {
    render(<Badge status="pending">テストバッジ</Badge>)
    expect(screen.getByText('テストバッジ')).toBeInTheDocument()
  })

  it('基本のスタイルが適用される', () => {
    render(<Badge status="pending">テストバッジ</Badge>)
    const badge = screen.getByText('テストバッジ')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium')
  })

  it('pendingステータスが正しく適用される', () => {
    render(<Badge status="pending">未対応</Badge>)
    const badge = screen.getByText('未対応')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('completedステータスが正しく適用される', () => {
    render(<Badge status="completed">対応済</Badge>)
    const badge = screen.getByText('対応済')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('not_requiredステータスが正しく適用される', () => {
    render(<Badge status="not_required">不要</Badge>)
    const badge = screen.getByText('不要')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('successステータスが正しく適用される', () => {
    render(<Badge status="success">成功</Badge>)
    const badge = screen.getByText('成功')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('warningステータスが正しく適用される', () => {
    render(<Badge status="warning">警告</Badge>)
    const badge = screen.getByText('警告')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('errorステータスが正しく適用される', () => {
    render(<Badge status="error">エラー</Badge>)
    const badge = screen.getByText('エラー')
    expect(badge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('infoステータスが正しく適用される', () => {
    render(<Badge status="info">情報</Badge>)
    const badge = screen.getByText('情報')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('カスタムクラスが正しく適用される', () => {
    render(<Badge status="pending" className="custom-class">カスタムバッジ</Badge>)
    const badge = screen.getByText('カスタムバッジ')
    expect(badge).toHaveClass('custom-class')
  })

  it('複数の子要素が正しくレンダリングされる', () => {
    render(
      <Badge status="pending">
        <span>アイコン</span>
        <span>テキスト</span>
      </Badge>
    )
    
    expect(screen.getByText('アイコン')).toBeInTheDocument()
    expect(screen.getByText('テキスト')).toBeInTheDocument()
  })

  it('空の子要素でも正しくレンダリングされる', () => {
    render(<Badge status="pending"></Badge>)
    const badges = screen.getAllByRole('generic')
    const badge = badges.find(el => el.classList.contains('bg-yellow-100'))
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })
})
