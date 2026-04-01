/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useCallback, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { today, formatDisplay } from '../../lib/date';
import * as storage from '../../lib/storage';
import PlanForm from './PlanForm';
import PlanItem from './PlanItem';

export default function TodayPage() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || today();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const { plans, recordMap, doneCount, replacedCount, total } = useMemo(() => {
    storage.applyRecurringPlans(selectedDate);
    const plans = storage.getPlansByDate(selectedDate);
    const records = storage.getRecordsByDate(selectedDate);
    const recordMap = new Map(records.map((r) => [r.planId, r]));
    const doneCount = records.filter((r) => r.status === 'DONE').length;
    const replacedCount = records.filter((r) => r.status === 'REPLACED').length;
    return { plans, records, recordMap, doneCount, replacedCount, total: plans.length };
  }, [selectedDate, tick]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Date selector */}
      <div className="flex items-center justify-between mb-6 whitespace-nowrap">
        <div>
          <h2 className="text-xl font-bold">{formatDisplay(parseISO(selectedDate))}</h2>
          <p className="text-sm text-gray-400">
            {total > 0 ? (
              <>
                {doneCount + replacedCount}/{total} 완료
                <span className="text-gray-500 ml-1 text-xs">({doneCount}/{total})</span>
              </>
            ) : '계획이 없습니다'}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((doneCount + replacedCount) / total) * 100}%` }}
          />
        </div>
      )}

      {/* Add form */}
      <PlanForm date={selectedDate} onAdd={refresh} />

      {/* Plan list */}
      <div>
        {plans.map((plan) => (
          <PlanItem
            key={plan.id}
            plan={plan}
            record={recordMap.get(plan.id)}
            onUpdate={refresh}
          />
        ))}
        {plans.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-4xl mb-2">&#128221;</p>
            <p>오늘의 계획을 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
