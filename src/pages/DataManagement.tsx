/**
 * データ管理ページ
 * データのエクスポート・インポート機能を提供
 */

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  downloadExportData, 
  getExportDataSize 
} from '@/services/exportService';
import { 
  importFromFile, 
  ImportResult,
  ImportOptions,
  validateExportData 
} from '@/services/importService';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export default function DataManagement() {
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportSize, setExportSize] = useState<number | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipExisting: true,
    overwriteExisting: false,
    userId: currentUser?.uid || null,
  });
  const [showImportOptions, setShowImportOptions] = useState(false);

  // エクスポートサイズを取得
  const handleCalculateSize = async () => {
    try {
      const size = await getExportDataSize(currentUser?.uid || null);
      setExportSize(size);
    } catch (error) {
      console.error('Failed to calculate export size:', error);
      alert('エクスポートサイズの計算に失敗しました');
    }
  };

  // データをエクスポート
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadExportData(currentUser?.uid || null);
      alert('データのエクスポートが完了しました');
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  // インポートファイルを選択
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // データをインポート
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル検証
    if (!file.name.endsWith('.json')) {
      alert('JSONファイルを選択してください');
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);

      // ファイルを読み込んで検証
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!validateExportData(data)) {
        alert('無効なエクスポートファイルです');
        return;
      }

      // インポート実行
      const result = await importFromFile(file, {
        ...importOptions,
        userId: currentUser?.uid || null,
      });

      setImportResult(result);

      if (result.success && result.errors.length === 0) {
        alert('データのインポートが完了しました');
      } else if (result.errors.length > 0) {
        alert(`インポートが完了しましたが、${result.errors.length}件のエラーがありました`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('インポートに失敗しました');
      setImportResult({
        success: false,
        imported: {
          gifts: 0,
          persons: 0,
          returns: 0,
          images: 0,
          reminders: 0,
        },
        skipped: {
          gifts: 0,
          persons: 0,
          returns: 0,
          images: 0,
          reminders: 0,
        },
        errors: [`インポートエラー: ${error}`],
      });
    } finally {
      setIsImporting(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            データ管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            データのバックアップと復元を行えます
          </p>
        </div>

        {/* 情報カード */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">データのエクスポート・インポートについて</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>エクスポートしたデータはJSON形式で保存されます</li>
                <li>画像データも含まれます（Base64形式）</li>
                <li>定期的にバックアップを取ることをおすすめします</li>
                <li>インポート時は重複データの処理方法を選択できます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* エクスポートセクション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ArrowDownTrayIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              データエクスポート
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            すべてのデータをJSONファイルとしてダウンロードします
          </p>

          {exportSize !== null && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                予想ファイルサイズ: <span className="font-semibold">{exportSize.toFixed(2)} MB</span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCalculateSize}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              サイズを計算
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {isExporting ? 'エクスポート中...' : 'エクスポート'}
            </button>
          </div>
        </div>

        {/* インポートセクション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ArrowUpTrayIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              データインポート
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            エクスポートしたJSONファイルからデータを復元します
          </p>

          {/* インポートオプション */}
          <div className="mb-4">
            <button
              onClick={() => setShowImportOptions(!showImportOptions)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
            >
              {showImportOptions ? '▼' : '▶'} インポートオプション
            </button>
            
            {showImportOptions && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={importOptions.skipExisting}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      skipExisting: e.target.checked,
                      overwriteExisting: e.target.checked ? false : importOptions.overwriteExisting,
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    既存データをスキップ（推奨）
                  </span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={importOptions.overwriteExisting}
                    onChange={(e) => setImportOptions({
                      ...importOptions,
                      overwriteExisting: e.target.checked,
                      skipExisting: e.target.checked ? false : importOptions.skipExisting,
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    既存データを上書き（注意）
                  </span>
                </label>

                {importOptions.overwriteExisting && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      既存データが上書きされます。慎重に実行してください。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={handleSelectFile}
            disabled={isImporting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            {isImporting ? 'インポート中...' : 'ファイルを選択してインポート'}
          </button>
        </div>

        {/* インポート結果 */}
        {importResult && (
          <div className={`rounded-lg shadow-md p-6 ${
            importResult.success && importResult.errors.length === 0
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : importResult.errors.length > 0
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {importResult.success && importResult.errors.length === 0 ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : importResult.errors.length > 0 ? (
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                インポート結果
              </h3>
            </div>

            {/* インポート統計 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  インポート成功
                </h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>贈答品: {importResult.imported.gifts}件</li>
                  <li>人物: {importResult.imported.persons}件</li>
                  <li>お返し: {importResult.imported.returns}件</li>
                  <li>画像: {importResult.imported.images}件</li>
                  <li>リマインダー: {importResult.imported.reminders}件</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  スキップ
                </h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>贈答品: {importResult.skipped.gifts}件</li>
                  <li>人物: {importResult.skipped.persons}件</li>
                  <li>お返し: {importResult.skipped.returns}件</li>
                  <li>画像: {importResult.skipped.images}件</li>
                  <li>リマインダー: {importResult.skipped.reminders}件</li>
                </ul>
              </div>
            </div>

            {/* エラー表示 */}
            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  エラー ({importResult.errors.length}件)
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded p-3 max-h-40 overflow-y-auto">
                  <ul className="text-xs space-y-1 text-red-600 dark:text-red-400">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 警告 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">注意事項</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>エクスポートファイルには個人情報が含まれます。取り扱いに注意してください</li>
                <li>インポート時は既存データとの重複に注意してください</li>
                <li>大量のデータをインポートする場合、時間がかかることがあります</li>
                <li>インポート前に現在のデータをバックアップすることをおすすめします</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
