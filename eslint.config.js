import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'test-results/**'],
  },
  js.configs.recommended,
  // Node.js scripts (ES Modules) - security-check.js
  {
    files: ['scripts/security-check.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // Node.js scripts (CommonJS)
  {
    files: ['scripts/**/*.js'],
    ignores: ['scripts/security-check.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // Config files (ES Modules)
  {
    files: ['*.config.{js,ts}', 'playwright.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-undef': 'error',
    },
  },
  // E2E tests (Playwright)
  {
    files: ['e2e/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        test: 'readonly',
        expect: 'readonly',
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly',
        indexedDB: 'readonly',
        console: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
  // TypeScript/React source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        indexedDB: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLVideoElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLScriptElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Node: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        Image: 'readonly',
        MediaStream: 'readonly',
        MediaStreamConstraints: 'readonly',
        DOMException: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        // React
        React: 'readonly',
        JSX: 'readonly',
        // Test globals (for vitest)
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
