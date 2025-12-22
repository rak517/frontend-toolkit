# @frontend-toolkit-js/hooks

타입 안전하고 선언적인 React 훅 라이브러리

[![npm version](https://badge.fury.io/js/%40frontend-toolkit-js%2Fhooks.svg)](https://www.npmjs.com/package/@frontend-toolkit-js/hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 설치

```bash
npm install @frontend-toolkit-js/hooks
# or
pnpm add @frontend-toolkit-js/hooks
# or
yarn add @frontend-toolkit-js/hooks
```

## 특징

- ✅ TypeScript strict mode 100%
- ✅ 제네릭으로 타입 자동 추론
- ✅ Tree-shaking 지원
- ✅ 자동 cleanup (메모리 누수 방지)
- ✅ 프레임워크 어댑터 (Next.js, React Router)

## Hooks

| Hook | 설명 |
|------|------|
| [`useCalendar`](#usecalendar) | 달력 데이터와 네비게이션 |
| [`useQueryParams`](#usequeryparams) | URL 쿼리 파라미터 관리 |
| [`useFunnel`](#usefunnel) | 단계별 UI 흐름 (퍼널) |
| [`useDebounce`](#usedebounce) | 디바운스된 값 |
| [`useDebouncedCallback`](#usedebouncedcallback) | 디바운스된 콜백 |
| [`useIsMounted`](#useismounted) | 마운트 상태 확인 |

---

### `useCalendar`

달력 데이터와 네비게이션을 제공합니다.

```tsx
import { useCalendar } from '@frontend-toolkit-js/hooks';

function Calendar() {
  const { days, weekdays, currentDate, prev, next } = useCalendar({
    weekStartsOn: 1, // 월요일 시작
  });

  return (
    <div>
      <button onClick={prev}>◀</button>
      <span>{currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
      <button onClick={next}>▶</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => (
          <div key={i} style={{ opacity: day.isCurrentMonth ? 1 : 0.3 }}>
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### `useQueryParams`

URL 쿼리 파라미터를 타입 안전하게 관리합니다.

```tsx
import { useQueryParams, parseAsInteger, parseAsString } from '@frontend-toolkit-js/hooks';

function ProductList() {
  const { page, search, setParams } = useQueryParams({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
  });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setParams({ search: e.target.value, page: 1 })}
      />
      <button onClick={() => setParams({ page: page + 1 })}>
        다음 페이지
      </button>
    </div>
  );
}
```

**어댑터:** Browser (기본), Next.js App/Pages Router, React Router

---

### `useFunnel`

회원가입, 결제 등 단계별 UI 흐름을 선언적으로 관리합니다.

```tsx
import { useFunnel } from '@frontend-toolkit-js/hooks';

const STEPS = ['email', 'password', 'done'] as const;

function SignUpFunnel() {
  const funnel = useFunnel(STEPS, { initialStep: 'email' });

  return (
    <funnel.Funnel>
      <funnel.Step name="email">
        <button onClick={() => funnel.history.push('password')}>다음</button>
      </funnel.Step>
      <funnel.Step name="password">
        <button onClick={() => funnel.history.push('done')}>완료</button>
      </funnel.Step>
      <funnel.Step name="done">
        <p>가입 완료!</p>
      </funnel.Step>
    </funnel.Funnel>
  );
}
```

**어댑터:** Memory (기본), Browser, Next.js App/Pages Router, React Router

---

### `useDebounce`

값의 변경을 디바운스합니다.

```tsx
import { useDebounce } from '@frontend-toolkit-js/hooks';

function Search() {
  const [input, setInput] = useState('');
  const debouncedValue = useDebounce(input, 300);

  useEffect(() => {
    // 300ms 동안 입력이 없으면 검색 실행
    search(debouncedValue);
  }, [debouncedValue]);

  return <input value={input} onChange={(e) => setInput(e.target.value)} />;
}
```

---

### `useDebouncedCallback`

콜백 함수를 디바운스합니다. `leading`, `trailing`, `maxWait` 옵션 지원.

```tsx
import { useDebouncedCallback } from '@frontend-toolkit-js/hooks';

function Search() {
  const debouncedSearch = useDebouncedCallback(
    (query: string) => fetchResults(query),
    300,
    { leading: false, trailing: true }
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

---

### `useIsMounted`

컴포넌트의 마운트 상태를 확인합니다. 비동기 작업 후 상태 업데이트 시 유용합니다.

```tsx
import { useIsMounted } from '@frontend-toolkit-js/hooks';

function AsyncComponent() {
  const isMounted = useIsMounted();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      if (isMounted()) {
        setData(result); // 마운트된 경우에만 상태 업데이트
      }
    });
  }, []);

  return <div>{data}</div>;
}
```

---

## 프레임워크 어댑터

`useQueryParams`와 `useFunnel`은 프레임워크별 어댑터를 제공합니다.

```tsx
// Next.js App Router
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/next-app';
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/next-app';

// Next.js Pages Router
import { useNextPagesAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/next-pages';
import { useNextPagesAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/next-pages';

// React Router v6+
import { useReactRouterAdapter } from '@frontend-toolkit-js/hooks/useQueryParams/adapters/react-router';
import { useReactRouterAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/react-router';
```

## 문서

자세한 API 문서는 [frontend-toolkit.vercel.app](https://frontend-toolkit.vercel.app)에서 확인하세요.

## 라이선스

MIT © [rak517](https://github.com/rak517)
