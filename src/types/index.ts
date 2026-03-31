/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

export type RecordStatus = 'DONE' | 'MISSED' | 'REPLACED';
export type CellColor = 'DONE' | 'MISSED' | 'REPLACED' | 'EMPTY' | 'PARTIAL';

export interface Plan {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (optional)
  title: string;
  category: string;
  order: number;
  recurringPlanId?: string;
  createdAt: string;
}

export interface RecurringPlan {
  id: string;
  title: string;
  time?: string; // HH:mm
  category: string;
  recurrence: 'daily' | 'weekly';
  weekdays?: number[]; // 0(일)~6(토)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

export interface PlanRecord {
  id: string;
  planId: string;
  status: RecordStatus;
  memo?: string;
  replacedWith?: string;
  recordedAt: string;
}

export interface DaySummary {
  date: string;
  totalPlans: number;
  doneCount: number;
  missedCount: number;
  replacedCount: number;
  primaryColor: CellColor;
  intensity: number; // 0.0 ~ 1.0
}
