import { GitHubIssue, GitHubIssueListParams } from '../types';

/**
 * GitHub APIのベースURL
 */
const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * GitHub APIエラーのカスタムクラス
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

/**
 * GitHub APIクライアント
 */
export class GitHubService {
  private token: string | undefined;

  constructor() {
    // 環境変数からトークンを取得（オプショナル）
    this.token = import.meta.env.VITE_GITHUB_TOKEN;
  }

  /**
   * 認証ヘッダーを取得
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // トークンが設定されている場合のみ認証ヘッダーを追加
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * GitHub APIへのリクエストを実行
   */
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubAPIError(
          errorData.message || `GitHub API Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error;
      }
      throw new GitHubAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * リポジトリのissue一覧を取得
   * 
   * @param params - issue一覧取得のパラメータ
   * @returns issue一覧
   * 
   * @example
   * ```typescript
   * const service = new GitHubService();
   * const issues = await service.getIssues({
   *   owner: 'facebook',
   *   repo: 'react',
   *   state: 'open',
   *   per_page: 10
   * });
   * ```
   */
  async getIssues(params: GitHubIssueListParams): Promise<GitHubIssue[]> {
    const { owner, repo, ...queryParams } = params;

    // クエリパラメータを構築
    const searchParams = new URLSearchParams();
    
    if (queryParams.state) {
      searchParams.append('state', queryParams.state);
    }
    if (queryParams.labels) {
      searchParams.append('labels', queryParams.labels);
    }
    if (queryParams.sort) {
      searchParams.append('sort', queryParams.sort);
    }
    if (queryParams.direction) {
      searchParams.append('direction', queryParams.direction);
    }
    if (queryParams.per_page) {
      searchParams.append('per_page', queryParams.per_page.toString());
    }
    if (queryParams.page) {
      searchParams.append('page', queryParams.page.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`;

    return this.request<GitHubIssue[]>(endpoint);
  }

  /**
   * 特定のissueを取得
   * 
   * @param owner - リポジトリのオーナー
   * @param repo - リポジトリ名
   * @param issueNumber - issue番号
   * @returns issue詳細
   */
  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const endpoint = `/repos/${owner}/${repo}/issues/${issueNumber}`;
    return this.request<GitHubIssue>(endpoint);
  }
}

/**
 * デフォルトのGitHubサービスインスタンス
 */
export const githubService = new GitHubService();
