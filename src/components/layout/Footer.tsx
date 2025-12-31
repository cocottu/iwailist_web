/**
 * フッターコンポーネント
 * 運営者情報、プライバシーポリシー等へのリンクを表示
 */

import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* ロゴと著作権 */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">祝</span>
            </div>
            <span>© {currentYear} 祝いリスト</span>
          </div>

          {/* リンク */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              to="/legal/operator"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              運営者情報
            </Link>
            <Link
              to="/legal/privacy"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              お問い合わせ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
