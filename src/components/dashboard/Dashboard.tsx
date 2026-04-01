/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Heatmap from '../graph/Heatmap';
import MonthlyHeatmap from '../graph/MonthlyHeatmap';
import { today, formatDisplay } from '../../lib/date';
import { computeDaySummary } from '../../lib/color';
import * as storage from '../../lib/storage';
import { parseISO } from 'date-fns';

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthYear, setMonthYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11);
      setMonthYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setMonthYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleMonthToday() {
    const t = new Date();
    setMonthYear(t.getFullYear());
    setMonth(t.getMonth());
  }

  // Re-render heatmap when navigating back to dashboard
  useEffect(() => {
    setTick((t) => t + 1);
  }, []);

  const todayStr = today();
  const todaySummary = useMemo(() => {
    const plans = storage.getPlansByDate(todayStr);
    const records = storage.getRecordsByDate(todayStr);
    return computeDaySummary(todayStr, plans, records);
  }, [todayStr]);

  function handleSelectDate(date: string) {
    navigate(`/today?date=${date}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Today quick summary */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between whitespace-nowrap mb-3">
          <div>
            <h2 className="text-sm text-gray-400">Today</h2>
            <p className="text-lg font-semibold">{formatDisplay(parseISO(todayStr))}</p>
          </div>
          <button
            onClick={() => navigate('/today')}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-500"
            title="Add plan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {todaySummary.totalPlans > 0 ? (
          <>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((todaySummary.doneCount + todaySummary.replacedCount) / todaySummary.totalPlans) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs">
                <span><span className="text-green-400 font-medium">{todaySummary.doneCount}</span> <span className="text-gray-500">done</span></span>
                <span><span className="text-blue-400 font-medium">{todaySummary.replacedCount}</span> <span className="text-gray-500">replaced</span></span>
                <span><span className="text-red-400 font-medium">{todaySummary.missedCount}</span> <span className="text-gray-500">missed</span></span>
              </div>
              <span className="text-lg font-bold text-green-400">
                {todaySummary.doneCount + todaySummary.replacedCount}
                <span className="text-sm font-normal text-gray-600">/{todaySummary.totalPlans}</span>
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({todaySummary.doneCount}/{todaySummary.totalPlans})
                </span>
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">아직 계획이 없습니다. 오늘의 계획을 추가해보세요!</p>
        )}
      </div>

      {/* Month selector + Monthly Heatmap */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">
            {monthYear}년 {MONTH_NAMES[month]}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              &larr;
            </button>
            <button
              onClick={handleMonthToday}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              &rarr;
            </button>
          </div>
        </div>
        <MonthlyHeatmap key={`${monthYear}-${month}-${tick}`} year={monthYear} month={month} onSelectDate={handleSelectDate} />
      </div>

      {/* Year selector + Heatmap */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">
            {year}년 Contributions
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setYear(year - 1)}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              &larr;
            </button>
            <button
              onClick={() => setYear(new Date().getFullYear())}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              Today
            </button>
            <button
              onClick={() => setYear(year + 1)}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              &rarr;
            </button>
          </div>
        </div>
        <Heatmap key={tick} year={year} onSelectDate={handleSelectDate} />
      </div>
    </div>
  );
}
