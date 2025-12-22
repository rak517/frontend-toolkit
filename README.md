# Frontend Toolkit

React 컴포넌트와 훅 라이브러리

## 📦 패키지

| 패키지 | 설명 | 버전 |
|--------|------|------|
| [@frontend-toolkit-js/hooks](./packages/hooks) | React Hooks 라이브러리 | [![npm](https://img.shields.io/npm/v/@frontend-toolkit-js/hooks)](https://www.npmjs.com/package/@frontend-toolkit-js/hooks) |
| [@frontend-toolkit-js/components](./packages/components) | React 컴포넌트 라이브러리 | [![npm](https://img.shields.io/npm/v/@frontend-toolkit-js/components)](https://www.npmjs.com/package/@frontend-toolkit-js/components) |

## 🎯 목표

- 선언적 API
- 타입 안전성
- Tree-shaking 지원
- 프레임워크 어댑터 (Next.js, React Router)

## 🛠️ 개발

```bash
# 설치
pnpm install

# 빌드
pnpm build

# 개발 모드
pnpm dev

# 문서 사이트
pnpm --filter docs dev
```

## 📚 문서

[frontend-toolkit.vercel.app](https://frontend-toolkit.vercel.app)

## 📋 Hooks

- `useCalendar` - 달력 데이터와 네비게이션
- `useQueryParams` - URL 쿼리 파라미터 관리
- `useFunnel` - 단계별 UI 흐름 (퍼널)
- `useDebounce` - 디바운스된 값
- `useDebouncedCallback` - 디바운스된 콜백
- `useIsMounted` - 마운트 상태 확인

## 🧩 Components

- `InViewTrigger` - 뷰포트 진입 감지 및 무한스크롤
- `SuspenseBoundary` - Suspense + ErrorBoundary 통합

## 라이선스

MIT © [rak517](https://github.com/rak517)
