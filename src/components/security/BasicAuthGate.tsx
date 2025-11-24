import { FormEvent, PropsWithChildren, useState } from 'react';
import { APP_ENV } from '@/lib/firebase';

const parseBoolean = (value?: string): boolean =>
  typeof value === 'string' && ['true', '1', 'yes'].includes(value.toLowerCase());

const parseList = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const BASIC_AUTH_ENABLED = parseBoolean(import.meta.env.VITE_BASIC_AUTH_ENABLED);
const BASIC_AUTH_FORCE = parseBoolean(import.meta.env.VITE_BASIC_AUTH_FORCE);
const BASIC_AUTH_REALM =
  import.meta.env.VITE_BASIC_AUTH_REALM?.trim() || 'Iwailist Restricted';
const BASIC_AUTH_USERNAME = import.meta.env.VITE_BASIC_AUTH_USERNAME?.trim() ?? '';
const BASIC_AUTH_PASSWORD = import.meta.env.VITE_BASIC_AUTH_PASSWORD?.trim() ?? '';
const BASIC_AUTH_ALLOWED_ENVS = parseList(import.meta.env.VITE_BASIC_AUTH_ALLOWED_ENVS);

const DEFAULT_ALLOWED_ENVS = ['development', 'staging'];
const ALLOWED_ENVIRONMENTS =
  BASIC_AUTH_ALLOWED_ENVS.length > 0 ? BASIC_AUTH_ALLOWED_ENVS : DEFAULT_ALLOWED_ENVS;

const STORAGE_KEY = `basic-auth:${APP_ENV}`;

const isProductionBuild = import.meta.env.PROD;
const shouldApplyAuth =
  BASIC_AUTH_ENABLED &&
  ALLOWED_ENVIRONMENTS.includes(APP_ENV) &&
  (isProductionBuild || BASIC_AUTH_FORCE);

const hasCredentials = BASIC_AUTH_USERNAME.length > 0 && BASIC_AUTH_PASSWORD.length > 0;

const encodeCredentials = (value: string): string | null => {
  try {
    return btoa(value);
  } catch (error) {
    console.error('[BasicAuthGate] Failed to encode credentials.', error);
    return null;
  }
};

const readStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[BasicAuthGate] Unable to read sessionStorage.', error);
    return null;
  }
};

const persistToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch (error) {
    console.warn('[BasicAuthGate] Unable to write sessionStorage.', error);
  }
};

const resetStoredToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[BasicAuthGate] Unable to clear sessionStorage.', error);
  }
};

const expectedToken =
  shouldApplyAuth && hasCredentials
    ? encodeCredentials(`${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`)
    : null;

export const BasicAuthGate = ({ children }: PropsWithChildren) => {
  const [formState, setFormState] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (!shouldApplyAuth) {
      return true;
    }
    if (!expectedToken) {
      return false;
    }
    return readStoredToken() === expectedToken;
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shouldApplyAuth) {
      setIsAuthenticated(true);
      return;
    }

    if (!expectedToken) {
      setErrorMessage('ベーシック認証の設定が不足しています。環境変数を確認してください。');
      resetStoredToken();
      return;
    }

    const candidateToken = encodeCredentials(
      `${formState.username}:${formState.password}`
    );

    if (!candidateToken) {
      setErrorMessage('認証情報をエンコードできませんでした。');
      return;
    }

    if (candidateToken === expectedToken) {
      persistToken(expectedToken);
      setIsAuthenticated(true);
      setErrorMessage(null);
      return;
    }

    setErrorMessage('ユーザー名またはパスワードが正しくありません。');
    setFormState((prev) => ({ ...prev, password: '' }));
  };

  if (!shouldApplyAuth || isAuthenticated) {
    return <>{children}</>;
  }

  if (!expectedToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-4">
          <div>
            <p className="text-sm font-semibold text-indigo-400">Basic Auth</p>
            <h1 className="text-2xl font-bold mt-2 text-white">設定エラー</h1>
            <p className="text-sm text-slate-300 mt-2">
              ベーシック認証が有効化されていますが、ユーザー名またはパスワードが設定されていません。
            </p>
          </div>
          <ol className="text-sm text-slate-200 list-decimal list-inside space-y-1">
            <li>.env.{APP_ENV} に <code className="font-mono">VITE_BASIC_AUTH_USERNAME</code> と <code className="font-mono">VITE_BASIC_AUTH_PASSWORD</code> を設定してください。</li>
            <li>ビルドを再実行してデプロイし直してください。</li>
          </ol>
          <p className="text-xs text-slate-400 mt-6">
            この画面は {APP_ENV} 環境を保護するためのセーフガードです。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600">{BASIC_AUTH_REALM}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">環境アクセス制限</h1>
          <p className="text-sm text-gray-500 mt-2">
            {APP_ENV.toUpperCase()} 環境にアクセスするには、認証情報を入力してください。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="basic-auth-username"
              className="text-sm font-medium text-gray-700"
            >
              ユーザー名
            </label>
            <input
              id="basic-auth-username"
              name="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formState.username}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, username: event.target.value }));
                setErrorMessage(null);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="basic-auth-password"
              className="text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              id="basic-auth-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formState.password}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, password: event.target.value }));
                setErrorMessage(null);
              }}
              required
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white transition"
          >
            認証する
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            認証情報はタブを閉じるとリセットされます。共有しないでください。
          </p>
        </div>
      </div>
    </div>
  );
};
