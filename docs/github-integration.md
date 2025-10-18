# GitHub Issue統合

## 概要

このプロジェクトにGitHub APIを使用してissue一覧を取得する機能が追加されました。

## セットアップ

### 1. 環境変数の設定（オプション）

パブリックリポジトリのissueを取得する場合、トークンは不要です。
プライベートリポジトリやレート制限を回避したい場合は、以下の手順でトークンを設定してください。

1. `.env.local` ファイルをプロジェクトルートに作成
2. 以下の内容を記載（トークンは https://github.com/settings/tokens から取得）:

```bash
VITE_GITHUB_TOKEN=ghp_your_token_here
```

**重要**: `.env.local` は `.gitignore` に含まれており、Gitにコミットされません。

## 使用方法

### 基本的な使い方

```typescript
import { githubService } from './services/github';

// issue一覧を取得
const issues = await githubService.getIssues({
  owner: 'facebook',
  repo: 'react',
  state: 'open',
  per_page: 10
});

console.log(issues);
```

### パラメータオプション

```typescript
interface GitHubIssueListParams {
  owner: string;          // リポジトリのオーナー名（必須）
  repo: string;           // リポジトリ名（必須）
  state?: 'open' | 'closed' | 'all';  // issueの状態
  labels?: string;        // ラベルでフィルタ（カンマ区切り）
  sort?: 'created' | 'updated' | 'comments';  // ソート基準
  direction?: 'asc' | 'desc';  // ソート順
  per_page?: number;      // 1ページあたりの件数
  page?: number;          // ページ番号
}
```

### 使用例

#### 1. オープンなissueを10件取得

```typescript
const openIssues = await githubService.getIssues({
  owner: 'microsoft',
  repo: 'vscode',
  state: 'open',
  per_page: 10
});
```

#### 2. 特定のラベルでフィルタ

```typescript
const bugIssues = await githubService.getIssues({
  owner: 'facebook',
  repo: 'react',
  state: 'open',
  labels: 'bug,high-priority'
});
```

#### 3. 更新日順にソート

```typescript
const recentIssues = await githubService.getIssues({
  owner: 'vuejs',
  repo: 'vue',
  sort: 'updated',
  direction: 'desc',
  per_page: 20
});
```

#### 4. 特定のissueを取得

```typescript
const issue = await githubService.getIssue('facebook', 'react', 12345);
console.log(issue.title);
```

### Reactコンポーネントでの使用例

```typescript
import { useEffect, useState } from 'react';
import { githubService } from '../services/github';
import { GitHubIssue } from '../types';

function IssueList() {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await githubService.getIssues({
          owner: 'facebook',
          repo: 'react',
          state: 'open',
          per_page: 10
        });
        setIssues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h1>Issues</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
              #{issue.number}: {issue.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## エラーハンドリング

```typescript
import { GitHubAPIError } from '../services/github';

try {
  const issues = await githubService.getIssues({
    owner: 'facebook',
    repo: 'react'
  });
} catch (error) {
  if (error instanceof GitHubAPIError) {
    console.error('GitHub APIエラー:', error.message);
    console.error('ステータスコード:', error.status);
    console.error('レスポンス:', error.response);
  } else {
    console.error('予期しないエラー:', error);
  }
}
```

## レート制限について

GitHub APIには以下のレート制限があります：

- **認証なし**: 60リクエスト/時間
- **認証あり**: 5000リクエスト/時間

トークンを設定することで、より多くのリクエストが可能になります。

## セキュリティ

- GitHubトークンは絶対にコードにハードコーディングしないでください
- 環境変数（`import.meta.env.VITE_GITHUB_TOKEN`）を使用してください
- `.env.local` ファイルは `.gitignore` に含まれています
- 本番環境では環境変数を使用してトークンを注入してください

## トラブルシューティング

### 401 Unauthorized エラー

- トークンが正しく設定されているか確認
- トークンの有効期限が切れていないか確認
- トークンに適切な権限（`repo` スコープ）があるか確認

### 403 Forbidden エラー

- レート制限に達している可能性があります
- トークンを設定することで制限を緩和できます

### 404 Not Found エラー

- リポジトリのオーナー名とリポジトリ名が正しいか確認
- プライベートリポジトリの場合、トークンが設定されているか確認
