import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// テスト用のプロバイダーコンポーネント
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <div data-testid="test-wrapper">
        {children}
      </div>
    </BrowserRouter>
  )
}

// カスタムレンダー関数
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// モック関数のヘルパー
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
) => {
  return vi.fn(implementation)
}

// 非同期関数のモックヘルパー
export const createMockAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  implementation?: T
) => {
  return vi.fn(implementation)
}

// データベース操作のモックヘルパー
export const mockDatabaseOperation = (result?: any) => {
  const mockFn = vi.fn(() => Promise.resolve(result))
  return mockFn
}

// エラーテスト用のヘルパー
export const mockError = (message: string = 'Test error') => {
  return new Error(message)
}

// 日付のモックヘルパー
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString)
  vi.setSystemTime(mockDate)
  return mockDate
}

// ファイルのモックヘルパー
export const createMockFile = (name: string, type: string, content: string) => {
  const file = new File([content], name, { type })
  return file
}

// 画像ファイルのモックヘルパー
export const createMockImageFile = (name: string = 'test-image.jpg') => {
  return createMockFile(name, 'image/jpeg', 'fake-image-data')
}

// テスト用のユーザーイベント
export const createTestUser = () => {
  return {
    click: vi.fn(),
    type: vi.fn(),
    select: vi.fn(),
    upload: vi.fn(),
    clear: vi.fn(),
    tab: vi.fn(),
    hover: vi.fn(),
    unhover: vi.fn(),
  }
}

// 非同期操作の待機ヘルパー
export const waitForAsync = (ms: number = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// モックのリセットヘルパー
export const resetAllMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

// 再エクスポート
export * from '@testing-library/react'
export { customRender as render }
