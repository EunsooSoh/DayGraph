/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Heatmap from '../graph/Heatmap';
import { today, formatDisplay } from '../../lib/date';
import { computeDaySummary } from '../../lib/color';
import * as storage from '../../lib/storage';
import { parseISO } from 'date-fns';

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

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
        <div className="flex items-center justify-between whitespace-nowrap">
          <div>
            <h2 className="text-sm text-gray-400">Today</h2>
            <p className="text-lg font-semibold">{formatDisplay(parseISO(todayStr))}</p>
          </div>
          <div className="flex items-center gap-3">
            {todaySummary.totalPlans > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {todaySummary.doneCount}/{todaySummary.totalPlans}
                </p>
                <p className="text-xs text-gray-400">completed</p>
              </div>
            )}
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
        </div>
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
