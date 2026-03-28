/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { buildYearGrid, formatDisplay } from '../../lib/date';
import { computeDaySummary, getCellColor } from '../../lib/color';
import * as storage from '../../lib/storage';
import type { DaySummary } from '../../types';

const CELL_SIZE = 13;
const CELL_GAP = 3;
const CELL_TOTAL = CELL_SIZE + CELL_GAP;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LABEL_WIDTH = 32;

interface Props {
  year: number;
  onSelectDate?: (date: string) => void;
}

export default function Heatmap({ year, onSelectDate }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; summary: DaySummary } | null>(null);

  const grid = useMemo(() => buildYearGrid(year), [year]);

  const summaryMap = useMemo(() => {
    const plans = storage.getPlans();
    const records = storage.getRecords();
    const map = new Map<string, DaySummary>();

    // Group plans by date
    const plansByDate = new Map<string, typeof plans>();
    for (const p of plans) {
      const arr = plansByDate.get(p.date) || [];
      arr.push(p);
      plansByDate.set(p.date, arr);
    }

    // Group records by planId
    const recordMap = new Map(records.map((r) => [r.planId, r]));

    for (const [date, datePlans] of plansByDate) {
      const dateRecords = datePlans.map((p) => recordMap.get(p.id)).filter(Boolean) as typeof records;
      map.set(date, computeDaySummary(date, datePlans, dateRecords));
    }
    return map;
  }, [year]);

  const emptySummary = (date: string): DaySummary => ({
    date, totalPlans: 0, doneCount: 0, missedCount: 0, replacedCount: 0, primaryColor: 'EMPTY', intensity: 0,
  });

  const svgWidth = LABEL_WIDTH + grid.weeks.length * CELL_TOTAL;
  const svgHeight = 20 + 7 * CELL_TOTAL + 10;

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="select-none">
        {/* Month labels */}
        {grid.monthLabels.map((m, i) => (
          <text
            key={i}
            x={LABEL_WIDTH + m.col * CELL_TOTAL}
            y={12}
            className="fill-gray-400"
            fontSize={10}
          >
            {m.label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, i) => (
          label && (
            <text
              key={i}
              x={0}
              y={20 + i * CELL_TOTAL + CELL_SIZE - 2}
              className="fill-gray-500"
              fontSize={9}
            >
              {label}
            </text>
          )
        ))}

        {/* Cells */}
        {grid.weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return null;
            const summary = summaryMap.get(day) || emptySummary(day);
            const color = getCellColor(summary);
            const x = LABEL_WIDTH + wi * CELL_TOTAL;
            const y = 20 + di * CELL_TOTAL;

            return (
              <rect
                key={day}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                ry={2}
                fill={color}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect();
                  setTooltip({ x: rect.left + rect.width / 2, y: rect.top, summary });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onSelectDate?.(day)}
              />
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

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 justify-end">
        <span>Less</span>
        {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c) => (
          <span key={c} className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
        <span className="ml-3">|</span>
        <span className="w-3 h-3 rounded-sm inline-block bg-green-500 ml-1" /> Done
        <span className="w-3 h-3 rounded-sm inline-block bg-red-500 ml-1" /> Missed
        <span className="w-3 h-3 rounded-sm inline-block bg-blue-500 ml-1" /> Replaced
      </div>
    </div>
  );
}
