import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubService, GitHubAPIError } from '../../services/github';
import { GitHubIssue } from '../../types';

// グローバルfetchのモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GitHubService', () => {
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getIssues', () => {
    it('issue一覧を正常に取得できる', async () => {
      const mockIssues: GitHubIssue[] = [
        {
          id: 1,
          number: 1,
          title: 'Test Issue 1',
          state: 'open',
          body: 'Test body',
          user: {
            login: 'testuser',
            avatar_url: 'https://example.com/avatar.png'
          },
          labels: [{ name: 'bug', color: 'red' }],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
          html_url: 'https://github.com/test/repo/issues/1',
          comments: 5
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssues,
      });

      const result = await service.getIssues({
        owner: 'facebook',
        repo: 'react',
        state: 'open'
      });

      expect(result).toEqual(mockIssues);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/facebook/react/issues?state=open',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          })
        })
      );
    });

    it('複数のクエリパラメータを正しく処理できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await service.getIssues({
        owner: 'microsoft',
        repo: 'vscode',
        state: 'closed',
        labels: 'bug,enhancement',
        sort: 'updated',
        direction: 'desc',
        per_page: 20,
        page: 2
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/microsoft/vscode/issues?state=closed&labels=bug%2Cenhancement&sort=updated&direction=desc&per_page=20&page=2',
        expect.any(Object)
      );
    });

    it('APIエラー時にGitHubAPIErrorをスローする', async () => {
      const errorResponse = {
        message: 'Not Found',
        documentation_url: 'https://docs.github.com/rest'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      await expect(
        service.getIssues({
          owner: 'invalid',
          repo: 'repo'
        })
      ).rejects.toThrow(GitHubAPIError);
    });

    it('ネットワークエラー時にGitHubAPIErrorをスローする', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.getIssues({
          owner: 'facebook',
          repo: 'react'
        })
      ).rejects.toThrow(GitHubAPIError);
    });
  });

  describe('getIssue', () => {
    it('特定のissueを正常に取得できる', async () => {
      const mockIssue: GitHubIssue = {
        id: 1,
        number: 123,
        title: 'Test Issue',
        state: 'open',
        body: 'Test body',
        user: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.png'
        },
        labels: [],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        html_url: 'https://github.com/test/repo/issues/123',
        comments: 0
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssue,
      });

      const result = await service.getIssue('facebook', 'react', 123);

      expect(result).toEqual(mockIssue);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/facebook/react/issues/123',
        expect.any(Object)
      );
    });

    it('存在しないissueの場合にエラーをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      });

      await expect(
        service.getIssue('facebook', 'react', 99999)
      ).rejects.toThrow(GitHubAPIError);
    });
  });

  describe('GitHubAPIError', () => {
    it('エラーメッセージとステータスを保持する', () => {
      const error = new GitHubAPIError('Test error', 404, { foo: 'bar' });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.response).toEqual({ foo: 'bar' });
      expect(error.name).toBe('GitHubAPIError');
    });
  });
});
