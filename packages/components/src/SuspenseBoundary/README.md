<!-- packages/components/src/SuspenseBoundary/README.md -->

# SuspenseBoundary

로딩(Suspense)과 에러(ErrorBoundary)를 하나의 선언적 컴포넌트로 묶어주는 유틸리티입니다. 비동기 UI의 `pending → success → error` 흐름을 한 곳에서 다루고, 재시도/자동 리셋/로깅 패턴을 단순화합니다.

## 설치

```bash
npm install @frontend-toolkit-js/components
```

## 기본 사용

```tsx
import { SuspenseBoundary } from '@frontend-toolkit-js/components';

<SuspenseBoundary
  pendingFallback={<Spinner />}
  errorFallback={<ErrorMessage />}
>
  <UserProfile userId={userId} />
</SuspenseBoundary>;
```

---

## 주요 사용 사례

### 1. 함수형 에러 Fallback (재시도 버튼)

```tsx
<SuspenseBoundary
  pendingFallback={<Loading />}
  errorFallback={(error, reset) => (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
>
  <UserProfile userId={userId} />
</SuspenseBoundary>
```

### 2. resetKeys로 자동 상태 초기화

```tsx
<SuspenseBoundary
  pendingFallback={<Loading />}
  errorFallback={<ErrorMessage />}
  resetKeys={[userId]}
>
  <UserProfile userId={userId} />
</SuspenseBoundary>
```

`userId`가 바뀌면 에러 상태가 자동으로 리셋되어 동일한 fallback이 반복 표시되지 않습니다.

### 3. onError / onReset 훅

```tsx
<SuspenseBoundary
  pendingFallback={<Loading />}
  errorFallback={<ErrorMessage />}
  onError={(error, info) => logError(error, info)}
  onReset={() => {
    queryClient.invalidateQueries(['user', userId]);
  }}
>
  <UserProfile userId={userId} />
</SuspenseBoundary>
```

### 4. SuspenseBoundary + ErrorBoundary 중첩

```tsx
<SuspenseBoundary pendingFallback={<Spinner />} errorFallback={<ErrorUI />}>
  <ErrorBoundary fallback={<WidgetError />}>
    <AsyncWidget />
  </ErrorBoundary>
</SuspenseBoundary>
```

비동기 로딩과 컴포넌트 렌더링 에러를 목적에 맞게 분리할 수 있습니다.

---

## Props 요약

| Prop              | 타입                                         | 설명                                          |
| ----------------- | -------------------------------------------- | --------------------------------------------- |
| `pendingFallback` | `ReactNode`                                  | Suspense 대기 상태 UI                         |
| `errorFallback`   | `ReactNode` \| `(error, reset) => ReactNode` | 에러 표시 UI 또는 에러+reset을 받는 함수형 UI |
| `resetKeys`       | `unknown[]`                                  | 값이 변경되면 자동으로 에러 상태 초기화       |
| `onError`         | `(error: Error, info: ErrorInfo) => void`    | 에러 발생 시 콜백 (로그/모니터링)             |
| `onReset`         | `() => void`                                 | 에러 상태가 리셋될 때 호출 (캐시 초기화 등)   |

---

## ErrorBoundary 단독 사용

`Suspense`가 필요 없는 경우 `ErrorBoundary` 컴포넌트를 그대로 사용할 수 있습니다.

```tsx
import { ErrorBoundary } from '@frontend-toolkit-js/components';

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
  resetKeys={[locale]}
>
  <NonSuspenseWidget />
</ErrorBoundary>;
```

`SuspenseBoundary`와 동일한 props를 공유하므로 문서 하나에서 관리합니다.

---

## TypeScript

```ts
interface SuspenseBoundaryProps {
  children: React.ReactNode;
  pendingFallback: React.ReactNode;
  errorFallback:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode);
  resetKeys?: unknown[];
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
}
```

IDE 자동 완성과 제네릭 타입 정보를 그대로 사용할 수 있습니다.

---

## 패턴 가이드

### ✅ 권장

```tsx
// resetKeys로 사용자 전환 시 자동 초기화
<SuspenseBoundary resetKeys={[userId]} />

// 함수형 fallback에서 캐시 삭제 후 reset
<SuspenseBoundary
  errorFallback={(error, reset) => {
    removeCache(error);
    return <RetryButton onClick={reset} />;
  }}
/>
```

### ❌ 지양

```tsx
// 긴 로딩 UI를 직접 children에서 if/else로 분기
// → SuspenseBoundary로 감싸서 선언적으로 표현하세요.
{
  loading ? <Spinner /> : error ? <Error /> : <Content />;
}
```

---

## 디버깅 팁

- 개발 모드(`NODE_ENV=development`)에서는 에러 스택이 콘솔에 자동 출력됩니다.
- `resetKeys` 배열 길이나 순서가 바뀌면 에러가 리셋되므로, 의도치 않은 재렌더를 방지하려면 안정적인 키를 전달하세요.
- Suspense 리소스(예: React.lazy, React Query `suspense: true`)와 함께 사용하면 가장 효과적입니다.
