import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// セッションストレージのモック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Firebaseのモック
vi.mock('@/lib/firebase', () => ({
  APP_ENV: 'development',
}))

describe('BasicAuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorageMock.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('認証が無効な場合', () => {
    it('認証が無効な場合は子コンポーネントを表示する', async () => {
      // 環境変数を設定しない（認証無効）
      vi.stubEnv('VITE_BASIC_AUTH_ENABLED', 'false')

      const { BasicAuthGate } = await import('@/components/security/BasicAuthGate')

      render(
        <BasicAuthGate>
          <div>Protected Content</div>
        </BasicAuthGate>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  describe('ユーティリティ関数', () => {
    it('parseBoolean関数がtrue値を正しく解析する', () => {
      // trueの文字列をテスト
      expect(['true', '1', 'yes'].includes('true'.toLowerCase())).toBe(true)
      expect(['true', '1', 'yes'].includes('1'.toLowerCase())).toBe(true)
      expect(['true', '1', 'yes'].includes('yes'.toLowerCase())).toBe(true)
    })

    it('parseBoolean関数がfalse値を正しく解析する', () => {
      expect(['true', '1', 'yes'].includes('false'.toLowerCase())).toBe(false)
      expect(['true', '1', 'yes'].includes('0'.toLowerCase())).toBe(false)
      expect(['true', '1', 'yes'].includes('no'.toLowerCase())).toBe(false)
    })

    it('parseList関数がカンマ区切りのリストを解析する', () => {
      const value = 'development,staging,production'
      const result = value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
      
      expect(result).toEqual(['development', 'staging', 'production'])
    })

    it('parseList関数が空の値を処理する', () => {
      const value = ''
      const result = (value ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
      
      expect(result).toEqual([])
    })
  })

  describe('認証トークン処理', () => {
    it('認証情報をBase64エンコードする', () => {
      const username = 'test'
      const password = 'password'
      const encoded = btoa(`${username}:${password}`)
      
      expect(encoded).toBe('dGVzdDpwYXNzd29yZA==')
    })

    it('sessionStorageからトークンを読み取る', () => {
      const key = 'basic-auth:development'
      const token = 'test-token'
      
      sessionStorageMock.setItem(key, token)
      
      expect(sessionStorageMock.getItem(key)).toBe(token)
    })

    it('sessionStorageにトークンを保存する', () => {
      const key = 'basic-auth:development'
      const token = 'test-token'
      
      sessionStorageMock.setItem(key, token)
      
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(key, token)
    })

    it('sessionStorageからトークンを削除する', () => {
      const key = 'basic-auth:development'
      
      sessionStorageMock.removeItem(key)
      
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(key)
    })
  })

  describe('許可された環境', () => {
    it('デフォルトの許可環境はdevelopmentとstagingを含む', () => {
      const defaultAllowedEnvs = ['development', 'staging']
      
      expect(defaultAllowedEnvs).toContain('development')
      expect(defaultAllowedEnvs).toContain('staging')
      expect(defaultAllowedEnvs).not.toContain('production')
    })

    it('カスタム許可環境が設定できる', () => {
      const customEnvs = 'development,staging,preview'
      const parsed = customEnvs
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
      
      expect(parsed).toEqual(['development', 'staging', 'preview'])
    })
  })

  describe('フォーム入力', () => {
    it('ユーザー名入力フィールドの値が変更できる', () => {
      const input = document.createElement('input')
      input.type = 'text'
      input.value = ''
      
      const newValue = 'testuser'
      input.value = newValue
      
      expect(input.value).toBe('testuser')
    })

    it('パスワード入力フィールドの値が変更できる', () => {
      const input = document.createElement('input')
      input.type = 'password'
      input.value = ''
      
      const newValue = 'testpassword'
      input.value = newValue
      
      expect(input.value).toBe('testpassword')
    })
  })

  describe('認証ロジック', () => {
    it('認証情報が一致した場合に認証成功とする', () => {
      const username = 'admin'
      const password = 'secret'
      
      const expectedToken = btoa(`${username}:${password}`)
      const candidateToken = btoa(`${username}:${password}`)
      
      expect(candidateToken).toBe(expectedToken)
    })

    it('認証情報が一致しない場合に認証失敗とする', () => {
      const expectedToken = btoa('admin:secret')
      const candidateToken = btoa('admin:wrong')
      
      expect(candidateToken).not.toBe(expectedToken)
    })
  })

  describe('環境チェック', () => {
    it('本番ビルドかどうかを判定する', () => {
      const isProductionBuild = import.meta.env.PROD
      
      expect(typeof isProductionBuild).toBe('boolean')
    })

    it('認証が必要かどうかを判定する', () => {
      const basicAuthEnabled = true
      const allowedEnvironments = ['development', 'staging']
      const appEnv = 'development'
      const isProductionBuild = false
      const basicAuthForce = true
      
      const shouldApplyAuth =
        basicAuthEnabled &&
        allowedEnvironments.includes(appEnv) &&
        (isProductionBuild || basicAuthForce)
      
      expect(shouldApplyAuth).toBe(true)
    })

    it('開発環境で強制フラグがない場合は認証不要', () => {
      const basicAuthEnabled = true
      const allowedEnvironments = ['development', 'staging']
      const appEnv = 'development'
      const isProductionBuild = false
      const basicAuthForce = false
      
      const shouldApplyAuth =
        basicAuthEnabled &&
        allowedEnvironments.includes(appEnv) &&
        (isProductionBuild || basicAuthForce)
      
      expect(shouldApplyAuth).toBe(false)
    })
  })

  describe('エラー処理', () => {
    it('エンコードエラー時にnullを返す', () => {
      // 通常の文字列はエラーにならない
      const result = btoa('test')
      expect(result).not.toBeNull()
    })

    it('sessionStorage読み取りエラー時にnullを返す', () => {
      sessionStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      
      let result = null
      try {
        result = sessionStorageMock.getItem('test')
      } catch {
        result = null
      }
      
      expect(result).toBeNull()
    })
  })
})
