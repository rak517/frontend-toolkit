# @frontend-toolkit-js/components

선언적이고 타입 안전한 React 컴포넌트 라이브러리

[![npm version](https://badge.fury.io/js/%40frontend-toolkit-js%2Fcomponents.svg)](https://www.npmjs.com/package/@frontend-toolkit-js/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 설치

```bash
npm install @frontend-toolkit-js/components
# or
pnpm add @frontend-toolkit-js/components
# or
yarn add @frontend-toolkit-js/components
```

## 특징

- 선언적 API와 가벼운 번들
- React 외 의존성 없음 (zero-deps)
- Strict TypeScript 지원 및 자동 완성
- Tree-shaking 가능한 ESM 번들

---

## 포함 컴포넌트

| 컴포넌트           | 설명                                                                                        | 문서                                                             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `InViewTrigger`    | Intersection Observer 기반 뷰포트 감지. 무한 스크롤, 지연 로딩, 애니메이션 트리거 등에 사용 | [문서](./src/InViewTrigger/README.md)                            |
| `SuspenseBoundary` | Suspense + ErrorBoundary 통합 컴포넌트. 로딩/에러/재시도 흐름을 선언적으로 처리             | [문서](./src/SuspenseBoundary/README.md)                         |
| `ErrorBoundary`    | Suspense 없이도 사용할 수 있는 독립 에러 경계. 재시도/자동 리셋/로깅 지원                   | [문서](./src/SuspenseBoundary/README.md#errorboundary-단독-사용) |

새로운 컴포넌트가 추가되어도 표 형태로 간단히 확장할 수 있도록 구성했습니다.

---

## 빠른 시작

```tsx
import {
  InViewTrigger,
  SuspenseBoundary,
} from '@frontend-toolkit-js/components';

function Example() {
  return (
    <SuspenseBoundary
      pendingFallback={<Spinner />}
      errorFallback={<ErrorState />}
    >
      <InViewTrigger onInView={() => console.log('보임!')}>
        <Article />
      </InViewTrigger>
    </SuspenseBoundary>
  );
}
```

---

## 스크립트

```bash
pnpm dev        # 개발 모드
pnpm build      # 빌드
pnpm test       # 테스트
```

---

## 관련 패키지

- [@frontend-toolkit-js/hooks](../hooks) - React Hooks 모음
- [@frontend-toolkit-js/utils](../utils) - 범용 유틸리티 함수

---

## 라이선스

MIT © [rak517](https://github.com/rak517)
