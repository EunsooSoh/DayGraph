/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as storage from '../../lib/storage';
import { computeDaySummary } from '../../lib/color';
import { today } from '../../lib/date';
import { parseISO, subDays, format, startOfWeek, endOfWeek, addWeeks, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Plan, PlanRecord } from '../../types';

export default function StatsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [plans, setPlans] = useState<Plan[]>(() => storage.getPlans());
  const [records, setRecords] = useState<PlanRecord[]>(() => storage.getRecords());

  const refreshData = useCallback(() => {
    setPlans(storage.getPlans());
    setRecords(storage.getRecords());
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener('focus', refreshData);
    return () => window.removeEventListener('focus', refreshData);
  }, [refreshData]);

  const recordMap = useMemo(() => new Map(records.map((r) => [r.planId, r])), [records]);

  // Streak calculation — independent of weekOffset
  const currentStreak = useMemo(() => {
    const todayStr = today();
    const allPlansByDate = new Map<string, Plan[]>();
    for (const p of plans) {
      const arr = allPlansByDate.get(p.date) || [];
      arr.push(p);
      allPlansByDate.set(p.date, arr);
    }

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const dateStr = format(subDays(parseISO(todayStr), i), 'yyyy-MM-dd');
      const datePlans = allPlansByDate.get(dateStr);
      if (!datePlans || datePlans.length === 0) {
        if (i === 0) continue;
        break;
      }
      const dateRecords = datePlans.map((p) => recordMap.get(p.id)).filter(Boolean) as PlanRecord[];
      const summary = computeDaySummary(dateStr, datePlans, dateRecords);
      if (summary.doneCount > 0 && summary.missedCount === 0) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [plans, recordMap]);

  // Weekly stats — recalculates on week navigation or data change
  const weekStats = useMemo(() => {
    const todayStr = today();
    const todayDate = parseISO(todayStr);
    const currentWeekStart = startOfWeek(addWeeks(todayDate, weekOffset), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(addWeeks(todayDate, weekOffset), { weekStartsOn: 1 });
    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEndStr = format(currentWeekEnd, 'yyyy-MM-dd');

    const weekPlans = plans.filter((p) => p.date >= weekStartStr && p.date <= weekEndStr);

    const plansByDate = new Map<string, Plan[]>();
    for (const p of weekPlans) {
      const arr = plansByDate.get(p.date) || [];
      arr.push(p);
      plansByDate.set(p.date, arr);
    }

    let totalDone = 0;
    let totalMissed = 0;
    let totalReplaced = 0;
    let totalPlans = 0;

    const categoryStats = new Map<string, { done: number; total: number }>();

    for (const [date, datePlans] of plansByDate) {
      const dateRecords = datePlans.map((p) => recordMap.get(p.id)).filter(Boolean) as PlanRecord[];
      const summary = computeDaySummary(date, datePlans, dateRecords);
      totalDone += summary.doneCount;
      totalMissed += summary.missedCount;
      totalReplaced += summary.replacedCount;
      totalPlans += summary.totalPlans;

      for (const p of datePlans) {
        const cat = categoryStats.get(p.category) || { done: 0, total: 0 };
        cat.total++;
        const rec = recordMap.get(p.id);
        if (rec?.status === 'DONE') cat.done++;
        categoryStats.set(p.category, cat);
      }
    }

    const weekLabel = `${format(currentWeekStart, 'M/d', { locale: ko })} ~ ${format(currentWeekEnd, 'M/d', { locale: ko })}`;
    const isCurrentWeek = weekOffset === 0;
    const isFutureWeek = isAfter(currentWeekStart, todayDate);

    return {
      totalPlans,
      totalDone,
      totalMissed,
      totalReplaced,
      completionRate: totalPlans > 0 ? Math.round((totalDone / totalPlans) * 100) : 0,
      weekLabel,
      isCurrentWeek,
      isFutureWeek,
      categories: Array.from(categoryStats.entries()).map(([name, s]) => ({
        name,
        done: s.done,
        total: s.total,
        rate: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
      })).sort((a, b) => b.total - a.total),
    };
  }, [weekOffset, plans, recordMap]);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Statistics</h2>

      {/* Current Streak - large block */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center mb-4">
        <div className="text-4xl font-bold text-green-400">{currentStreak}d</div>
        <div className="text-sm text-gray-400 mt-1">Current Streak</div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="text-gray-400 hover:text-white px-2 py-1"
        >
          &larr;
        </button>
        <span className="text-sm text-gray-300">
          {weekStats.weekLabel}
          {weekStats.isCurrentWeek && <span className="text-gray-500 ml-1">(이번 주)</span>}
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={weekStats.isCurrentWeek}
          className={`px-2 py-1 ${weekStats.isCurrentWeek ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
        >
          &rarr;
        </button>
      </div>

      {/* Weekly overview cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Completion Rate" value={`${weekStats.completionRate}%`} color="text-blue-400" />
        <StatCard label="Total Plans" value={weekStats.totalPlans.toString()} color="text-white" />
        <StatCard label="Done" value={weekStats.totalDone.toString()} color="text-green-400" />
      </div>

      {/* Status breakdown */}
      {weekStats.totalPlans > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Status Breakdown</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-2">
            {weekStats.totalDone > 0 && (
              <div className="bg-green-500" style={{ width: `${(weekStats.totalDone / weekStats.totalPlans) * 100}%` }} />
            )}
            {weekStats.totalReplaced > 0 && (
              <div className="bg-blue-500" style={{ width: `${(weekStats.totalReplaced / weekStats.totalPlans) * 100}%` }} />
            )}
            {weekStats.totalMissed > 0 && (
              <div className="bg-red-500" style={{ width: `${(weekStats.totalMissed / weekStats.totalPlans) * 100}%` }} />
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-400 whitespace-nowrap">
            <span><span className="text-green-400">{weekStats.totalDone}</span> done</span>
            <span><span className="text-blue-400">{weekStats.totalReplaced}</span> replaced</span>
            <span><span className="text-red-400">{weekStats.totalMissed}</span> missed</span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {weekStats.categories.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">By Category</h3>
          <div className="space-y-3">
            {weekStats.categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{cat.name}</span>
                  <span className="text-gray-400">{cat.done}/{cat.total} ({cat.rate}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weekStats.totalPlans === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-4xl mb-2">&#128202;</p>
          <p>계획을 기록하면 통계가 표시됩니다</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
