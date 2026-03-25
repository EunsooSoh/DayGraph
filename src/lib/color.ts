import type { CellColor, DaySummary, Plan, Record } from '../types';

export function computeDaySummary(date: string, plans: Plan[], records: Record[]): DaySummary {
  const recordMap = new Map(records.map((r) => [r.planId, r]));
  const totalPlans = plans.length;

  if (totalPlans === 0) {
    return { date, totalPlans: 0, doneCount: 0, missedCount: 0, replacedCount: 0, primaryColor: 'EMPTY', intensity: 0 };
  }

  let doneCount = 0;
  let missedCount = 0;
  let replacedCount = 0;

  for (const plan of plans) {
    const record = recordMap.get(plan.id);
    if (!record || record.status === 'MISSED') missedCount++;
    else if (record.status === 'DONE') doneCount++;
    else if (record.status === 'REPLACED') replacedCount++;
  }

  let primaryColor: CellColor;
  let intensity: number;

  if (doneCount === totalPlans) {
    primaryColor = 'DONE';
    intensity = 1.0;
  } else if (missedCount === totalPlans) {
    primaryColor = 'MISSED';
    intensity = 1.0;
  } else if (replacedCount > 0 && doneCount === 0 && missedCount === 0) {
    primaryColor = 'REPLACED';
    intensity = 1.0;
  } else {
    // Mixed: pick dominant
    const max = Math.max(doneCount, missedCount, replacedCount);
    if (doneCount === max) primaryColor = 'DONE';
    else if (missedCount === max) primaryColor = 'MISSED';
    else primaryColor = 'REPLACED';
    intensity = max / totalPlans;
  }

  return { date, totalPlans, doneCount, missedCount, replacedCount, primaryColor, intensity };
}

const COLOR_MAP: Record<string, string[]> = {
  // [intensity 0.25, 0.5, 0.75, 1.0]
  DONE:     ['#0e4429', '#006d32', '#26a641', '#39d353'],
  MISSED:   ['#5c1a1a', '#9b2c2c', '#dc2626', '#f87171'],
  REPLACED: ['#1e3a5f', '#1d4ed8', '#3b82f6', '#60a5fa'],
  EMPTY:    ['#161b22', '#161b22', '#161b22', '#161b22'],
};

export function getCellColor(summary: DaySummary): string {
  const colors = COLOR_MAP[summary.primaryColor] || COLOR_MAP.EMPTY;
  if (summary.primaryColor === 'EMPTY') return colors[0];
  const idx = Math.min(3, Math.max(0, Math.ceil(summary.intensity * 4) - 1));
  return colors[idx];
}
