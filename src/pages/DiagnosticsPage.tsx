import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseEnabled, getFirebaseConfigStatus } from '@/lib/firebase';
import { PersonRepository } from '@/database/repositories/personRepository';
import { GiftRepository } from '@/database/repositories/giftRepository';
import { firestorePersonRepository } from '@/repositories/firebase/personRepository';
import { firestoreGiftRepository } from '@/repositories/firebase/giftRepository';
import { Relationship, GiftCategory, ReturnStatus } from '@/types';

export const DiagnosticsPage: React.FC = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      user: {
        authenticated: !!user,
        uid: user?.uid || 'なし',
        email: user?.email || 'なし',
      },
      firebase: {
        enabled: isFirebaseEnabled(),
        config: getFirebaseConfigStatus(),
      },
      indexedDB: {
        persons: 0,
        gifts: 0,
      },
      firestore: {
        persons: 0,
        gifts: 0,
        accessible: false,
        error: null,
      },
    };

    try {
      // IndexedDBデータ数を取得
      if (user?.uid) {
        const personRepo = new PersonRepository();
        const giftRepo = new GiftRepository();
        
        const persons = await personRepo.getAll(user.uid);
        const gifts = await giftRepo.getAll(user.uid);
        
        results.indexedDB.persons = persons.length;
        results.indexedDB.gifts = gifts.length;
      }

      // Firestoreデータ数を取得
      if (isFirebaseEnabled() && user?.uid) {
        try {
          const persons = await firestorePersonRepository.getAll(user.uid);
          const gifts = await firestoreGiftRepository.getAll(user.uid);
          
          results.firestore.persons = persons.length;
          results.firestore.gifts = gifts.length;
          results.firestore.accessible = true;
        } catch (error) {
          results.firestore.error = error instanceof Error ? error.message : String(error);
        }
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const testPersonCreate = async () => {
    if (!user?.uid) {
      alert('ユーザーがログインしていません');
      return;
    }

    const personRepo = new PersonRepository();
    const testPerson = {
      id: crypto.randomUUID(),
      userId: user.uid,
      name: 'テストユーザー' + Date.now(),
      relationship: Relationship.FRIEND,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[Diagnostics] Creating test person:', testPerson);
    
    try {
      await personRepo.create(testPerson);
      alert('テスト人物を作成しました。コンソールログを確認してください。');
      runDiagnostics();
    } catch (error) {
      console.error('[Diagnostics] Failed to create test person:', error);
      alert('テスト人物の作成に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const testGiftCreate = async () => {
    if (!user?.uid) {
      alert('ユーザーがログインしていません');
      return;
    }

    const giftRepo = new GiftRepository();
    const testGift = {
      id: crypto.randomUUID(),
      userId: user.uid,
      personId: 'test-person-id',
      giftName: 'テスト贈答品' + Date.now(),
      receivedDate: new Date(),
      category: GiftCategory.OTHER,
      returnStatus: ReturnStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[Diagnostics] Creating test gift:', testGift);
    
    try {
      await giftRepo.create(testGift);
      alert('テスト贈答品を作成しました。コンソールログを確認してください。');
      runDiagnostics();
    } catch (error) {
      console.error('[Diagnostics] Failed to create test gift:', error);
      alert('テスト贈答品の作成に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (loading && !diagnostics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">システム診断</h1>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">システム診断</h1>
          <p className="text-gray-600 mt-1">
            Firebase同期の状態を確認します
          </p>
        </div>

        {diagnostics && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ユーザー情報
              </h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">認証状態:</dt>
                  <dd className={diagnostics.user.authenticated ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.user.authenticated ? '✓ ログイン済み' : '✗ 未ログイン'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">UID:</dt>
                  <dd className="text-gray-900 font-mono text-sm">{diagnostics.user.uid}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">メール:</dt>
                  <dd className="text-gray-900">{diagnostics.user.email}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Firebase設定
              </h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Firebase有効:</dt>
                  <dd className={diagnostics.firebase.enabled ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.firebase.enabled ? '✓ 有効' : '✗ 無効'}
                  </dd>
                </div>
                <div className="mt-4">
                  <dt className="text-gray-600 mb-2">環境変数:</dt>
                  <dd className="space-y-1">
                    {Object.entries(diagnostics.firebase.config.status).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className={String(value).includes('✓') ? 'text-green-600' : 'text-red-600'}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                データベース状態
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">IndexedDB (ローカル)</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">人物:</dt>
                      <dd className="text-gray-900">{diagnostics.indexedDB.persons}件</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">贈答品:</dt>
                      <dd className="text-gray-900">{diagnostics.indexedDB.gifts}件</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Firestore (クラウド)</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">アクセス:</dt>
                      <dd className={diagnostics.firestore.accessible ? 'text-green-600' : 'text-red-600'}>
                        {diagnostics.firestore.accessible ? '✓ 成功' : '✗ 失敗'}
                      </dd>
                    </div>
                    {diagnostics.firestore.error && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">エラー:</dt>
                        <dd className="text-red-600 text-sm">{diagnostics.firestore.error}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">人物:</dt>
                      <dd className="text-gray-900">{diagnostics.firestore.persons}件</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">贈答品:</dt>
                      <dd className="text-gray-900">{diagnostics.firestore.gifts}件</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                テスト機能
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                テストデータを作成してFirestore同期を確認します。コンソールログに詳細が出力されます。
              </p>
              <div className="flex space-x-4">
                <Button onClick={testPersonCreate}>
                  テスト人物を作成
                </Button>
                <Button onClick={testGiftCreate}>
                  テスト贈答品を作成
                </Button>
                <Button variant="outline" onClick={runDiagnostics}>
                  再診断
                </Button>
              </div>
            </Card>

            <div className="text-xs text-gray-500 text-right">
              最終更新: {new Date(diagnostics.timestamp).toLocaleString('ja-JP')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
