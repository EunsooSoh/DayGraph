/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
  isToday as isTodayFn,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplay(date: Date): string {
  return format(date, 'M월 d일 (EEE)', { locale: ko });
}

export function today(): string {
  return formatDate(new Date());
}

export function isToday(dateStr: string): boolean {
  return isTodayFn(parseISO(dateStr));
}

export function getYearDays(year: number): string[] {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  return eachDayOfInterval({ start, end }).map(formatDate);
}

export interface WeekGrid {
  weeks: string[][]; // 53 weeks, each 7 days (some may be '')
  monthLabels: { label: string; col: number }[];
}

export function buildYearGrid(year: number): WeekGrid {
  const days = getYearDays(year);
  const firstDate = parseISO(days[0]);

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Pad first week
  const firstDayOfWeek = getDay(firstDate);
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

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w].find((d) => d !== '');
    if (firstDay) {
      const month = parseISO(firstDay).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: months[month], col: w });
        lastMonth = month;
      }
    }
  }

  return { weeks, monthLabels };
}

export function uid(): string {
  return crypto.randomUUID();
}
