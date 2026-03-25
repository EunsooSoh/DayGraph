# DayGraph

GitHub 스타일의 기여 히트맵으로 일일 계획과 습관을 추적하는 개인 생산성 시각화 앱입니다.

## 주요 기능

- **일일 계획 관리** — 시간, 카테고리별로 계획을 추가하고 완료(Done), 미달성(Missed), 대체(Replaced) 상태로 기록
- **기여 히트맵** — 1년간의 달성률을 GitHub 스타일 히트맵으로 시각화
- **통계 대시보드** — 연속 달성 스트릭, 전체 달성률, 카테고리별 분석 제공
- **카테고리 분류** — 운동, 공부, 개발, 독서, 기타 등 카테고리별 계획 관리

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- date-fns (한국어 로케일)
- localStorage 기반 데이터 저장

## 시작하기

```bash
npm install
npm run dev
```

## 배포

GitHub Pages로 배포됩니다.

```bash
npm run deploy
```

## 프로젝트 구조

```
src/
├── components/
│   ├── dashboard/   # 메인 히트맵 대시보드
│   ├── graph/       # 히트맵 시각화
│   ├── plan/        # 계획 관리 (추가, 수정, 상태 변경)
│   ├── stats/       # 통계 페이지
│   └── layout/      # 헤더 네비게이션
├── lib/             # 유틸리티 (스토리지, 날짜, 색상)
└── types/           # TypeScript 타입 정의
```
