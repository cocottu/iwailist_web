import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Loading, EmptyState } from '@/components/ui';
import { GiftRepository, PersonRepository, ReturnRepository } from '@/database';
import { Gift, Person, GiftCategory, Return } from '@/types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { useAuth } from '@/contexts/AuthContext';
import { syncManager } from '@/services/syncManager';
import { isFirebaseEnabled } from '@/lib/firebase';

export const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userId = user?.uid || 'demo-user';
        
        // Firebaseが有効な場合、最初に同期を実行
        if (isFirebaseEnabled() && user?.uid && navigator.onLine) {
          console.log('[Statistics] Syncing data before load...');
          try {
            await syncManager.triggerSync(user.uid);
            console.log('[Statistics] Sync completed');
          } catch (error) {
            console.error('[Statistics] Sync failed:', error);
            // 同期に失敗してもローカルデータは表示する
          }
        }
        
        const giftRepo = new GiftRepository();
        const personRepo = new PersonRepository();
        const returnRepo = new ReturnRepository();
        
        const giftsData = await giftRepo.getAll(userId);
        const personsData = await personRepo.getAll(userId);
        
        // 各贈答品のお返しを取得
        const allReturns: Return[] = [];
        for (const gift of giftsData) {
          const giftReturns = await returnRepo.getByGiftId(gift.id);
          allReturns.push(...giftReturns);
        }
        
        setGifts(giftsData);
        setPersons(personsData);
        setReturns(allReturns);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.uid]);

  const yearGifts = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
    
    return gifts.filter(gift => 
      gift.receivedDate >= yearStart && gift.receivedDate <= yearEnd
    );
  }, [gifts, selectedYear]);

  const getMonthlyData = useCallback((yearGifts: Gift[]) => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 11, 31))
    });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthGifts = yearGifts.filter(gift => 
        gift.receivedDate >= monthStart && gift.receivedDate <= monthEnd
      );
      
      const totalAmount = monthGifts.reduce((sum, gift) => sum + (gift.amount || 0), 0);
      
      return {
        month: format(month, 'M月', { locale: ja }),
        count: monthGifts.length,
        amount: totalAmount
      };
    });
  }, [selectedYear]);

  const getCategoryData = useCallback((yearGifts: Gift[]) => {
    const categoryMap = new Map<GiftCategory, number>();
    
    yearGifts.forEach(gift => {
      const current = categoryMap.get(gift.category) || 0;
      categoryMap.set(gift.category, current + 1);
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: yearGifts.length > 0 ? (count / yearGifts.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const getPersonData = useCallback((yearGifts: Gift[]) => {
    const personMap = new Map<string, { person: Person; count: number; amount: number }>();
    
    yearGifts.forEach(gift => {
      const person = persons.find(p => p.id === gift.personId);
      if (person) {
        const current = personMap.get(person.id) || { person, count: 0, amount: 0 };
        current.count += 1;
        current.amount += gift.amount || 0;
        personMap.set(person.id, current);
      }
    });
    
    return Array.from(personMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [persons]);

  const getReturnStatusData = useCallback((yearGifts: Gift[]) => {
    const statusMap = {
      pending: 0,
      completed: 0,
      not_required: 0
    };
    
    yearGifts.forEach(gift => {
      statusMap[gift.returnStatus]++;
    });
    
    const total = yearGifts.length;
    return {
      pending: { count: statusMap.pending, percentage: total > 0 ? (statusMap.pending / total) * 100 : 0 },
      completed: { count: statusMap.completed, percentage: total > 0 ? (statusMap.completed / total) * 100 : 0 },
      not_required: { count: statusMap.not_required, percentage: total > 0 ? (statusMap.not_required / total) * 100 : 0 }
    };
  }, []);

  const getTotalStats = useCallback((yearGifts: Gift[]) => {
    const totalAmount = yearGifts.reduce((sum, gift) => sum + (gift.amount || 0), 0);
    const avgAmount = yearGifts.length > 0 ? totalAmount / yearGifts.length : 0;
    
    return {
      totalGifts: yearGifts.length,
      totalAmount,
      avgAmount
    };
  }, []);

  const getReturnStats = useCallback((yearGifts: Gift[], allReturns: Return[]) => {
    // 年のお返しをフィルター
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
    
    const yearReturns = allReturns.filter(returnData => 
      returnData.returnDate >= yearStart && returnData.returnDate <= yearEnd
    );
    
    // お返しの総額
    const totalReturnAmount = yearReturns.reduce((sum, returnData) => sum + (returnData.amount || 0), 0);
    
    // 平均お返し金額
    const avgReturnAmount = yearReturns.length > 0 ? totalReturnAmount / yearReturns.length : 0;
    
    // お返し済みの贈答品を特定
    const returnedGiftIds = new Set(yearReturns.map(r => r.giftId));
    const giftsWithReturns = yearGifts.filter(g => returnedGiftIds.has(g.id));
    
    // 平均お返し期間（日数）
    let totalDays = 0;
    let countWithDays = 0;
    
    for (const returnData of yearReturns) {
      const gift = yearGifts.find(g => g.id === returnData.giftId);
      if (gift) {
        const days = differenceInDays(returnData.returnDate, gift.receivedDate);
        if (days >= 0) {
          totalDays += days;
          countWithDays++;
        }
      }
    }
    
    const avgReturnDays = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0;
    
    // お返し率（お返ししたギフトの割合）
    const returnRate = yearGifts.length > 0 ? (giftsWithReturns.length / yearGifts.length) * 100 : 0;
    
    return {
      totalReturns: yearReturns.length,
      totalReturnAmount,
      avgReturnAmount,
      avgReturnDays,
      returnRate,
      giftsWithReturns: giftsWithReturns.length
    };
  }, [selectedYear]);

  const monthlyData = useMemo(() => getMonthlyData(yearGifts), [yearGifts, getMonthlyData]);
  const categoryData = useMemo(() => getCategoryData(yearGifts), [yearGifts, getCategoryData]);
  const personData = useMemo(() => getPersonData(yearGifts), [yearGifts, getPersonData]);
  const returnStatusData = useMemo(() => getReturnStatusData(yearGifts), [yearGifts, getReturnStatusData]);
  const totalStats = useMemo(() => getTotalStats(yearGifts), [yearGifts, getTotalStats]);
  const returnStats = useMemo(() => getReturnStats(yearGifts, returns), [yearGifts, returns, getReturnStats]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="lg" text="データを読み込み中..." />
      </div>
    );
  }

  const availableYears = Array.from(
    new Set(gifts.map(g => g.receivedDate.getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">統計・分析</h1>
        <p className="text-gray-600">贈答品の受取状況を分析できます</p>
      </div>

      {/* 年選択 */}
      <Card className="p-6 mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">対象年:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
      </Card>

      {yearGifts.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            message={`${selectedYear}年のデータがありません`}
            icon={<span className="text-4xl">📊</span>}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">総贈答品数</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.totalGifts}件</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">総金額</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalStats.totalAmount.toLocaleString()}円
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">平均金額</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(totalStats.avgAmount).toLocaleString()}円
                </p>
              </div>
            </Card>
          </div>

          {/* お返し統計 */}
          {returnStats.totalReturns > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">お返し統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">お返し総数</p>
                  <p className="text-2xl font-bold text-blue-600">{returnStats.totalReturns}件</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">お返し総額</p>
                  <p className="text-2xl font-bold text-green-600">
                    ¥{returnStats.totalReturnAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">平均お返し金額</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ¥{Math.round(returnStats.avgReturnAmount).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">平均お返し期間</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {returnStats.avgReturnDays}日
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">お返し実施率</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {returnStats.returnRate.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${returnStats.returnRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {returnStats.giftsWithReturns}件 / {totalStats.totalGifts}件の贈答品にお返しを実施
                </p>
              </div>
            </Card>
          )}

          {/* 月別受取金額 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">月別受取金額</h2>
            <div className="space-y-3">
              {(() => {
                const maxAmount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.amount)) : 0;
                return monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      {data.amount.toLocaleString()}円
                    </span>
                  </div>
                ));
              })()}
            </div>
          </Card>

          {/* カテゴリ別内訳 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別内訳</h2>
            <div className="space-y-3">
              {categoryData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex-1">{data.category}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{data.count}件</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {data.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* お返し状況 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">お返し状況</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">未対応</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${returnStatusData.pending.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {returnStatusData.pending.count}件 ({returnStatusData.pending.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">対応済</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${returnStatusData.completed.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {returnStatusData.completed.count}件 ({returnStatusData.completed.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">不要</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${returnStatusData.not_required.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {returnStatusData.not_required.count}件 ({returnStatusData.not_required.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 人物別ランキング */}
          {personData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">人物別ランキング</h2>
              <div className="space-y-3">
                {personData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{data.person.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{data.count}件</span>
                      <span className="text-sm font-medium text-gray-900">
                        {data.amount.toLocaleString()}円
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
