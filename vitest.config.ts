import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/e2e/**',
        '**/test-results/**',
        '**/playwright-report/**',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/tailwind.config.js',
        '**/postcss.config.js',
        '**/playwright.config.ts',
        '**/tsconfig*.json',
        '**/index.html',
        '**/main.tsx',
        '**/index.css',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
