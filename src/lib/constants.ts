/**
 * Copyright (c) 2026 daygraph. All rights reserved.
 * Licensed under the MIT License.
 */

export const CATEGORIES = ['운동', '공부', '개발', '독서', '식사', '기타'] as const;

export const CATEGORY_COLORS: { [key: string]: string } = {
  '운동': 'bg-green-600',
  '공부': 'bg-blue-600',
  '개발': 'bg-purple-600',
  '독서': 'bg-yellow-600',
  '식사': 'bg-orange-600',
  '기타': 'bg-gray-600',
};
