/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useCallback } from 'react';
import type { RecurringPlan } from '../../types';
import { uid, today } from '../../lib/date';
import { CATEGORIES, CATEGORY_COLORS } from '../../lib/constants';
import * as storage from '../../lib/storage';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function RecurringPage() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('기타');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly'>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');

  const plans = storage.getRecurringPlans();
  // suppress lint: tick is used to trigger re-render
  void tick;

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (recurrence === 'weekly' && weekdays.length === 0) return;

    storage.addRecurringPlan({
      id: uid(),
      title: title.trim(),
      time: time || undefined,
      category,
      recurrence,
      weekdays: recurrence === 'weekly' ? weekdays : undefined,
      startDate,
      endDate: endDate || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setTime('');
    setCategory('기타');
    setRecurrence('daily');
    setWeekdays([]);
    setEndDate('');
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('이 주기적 계획을 삭제하시겠습니까?')) return;
    storage.deleteRecurringPlan(id);
    refresh();
  }

  function handleToggleActive(plan: RecurringPlan) {
    storage.updateRecurringPlan(plan.id, { active: !plan.active });
    refresh();
  }

  function formatRecurrence(plan: RecurringPlan) {
    if (plan.recurrence === 'daily') return '매일';
    return plan.weekdays?.map((d) => WEEKDAY_LABELS[d]).join(', ') || '';
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">주기적 계획 관리</h2>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={time}
            step={300}
            onChange={(e) => setTime(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-2"
            placeholder="시간"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="계획 제목..."
            className="flex-1 bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Recurrence */}
        <div className="flex gap-2 mb-3 items-center">
          <span className="text-sm text-gray-400">반복:</span>
          <button
            type="button"
            onClick={() => setRecurrence('daily')}
            className={`px-3 py-1 rounded text-sm ${
              recurrence === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            매일
          </button>
          <button
            type="button"
            onClick={() => setRecurrence('weekly')}
            className={`px-3 py-1 rounded text-sm ${
              recurrence === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            요일 선택
          </button>
        </div>

        {/* Weekday picker */}
        {recurrence === 'weekly' && (
          <div className="flex gap-1 mb-3">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleWeekday(i)}
                className={`w-9 h-9 rounded text-sm font-medium ${
                  weekdays.includes(i)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Date range */}
        <div className="flex gap-2 mb-3 items-center">
          <span className="text-sm text-gray-400">시작:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1 text-sm"
          />
          <span className="text-sm text-gray-400">종료:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-500 transition-colors"
        >
          추가
        </button>
      </form>

      {/* List */}
      {plans.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-4xl mb-2">&#128260;</p>
          <p>주기적 계획을 추가해보세요!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                plan.active
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-gray-900/50 border-gray-800 opacity-50'
              }`}
            >
              <button
                onClick={() => handleToggleActive(plan)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  plan.active ? 'border-green-500 bg-green-600' : 'border-gray-600'
                }`}
              >
                {plan.active && <span className="text-white text-xs">&#10003;</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[plan.category] || 'bg-gray-600'} text-white`}>
                    {plan.category}
                  </span>
                  <span className={`text-sm font-medium ${plan.active ? 'text-white' : 'text-gray-500'}`}>
                    {plan.title}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {plan.time && <span>{plan.time} &middot; </span>}
                  <span>{formatRecurrence(plan)}</span>
                  {plan.endDate && <span> &middot; ~{plan.endDate}</span>}
                </div>
              </div>

              <button
                onClick={() => handleDelete(plan.id)}
                className="text-gray-500 hover:text-red-400 text-sm shrink-0"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
