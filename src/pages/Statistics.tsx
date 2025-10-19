import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Loading, EmptyState } from '@/components/ui';
import { GiftRepository, PersonRepository } from '@/database';
import { Gift, Person, GiftCategory } from '@/types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { logger } from '@/utils/logger';

export const Statistics: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = 'demo-user';
      
      const giftRepo = new GiftRepository();
      const personRepo = new PersonRepository();
      
      const [giftsData, personsData] = await Promise.all([
        giftRepo.getAll(userId),
        personRepo.getAll(userId)
      ]);
      
      setGifts(giftsData);
      setPersons(personsData);
    } catch (error) {
      logger.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getCategoryData = (yearGifts: Gift[]) => {
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
  };

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

  const getReturnStatusData = (yearGifts: Gift[]) => {
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
  };

  const getTotalStats = (yearGifts: Gift[]) => {
    const totalAmount = yearGifts.reduce((sum, gift) => sum + (gift.amount || 0), 0);
    const avgAmount = yearGifts.length > 0 ? totalAmount / yearGifts.length : 0;
    
    return {
      totalGifts: yearGifts.length,
      totalAmount,
      avgAmount
    };
  };

  const monthlyData = useMemo(() => getMonthlyData(yearGifts), [yearGifts, getMonthlyData]);
  const categoryData = useMemo(() => getCategoryData(yearGifts), [yearGifts]);
  const personData = useMemo(() => getPersonData(yearGifts), [yearGifts, getPersonData]);
  const returnStatusData = useMemo(() => getReturnStatusData(yearGifts), [yearGifts]);
  const totalStats = useMemo(() => getTotalStats(yearGifts), [yearGifts]);

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
