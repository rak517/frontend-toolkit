# useQueryParams

URL 쿼리 파라미터를 선언적으로 관리하는 React Hook입니다.

## Features

- **타입 안전성**: 스키마 기반 파서로 타입 자동 추론
- **선언적 API**: Zod 스타일의 빌더 패턴
- **SSR 지원**: Next.js 등 SSR 환경에서 안전하게 동작
- **어댑터 패턴**: Browser, Next.js, React Router 등 다양한 환경 지원

## Installation

```bash
pnpm add @frontend-toolkit-js/hooks
```

## Usage

### Basic

```tsx
import {
  useQueryParams,
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
  parseAsStringEnum,
} from '@frontend-toolkit-js/hooks';

const sortOptions = ['latest', 'oldest', 'popular'] as const;

function ProductList() {
  const { page, search, sort, showSoldOut, setParams } = useQueryParams({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
    sort: parseAsStringEnum(sortOptions).withDefault('latest'),
    showSoldOut: parseAsBoolean.withDefault(false),
  });

  return (
    <div>
      {/* 현재 값 사용 */}
      <p>현재 페이지: {page}</p>
      <p>검색어: {search}</p>

      {/* 값 업데이트 */}
      <button onClick={() => setParams({ page: page + 1 })}>
        다음 페이지
      </button>

      {/* 여러 값 동시 업데이트 */}
      <button onClick={() => setParams({ search: '', page: 1 })}>
        검색 초기화
      </button>
    </div>
  );
}
```

### History Options

```tsx
// replace (기본값): 히스토리에 쌓이지 않음
setParams({ page: 2 });
setParams({ page: 2 }, { history: 'replace' });

// push: 히스토리에 추가 (뒤로가기로 이전 상태 복원 가능)
setParams({ page: 2 }, { history: 'push' });
```

## Parsers

### 기본 타입

| Parser | 타입 | 예시 |
|--------|------|------|
| `parseAsString` | `string` | `?name=hello` → `'hello'` |
| `parseAsInteger` | `number` | `?page=5` → `5` |
| `parseAsFloat` | `number` | `?price=19.99` → `19.99` |
| `parseAsBoolean` | `boolean` | `?active=true` → `true` |

### 날짜

| Parser | 타입 | 예시 |
|--------|------|------|
| `parseAsIsoDate` | `Date` | `?date=2024-01-15` → `Date` |
| `parseAsIsoDateTime` | `Date` | `?date=2024-01-15T09:30:00Z` → `Date` |

### 복합 타입

| Parser | 타입 | 예시 |
|--------|------|------|
| `parseAsStringEnum(values)` | `T` | `?sort=latest` → `'latest'` |
| `parseAsLiteral(values)` | `T` | `parseAsStringEnum`의 별칭 |
| `parseAsJson<T>()` | `T` | `?data={"a":1}` → `{ a: 1 }` |

### 배열

| Parser | 타입 | 예시 |
|--------|------|------|
| `parseAsArray(parser)` | `T[]` | `?tags=a,b,c` → `['a', 'b', 'c']` |
| `parseAsNativeArray(parser)` | `T[]` | `?id=1&id=2` → `[1, 2]` |

## Default Values

`.withDefault()`를 사용하면:
1. 쿼리 파라미터가 없을 때 기본값 사용
2. 타입이 `T | null`에서 `T`로 변경 (null 제거)

```tsx
// withDefault 없이: string | null
const { name } = useQueryParams({
  name: parseAsString,
});

// withDefault 사용: string
const { name } = useQueryParams({
  name: parseAsString.withDefault(''),
});
```

## Framework Adapters

프레임워크별 어댑터를 제공합니다. Provider 패턴 또는 직접 전달 방식으로 사용할 수 있습니다.

### Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { Suspense, type ReactNode } from 'react';
import { QueryParamsProvider } from '@frontend-toolkit-js/hooks';
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/next-app';

function QueryParamsProviderInner({ children }: { children: ReactNode }) {
  const adapter = useNextAppAdapter();
  return (
    <QueryParamsProvider adapter={adapter}>
      {children}
    </QueryParamsProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <QueryParamsProviderInner>{children}</QueryParamsProviderInner>
    </Suspense>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// 컴포넌트에서 사용 (adapter 생략 가능)
const { page } = useQueryParams({ page: parseAsInteger.withDefault(1) });
```

### Next.js Pages Router

```tsx
// _app.tsx
import { QueryParamsProvider } from '@frontend-toolkit-js/hooks';
import { useNextPagesAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/next-pages';

function MyApp({ Component, pageProps }) {
  const adapter = useNextPagesAdapter();
  return (
    <QueryParamsProvider adapter={adapter}>
      <Component {...pageProps} />
    </QueryParamsProvider>
  );
}
```

### React Router v6+

```tsx
// App.tsx
import { QueryParamsProvider } from '@frontend-toolkit-js/hooks';
import { useReactRouterAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/react-router';

function Providers({ children }) {
  const adapter = useReactRouterAdapter();
  return (
    <QueryParamsProvider adapter={adapter}>
      {children}
    </QueryParamsProvider>
  );
}
```

### 어댑터 옵션

| 어댑터 | 옵션 | 기본값 | 설명 |
|--------|------|--------|------|
| `useNextAppAdapter` | `scroll` | `false` | URL 변경 시 스크롤 초기화 |
| `useNextPagesAdapter` | `scroll` | `false` | URL 변경 시 스크롤 초기화 |
| | `shallow` | `true` | getServerSideProps 재실행 방지 |
| `useReactRouterAdapter` | `preventScrollReset` | `false` | 스크롤 위치 유지 |

## Custom Adapter

기본적으로 Browser History API를 사용하지만, 커스텀 어댑터를 전달할 수 있습니다.

```tsx
import { createQueryParamsBrowserAdapter } from '@frontend-toolkit-js/hooks';

const { page, setParams } = useQueryParams(
  { page: parseAsInteger.withDefault(1) },
  { adapter: createQueryParamsBrowserAdapter({ scroll: true }) }
);
```

### Adapter Interface

```tsx
interface QueryParamsAdapter {
  getSearchParams: () => URLSearchParams;
  getServerSnapshot: () => URLSearchParams;
  push: (params: URLSearchParams) => void;
  replace: (params: URLSearchParams) => void;
  subscribe: (listener: () => void) => () => void;
  init?: () => void;
  cleanup?: () => void;
}
```

## Custom Parser

`createParser`를 사용하여 커스텀 파서를 만들 수 있습니다.

```tsx
import { createParser } from '@frontend-toolkit-js/hooks';

const parseAsSlug = createParser<string | null>({
  parse: (value) => {
    if (typeof value !== 'string') return null;
    // 슬러그 형식만 허용
    return /^[a-z0-9-]+$/.test(value) ? value : null;
  },
  serialize: (value) => value ?? '',
});

const { slug } = useQueryParams({
  slug: parseAsSlug.withDefault(''),
});
```
