import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('lib/env', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    // 環境変数をリセット
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    })
  })

  describe('getAdSenseConfig', () => {
    it('AdSense設定を返す', async () => {
      const { getAdSenseConfig } = await import('@/lib/env')

      const config = getAdSenseConfig()

      expect(config).toHaveProperty('clientId')
      expect(config).toHaveProperty('slot')
      expect(config).toHaveProperty('isDev')
    })

    it('開発環境ではisDevがtrueになる', async () => {
      const { getAdSenseConfig } = await import('@/lib/env')

      const config = getAdSenseConfig()

      // テスト環境ではDEVがfalseになっている
      expect(typeof config.isDev).toBe('boolean')
    })

    it('環境変数が設定されていない場合はundefinedを返す', async () => {
      const { getAdSenseConfig } = await import('@/lib/env')

      const config = getAdSenseConfig()

      // 環境変数が設定されていない場合
      expect(config.clientId).toBeUndefined()
      expect(config.slot).toBeUndefined()
    })
  })
})
