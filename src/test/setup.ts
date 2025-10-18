import '@testing-library/jest-dom'
import { vi } from 'vitest'

// IndexedDBのモック
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
    cmp: vi.fn(),
  },
})

// IDBのモック
vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        add: vi.fn(() => Promise.resolve()),
        put: vi.fn(() => Promise.resolve()),
        get: vi.fn(() => Promise.resolve()),
        getAll: vi.fn(() => Promise.resolve([])),
        delete: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve()),
        count: vi.fn(() => Promise.resolve(0)),
      })),
    })),
    close: vi.fn(),
  })),
}))

// データベース初期化のモック
vi.mock('@/database', () => ({
  initializeDB: vi.fn(() => Promise.resolve()),
  getDB: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        add: vi.fn(() => Promise.resolve()),
        put: vi.fn(() => Promise.resolve()),
        get: vi.fn(() => Promise.resolve()),
        getAll: vi.fn(() => Promise.resolve([])),
        delete: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve()),
        count: vi.fn(() => Promise.resolve(0)),
      })),
    })),
    close: vi.fn(),
  })),
}))

// リポジトリのモック
vi.mock('@/database/repositories/giftRepository', () => ({
  GiftRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    get: vi.fn(() => Promise.resolve(undefined)),
    create: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    getByPersonId: vi.fn(() => Promise.resolve([])),
    getPendingReturns: vi.fn(() => Promise.resolve([])),
    query: vi.fn(() => Promise.resolve([])),
    getStatistics: vi.fn(() => Promise.resolve({
      total: 0,
      pending: 0,
      completed: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    })),
  })),
}))

vi.mock('@/database/repositories/personRepository', () => ({
  PersonRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    get: vi.fn(() => Promise.resolve(undefined)),
    create: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    search: vi.fn(() => Promise.resolve([])),
    getByName: vi.fn(() => Promise.resolve(undefined)),
  })),
}))

vi.mock('@/database/repositories/returnRepository', () => ({
  ReturnRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    getById: vi.fn(() => Promise.resolve(null)),
    create: vi.fn(() => Promise.resolve({ id: '1' })),
    update: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    getByGiftId: vi.fn(() => Promise.resolve(null)),
  })),
}))

vi.mock('@/database/repositories/imageRepository', () => ({
  ImageRepository: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    getById: vi.fn(() => Promise.resolve(null)),
    create: vi.fn(() => Promise.resolve({ id: '1' })),
    update: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    getByEntityId: vi.fn(() => Promise.resolve([])),
  })),
}))

// チャートライブラリのモック
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(() => 'Line Chart'),
  Bar: vi.fn(() => 'Bar Chart'),
  Pie: vi.fn(() => 'Pie Chart'),
  Doughnut: vi.fn(() => 'Doughnut Chart'),
}))

// 日付ライブラリのモック
vi.mock('date-fns', () => ({
  format: vi.fn((date) => date.toISOString().split('T')[0]),
  parseISO: vi.fn((dateString) => new Date(dateString)),
  addDays: vi.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  isAfter: vi.fn((date1, date2) => date1 > date2),
  isBefore: vi.fn((date1, date2) => date1 < date2),
  differenceInDays: vi.fn((date1, date2) => Math.floor((date1 - date2) / (1000 * 60 * 60 * 24))),
}))

// コンソールエラーの抑制（テスト中の警告を減らすため）
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
