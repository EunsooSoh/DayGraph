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
  createdAt: string;
}

export interface Record {
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
