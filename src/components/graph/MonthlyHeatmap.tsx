/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo } from 'react';
import { parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { formatDate, formatDisplay } from '../../lib/date';
import { computeDaySummary, getCellColor } from '../../lib/color';
import * as storage from '../../lib/storage';
import type { DaySummary } from '../../types';

const CELL_SIZE = 28;
const CELL_GAP = 3;
const CELL_TOTAL = CELL_SIZE + CELL_GAP;
const DAY_HEADERS = ['월', '화', '수', '목', '금', '토', '일'];

interface Props {
  year: number;
  month: number; // 0-indexed
  onSelectDate?: (date: string) => void;
}

export default function MonthlyHeatmap({ year, month, onSelectDate }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; summary: DaySummary } | null>(null);

  const grid = useMemo(() => {
    const start = startOfMonth(new Date(year, month, 1));
    const end = endOfMonth(new Date(year, month, 1));
    const days = eachDayOfInterval({ start, end }).map(formatDate);

    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    // Pad first week (Monday = 0)
    const firstDayOfWeek = (getDay(parseISO(days[0])) + 6) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push('');
    }

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push('');
      weeks.push(currentWeek);
    }

    return weeks;
  }, [year, month]);

  const summaryMap = useMemo(() => {
    const plans = storage.getPlans();
    const records = storage.getRecords();
    const map = new Map<string, DaySummary>();

    const plansByDate = new Map<string, typeof plans>();
    for (const p of plans) {
      const arr = plansByDate.get(p.date) || [];
      arr.push(p);
      plansByDate.set(p.date, arr);
    }

    const recordMap = new Map(records.map((r) => [r.planId, r]));

    for (const [date, datePlans] of plansByDate) {
      const dateRecords = datePlans.map((p) => recordMap.get(p.id)).filter(Boolean) as typeof records;
      map.set(date, computeDaySummary(date, datePlans, dateRecords));
    }
    return map;
  }, [year, month]);

  const emptySummary = (date: string): DaySummary => ({
    date, totalPlans: 0, doneCount: 0, missedCount: 0, replacedCount: 0, primaryColor: 'EMPTY', intensity: 0,
  });

  const svgWidth = 7 * CELL_TOTAL;
  const headerHeight = 24;
  const svgHeight = headerHeight + grid.length * CELL_TOTAL;

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="select-none mx-auto block">
        {/* Day-of-week headers */}
        {DAY_HEADERS.map((label, i) => (
          <text
            key={i}
            x={i * CELL_TOTAL + CELL_SIZE / 2}
            y={14}
            className="fill-gray-500"
            fontSize={11}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {grid.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return null;
            const summary = summaryMap.get(day) || emptySummary(day);
            const color = getCellColor(summary);
            const x = di * CELL_TOTAL;
            const y = headerHeight + wi * CELL_TOTAL;
            const dayNum = parseISO(day).getDate();

            return (
              <g key={day}>
                <rect
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  ry={4}
                  fill={color}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, summary });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => onSelectDate?.(day)}
                />
                <text
                  x={x + CELL_SIZE / 2}
                  y={y + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-gray-400 pointer-events-none"
                >
                  {dayNum}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-xs pointer-events-none shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-white">
            {formatDisplay(parseISO(tooltip.summary.date))}
          </div>
          {tooltip.summary.totalPlans > 0 ? (
            <div className="text-gray-300 mt-1">
              <span className="text-green-400">{tooltip.summary.doneCount} done</span>
              {' / '}
              <span className="text-red-400">{tooltip.summary.missedCount} missed</span>
              {tooltip.summary.replacedCount > 0 && (
                <> / <span className="text-blue-400">{tooltip.summary.replacedCount} replaced</span></>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No plans</div>
          )}
        </div>
      )}
    </div>
  );
}
