# useDebouncedCallback

콜백 함수를 디바운스하여 반환하는 Hook

## 기본 사용법

```tsx
import { useDebouncedCallback } from '@frontend-toolkit-js/hooks';

function SearchInput() {
  const debouncedSearch = useDebouncedCallback((query: string) => {
    fetch(`/api/search?q=${query}`);
  }, 300);

  return (
    <input
      onChange={e => debouncedSearch(e.target.value)}
      placeholder="검색..."
    />
  );
}
```

---

## 주요 사용 사례

### 1. 검색 자동완성 (기본)

```tsx
const debouncedSearch = useDebouncedCallback((query: string) => {
  fetchResults(query);
}, 300);

// 동작:
// 입력 "a" → 타이머 시작
// 입력 "ab" → 타이머 리셋
// 입력 "abc" → 타이머 리셋
// 300ms 후 → 검색 실행 ✅
```

### 2. 버튼 연타 방지 (leading)

```tsx
const handleSubmit = useDebouncedCallback(() => submitForm(), 1000, {
  leading: true,
  trailing: false,
});

// 동작:
// 클릭1 → 즉시 실행 ✅
// 클릭2 (0.5초 후) → 무시
// 클릭3 (0.8초 후) → 무시
// 1초 후 → 다시 클릭 가능
```

### 3. 자동 저장 (maxWait)

```tsx
const autoSave = useDebouncedCallback(
  (content: string) => saveToServer(content),
  1000,
  { maxWait: 5000 }
);

// 동작:
// 계속 타이핑 → 일반 타이머 계속 리셋
// 5초 경과 → 강제 저장! ⚡
// 타이핑 멈춤 → 1초 후 저장 ✅
```

### 4. 스크롤 트래킹 (leading + trailing)

```tsx
const trackScroll = useDebouncedCallback(() => analytics.track('scroll'), 200, {
  leading: true,
  trailing: true,
});

// 동작:
// 스크롤 시작 → 즉시 추적 ✅ (leading)
// 계속 스크롤 → 대기...
// 스크롤 멈춤 → 200ms 후 추적 ✅ (trailing)
```

---

## API

### Parameters

```typescript
useDebouncedCallback<T>(
  callback: T,
  delay: number,
  options?: DebouncedCallbackOptions
): T
```

#### `callback`

- **타입**: `(...args: any[]) => any`
- **설명**: 디바운스할 콜백 함수

#### `delay`

- **타입**: `number`
- **설명**: 디바운스 지연 시간 (밀리초)

#### `options`

- **타입**: `DebouncedCallbackOptions`
- **설명**: 디바운스 옵션 (선택)

---

## Options

### `leading`

첫 호출 시 즉시 실행 여부

- **타입**: `boolean`
- **기본값**: `false`

```tsx
// leading: true → 첫 호출 즉시 실행
const debounced = useDebouncedCallback(fn, 1000, {
  leading: true,
  trailing: false,
});

// 사용 사례: 버튼 연타 방지, 폼 제출
```

---

### `trailing`

마지막 호출 후 지연 시간 뒤 실행 여부

- **타입**: `boolean`
- **기본값**: `true`

```tsx
// trailing: true (기본) → 마지막 호출 후 실행
const debounced = useDebouncedCallback(fn, 300);

// 사용 사례: 검색 자동완성, 입력 검증
```

---

### `maxWait`

최대 대기 시간 (밀리초)

이 시간이 지나면 강제로 실행됩니다.

- **타입**: `number | undefined`
- **기본값**: `undefined`

```tsx
// maxWait: 5000 → 최대 5초마다 강제 실행
const debounced = useDebouncedCallback(save, 1000, { maxWait: 5000 });

// 사용 사례: 자동 저장, 주기적 동기화
```

---

## 옵션 조합

### 1. 기본 (Trailing만)

```tsx
useDebouncedCallback(fn, 300);
// = { leading: false, trailing: true }

// 입력 멈춘 후 300ms 후 실행
```

### 2. Leading만

```tsx
useDebouncedCallback(fn, 1000, {
  leading: true,
  trailing: false,
});

// 첫 호출만 즉시 실행, 이후 1초간 무시
```

### 3. Leading + Trailing

```tsx
useDebouncedCallback(fn, 200, {
  leading: true,
  trailing: true,
});

// 시작 시 즉시 실행 + 끝날 때도 실행
```

### 4. Trailing + MaxWait

```tsx
useDebouncedCallback(fn, 1000, {
  trailing: true,
  maxWait: 5000,
});

// 일반: 1초 대기, 강제: 5초마다 실행
```

---

## TypeScript

모든 타입이 자동으로 추론됩니다.

```tsx
// ✅ 타입 추론
const debouncedSearch = useDebouncedCallback((query: string, limit: number) => {
  fetch(`/api?q=${query}&limit=${limit}`);
}, 300);

debouncedSearch('hello', 10); // ✅ 타입 체크
debouncedSearch('hello'); // ❌ 에러: limit 필요
debouncedSearch(123, 10); // ❌ 에러: query는 string
```

---

## 실무 패턴

### 검색 자동완성

```tsx
function SearchBar() {
  const [results, setResults] = useState([]);

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    const data = await fetch(`/api/search?q=${query}`);
    setResults(data);
  }, 300);

  return <input onChange={e => debouncedSearch(e.target.value)} />;
}
```

### 폼 제출 (연타 방지)

```tsx
function PaymentForm() {
  const handleSubmit = useDebouncedCallback(
    async formData => {
      await submitPayment(formData);
    },
    2000,
    { leading: true, trailing: false }
  );

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmit(new FormData(e.target));
      }}
    >
      <button type="submit">결제하기</button>
    </form>
  );
}
```

### 자동 저장

```tsx
function Editor() {
  const [content, setContent] = useState('');

  const autoSave = useDebouncedCallback(
    (text: string) => {
      saveToServer(text);
    },
    1000,
    { maxWait: 5000 } // 최대 5초마다 강제 저장
  );

  return (
    <textarea
      value={content}
      onChange={e => {
        setContent(e.target.value);
        autoSave(e.target.value);
      }}
    />
  );
}
```

### 윈도우 리사이즈

```tsx
function ResponsiveComponent() {
  const handleResize = useDebouncedCallback(
    () => {
      console.log('Window resized:', window.innerWidth);
    },
    200,
    { leading: true, trailing: true }
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return <div>...</div>;
}
```

---

## 성능

- **번들 크기**: ~1.2 KB (minified)
- **의존성**: React만 필요
- **메모리**: 타이머 자동 정리 (메모리 누수 방지)

---

## 관련 훅

- [`useDebounce`](../useDebounce) - 값 디바운싱 (더 간단)
- [`useThrottle`](../useThrottle) - 쓰로틀링 (개발 예정)

---

## 참고

- [lodash.debounce](https://lodash.com/docs/#debounce)
- [MDN: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)

---

## 라이선스

MIT © [rak517](https://github.com/rak517)
