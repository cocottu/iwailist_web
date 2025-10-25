# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Googleログインの読み込み問題を修正** (2025-10-25)
  - `signInWithGoogle()`メソッドで不要なエラーthrowを削除
  - リダイレクト後のloading状態管理を改善
  - 認証完了後のナビゲーションをuseEffectで実装
  - リダイレクト処理中の状態更新をスキップするロジックを追加
  - デバッグログを追加して問題の特定を容易化
  - 関連ドキュメント: [GOOGLE_LOGIN_LOADING_FIX.md](./GOOGLE_LOGIN_LOADING_FIX.md)

## [Phase 4] - 2025-10-23

### Added
- Multi-environment support (Development, Staging, Production)
- GitHub Actions workflows for automated deployment
- PWA (Progressive Web App) implementation
- Offline support with IndexedDB
- Firebase Authentication integration
- Google OAuth login

### Fixed
- Google login popup blocked issue
- Google login redirect method implementation
- Firebase environment variables configuration

### Documentation
- [FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)
- [MULTI_ENVIRONMENT_SETUP.md](./docs/MULTI_ENVIRONMENT_SETUP.md)
- [GITHUB_SECRETS_SETUP.md](./docs/GITHUB_SECRETS_SETUP.md)
- [GOOGLE_LOGIN_DEBUG_REPORT.md](./GOOGLE_LOGIN_DEBUG_REPORT.md)
- [GOOGLE_LOGIN_FIX.md](./GOOGLE_LOGIN_FIX.md)
- [GOOGLE_LOGIN_TAB_FIX.md](./GOOGLE_LOGIN_TAB_FIX.md)
- [PRODUCTION_GOOGLE_LOGIN_DEBUG.md](./PRODUCTION_GOOGLE_LOGIN_DEBUG.md)

## [Phase 3] - 2025-10-22

### Added
- Gift management functionality
- Person management system
- Statistics and dashboard
- Camera integration for receipt scanning
- E2E tests with Playwright

## [Phase 2] - 2025-10-21

### Added
- Basic UI components
- IndexedDB integration
- Offline-first architecture

## [Phase 1] - 2025-10-20

### Added
- Initial project setup
- Basic architecture
- Development environment configuration
