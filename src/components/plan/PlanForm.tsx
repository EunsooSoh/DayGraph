/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useRef } from 'react';
import * as storage from '../../lib/storage';
import { uid } from '../../lib/date';
import { CATEGORIES } from '../../lib/constants';

interface Props {
  date: string;
  onAdd: () => void;
}

export default function PlanForm({ date, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('기타');
  const timeRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const plans = storage.getPlansByDate(date);
    storage.addPlan({
      id: uid(),
      date,
      time: time || undefined,
      title: title.trim(),
      category,
      order: plans.length,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setTime('');
    onAdd();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4 overflow-x-auto whitespace-nowrap">
      <button
        type="button"
        onClick={() => timeRef.current?.showPicker()}
        className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-2 shrink-0"
      >
        {time || '⏱'}
      </button>
      <input
        ref={timeRef}
        type="time"
        value={time}
        step={300}
        onChange={(e) => setTime(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
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
        placeholder="새 계획 추가..."
        className="flex-1 bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-500 transition-colors"
      >
        추가
      </button>
    </form>
  );
}
