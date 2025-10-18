# SonarQube Cloud連携設定ガイド

## 概要
このプロジェクトはSonarQube Cloudと連携してコード品質分析を行うように設定されています。

## 必要な設定

### 1. SonarQube Cloudアカウントの準備
1. [SonarQube Cloud](https://sonarcloud.io/)にアクセス
2. GitHubアカウントでログイン
3. 新しいプロジェクトを作成
4. プロジェクトキーを `iwailist_web` に設定

### 2. GitHubリポジトリのシークレット設定
GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを追加：

#### 必須のシークレット
- `SONAR_TOKEN`: SonarQube Cloudで生成したトークン
- `SONAR_HOST_URL`: `https://sonarcloud.io`
- `SONAR_ORGANIZATION`: あなたのSonarQube組織名

#### シークレットの取得方法
1. SonarQube Cloudにログイン
2. 右上のアカウントメニュー > My Account > Security
3. "Generate Tokens" で新しいトークンを生成
4. トークンをコピーしてGitHubシークレットに追加

### 3. プロジェクト設定の調整
`sonar-project.properties` ファイルで以下を調整：
- `sonar.projectKey`: SonarQube Cloudで設定したプロジェクトキー
- `sonar.sources`: ソースコードの場所（デフォルト: `src`）
- `sonar.tests`: テストコードの場所（デフォルト: `test`）

### 4. 言語別の追加設定

#### JavaScript/TypeScriptプロジェクトの場合
```properties
# テストカバレッジレポートの設定
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# ESLintレポートの設定
sonar.eslint.reportPaths=eslint-report.json
```

#### Pythonプロジェクトの場合
```properties
# テストカバレッジレポートの設定
sonar.python.coverage.reportPaths=coverage.xml

# テスト結果の設定
sonar.python.xunit.reportPath=test-results.xml
```

## 使用方法

### 自動実行
- `main` または `develop` ブランチへのプッシュ時に自動実行
- プルリクエスト作成時に自動実行

### 手動実行
GitHub Actionsの "SonarQube Cloud Analysis" ワークフローを手動で実行可能

## トラブルシューティング

### よくある問題
1. **認証エラー**: SONAR_TOKENが正しく設定されているか確認
2. **プロジェクトが見つからない**: SONAR_ORGANIZATIONとプロジェクトキーが正しいか確認
3. **ソースコードが見つからない**: sonar.sourcesのパスが正しいか確認

### ログの確認
GitHub Actionsの実行ログで詳細なエラー情報を確認できます。

## 参考リンク
- [SonarQube Cloud公式ドキュメント](https://docs.sonarcloud.io/)
- [SonarQube Scanner for GitHub Actions](https://github.com/SonarSource/sonarqube-scan-action)