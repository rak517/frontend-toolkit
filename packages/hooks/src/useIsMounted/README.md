# useIsMounted

컴포넌트가 마운트되었는지 확인하는 훅

## 사용 사례

### 1. SSR 환경에서 hydration 에러 방지

```tsx
function Clock() {
  const isMounted = useIsMounted();

  // 서버와 클라이언트의 시간이 다르면 hydration 에러 발생
  // isMounted로 클라이언트에서만 렌더링
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return <div>{new Date().toLocaleString()}</div>;
}
```

### 2. 브라우저 전용 API 안전하게 사용

```tsx
function GeolocationComponent() {
  const isMounted = useIsMounted();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (isMounted && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLocation(pos);
      });
    }
  }, [isMounted]);

  return <div>...</div>;
}
```

### 3. localStorage/sessionStorage 접근

```tsx
function UserPreferences() {
  const isMounted = useIsMounted();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (isMounted) {
      const saved = localStorage.getItem('theme');
      if (saved) setTheme(saved);
    }
  }, [isMounted]);

  return <div className={theme}>...</div>;
}
```

## 주의사항

### ❌ 남용하지 마세요

모든 컴포넌트에 `useIsMounted`를 추가하면 불필요한 리렌더링이 발생합니다.

```tsx
// ❌ Bad: 단순 렌더링에는 불필요
function SimpleComponent() {
  const isMounted = useIsMounted();
  return <div>Hello</div>;
}

// ✅ Good: 브라우저 API 사용 시에만
function BrowserAPIComponent() {
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      // 브라우저 API 사용
    }
  }, [isMounted]);
}
```

### 대안: suppressHydrationWarning

간단한 경우 React의 `suppressHydrationWarning`을 사용할 수 있습니다.

```tsx
<div suppressHydrationWarning>{new Date().toLocaleString()}</div>
```

## 성능

- **번들 크기**: ~0.2 KB (minified)
- **리렌더링**: 초기 마운트 시 1회만 발생
- **메모리**: useState(false) 하나만 사용

## 관련 훅

- `useCalendar`: SSR 안전성을 위해 내부적으로 사용
- `useLocalStorage`: (예정) 브라우저 전용 API 사용
