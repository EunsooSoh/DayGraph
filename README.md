<div align="center">

# 📊 DayGraph

**GitHub 스타일 히트맵으로 하루를 시각화하세요**

매일의 계획과 습관을 기록하고, 달성률을 한눈에 확인할 수 있는 개인 생산성 트래커

[![Deploy](https://img.shields.io/badge/🌐_Live_Demo-GitHub_Pages-blue?style=for-the-badge)](https://eunsoosoh.github.io/DayGraph/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📝 **일일 계획 관리** | 시간대별, 카테고리별로 계획을 추가하고 상태를 기록 |
| 🟩 **기여 히트맵** | 1년간의 달성률을 GitHub 스타일 히트맵으로 시각화 |
| 📈 **통계 대시보드** | 연속 스트릭, 전체 달성률, 카테고리별 분석 제공 |
| 🏷️ **카테고리 분류** | 운동, 공부, 개발, 독서 등 카테고리별 관리 |
| ✅ **상태 추적** | Done · Missed · Replaced 세 가지 상태로 계획 추적 |
| 💾 **로컬 저장** | 별도 서버 없이 브라우저에 데이터 저장 |

## 🛠️ 기술 스택

```
React 18  ·  TypeScript  ·  Vite  ·  Tailwind CSS  ·  date-fns  ·  React Router
```

## 🚀 시작하기

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 📁 프로젝트 구조

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

## 📄 라이센스

[MIT License](./LICENSE)
