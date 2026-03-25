import type { Plan, Record } from '../types';

const PLANS_KEY = 'daygraph_plans';
const RECORDS_KEY = 'daygraph_records';

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Plans
export function getPlans(): Plan[] {
  return load<Plan>(PLANS_KEY);
}

export function getPlansByDate(date: string): Plan[] {
  return getPlans()
    .filter((p) => p.date === date)
    .sort((a, b) => {
      // time이 있는 항목이 먼저, time 기준 오름차순, 없으면 order 기준
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return a.order - b.order;
    });
}

export function addPlan(plan: Plan) {
  const plans = getPlans();
  plans.push(plan);
  save(PLANS_KEY, plans);
}

export function updatePlan(id: string, updates: Partial<Plan>) {
  const plans = getPlans().map((p) => (p.id === id ? { ...p, ...updates } : p));
  save(PLANS_KEY, plans);
}

export function deletePlan(id: string) {
  save(PLANS_KEY, getPlans().filter((p) => p.id !== id));
  // Also delete associated record
  save(RECORDS_KEY, getRecords().filter((r) => r.planId !== id));
}

// Records
export function getRecords(): Record[] {
  return load<Record>(RECORDS_KEY);
}

export function getRecordByPlanId(planId: string): Record | undefined {
  return getRecords().find((r) => r.planId === planId);
}

export function getRecordsByDate(date: string): Record[] {
  const planIds = new Set(getPlansByDate(date).map((p) => p.id));
  return getRecords().filter((r) => planIds.has(r.planId));
}

export function upsertRecord(record: Record) {
  const records = getRecords();
  const idx = records.findIndex((r) => r.planId === record.planId);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  save(RECORDS_KEY, records);
}

export function deleteRecord(planId: string) {
  save(RECORDS_KEY, getRecords().filter((r) => r.planId !== planId));
}
