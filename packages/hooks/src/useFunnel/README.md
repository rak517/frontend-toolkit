# useFunnel

단계별 UI 흐름(퍼널)을 선언적으로 관리하는 Hook입니다.

## 언제 사용하나요?

- 회원가입 플로우
- 결제 프로세스
- 온보딩 튜토리얼
- 설문조사, 폼 위저드

## 기본 사용법

```tsx
import { useFunnel } from '@frontend-toolkit-js/hooks';

const STEPS = ['step1', 'step2', 'step3'] as const;

function MyFunnel() {
  const funnel = useFunnel(STEPS, {
    initialStep: 'step1',
  });

  return (
    <funnel.Funnel>
      <funnel.Step name="step1">
        <button onClick={() => funnel.history.push('step2')}>다음</button>
      </funnel.Step>
      <funnel.Step name="step2">
        <button onClick={() => funnel.history.back()}>이전</button>
        <button onClick={() => funnel.history.push('step3')}>다음</button>
      </funnel.Step>
      <funnel.Step name="step3">
        <p>완료!</p>
      </funnel.Step>
    </funnel.Funnel>
  );
}
```

## 컨텍스트로 데이터 전달

스텝 간 데이터를 전달하려면 `history.push`의 두 번째 인자를 사용합니다.

```tsx
interface FormContext {
  email?: string;
  password?: string;
}

const funnel = useFunnel<'email' | 'password' | 'done', FormContext>(
  ['email', 'password', 'done'] as const,
  {
    initialStep: 'email',
    initialContext: {},
  }
);

// 스텝 이동 시 데이터 추가
funnel.history.push('password', { email: 'user@example.com' });

// 누적된 데이터 접근
console.log(funnel.context.email); // 'user@example.com'
```

## 어댑터

상태 저장 방식을 어댑터로 선택할 수 있습니다.

### Memory 어댑터 (기본값)

메모리에만 상태를 저장합니다. 새로고침 시 초기화됩니다.

```tsx
const funnel = useFunnel(STEPS, {
  initialStep: 'step1',
  // adapter 미지정 시 memory 어댑터 사용
});
```

### Browser 어댑터

URL 쿼리 파라미터와 동기화합니다. 브라우저 뒤로가기/앞으로가기를 지원합니다.

```tsx
import { useFunnel, createBrowserAdapter } from '@frontend-toolkit-js/hooks';

const funnel = useFunnel(STEPS, {
  initialStep: 'step1',
  adapter: createBrowserAdapter(),
});

// 브라우저 뒤로가기 버튼 자동 지원
funnel.history.push('step2'); // URL: ?step=step2
funnel.history.back(); // URL: ?step=step1
```

### Next.js App Router 어댑터

Next.js 13+ App Router 환경에서 사용합니다.

```tsx
import { useFunnel } from '@frontend-toolkit-js/hooks';
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/next-app';

function MyFunnel() {
  const adapter = useNextAppAdapter();
  const funnel = useFunnel(STEPS, {
    initialStep: 'step1',
    adapter,
  });

  return <funnel.Funnel>...</funnel.Funnel>;
}
```

> **Note**: `useSearchParams`를 사용하므로 `Suspense`로 감싸야 합니다.

### Next.js Pages Router 어댑터

Next.js Pages Router 환경에서 사용합니다.

```tsx
import { useFunnel } from '@frontend-toolkit-js/hooks';
import { useNextPagesAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/next-pages';

function MyFunnel() {
  const adapter = useNextPagesAdapter({ shallow: true });
  const funnel = useFunnel(STEPS, {
    initialStep: 'step1',
    adapter,
  });

  return <funnel.Funnel>...</funnel.Funnel>;
}
```

### React Router 어댑터

React Router v6+ 환경에서 사용합니다.

```tsx
import { useFunnel } from '@frontend-toolkit-js/hooks';
import { useReactRouterAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/react-router';

function MyFunnel() {
  const adapter = useReactRouterAdapter();
  const funnel = useFunnel(STEPS, {
    initialStep: 'step1',
    adapter,
  });

  return <funnel.Funnel>...</funnel.Funnel>;
}
```

## API

### `useFunnel(steps, options)`

#### Parameters

| 이름                     | 타입                                | 설명                             |
| ------------------------ | ----------------------------------- | -------------------------------- |
| `steps`                  | `readonly string[]`                 | 스텝 이름 배열 (`as const` 권장) |
| `options.initialStep`    | `string`                            | 초기 스텝 (필수)                 |
| `options.initialContext` | `object`                            | 초기 컨텍스트 데이터             |
| `options.onStepChange`   | `(step, context) => void`           | 스텝 변경 콜백                   |
| `options.adapter`        | `(initial) => FunnelAdapter`        | 상태 관리 어댑터                 |

#### Returns

| 이름          | 타입            | 설명                   |
| ------------- | --------------- | ---------------------- |
| `currentStep` | `string`        | 현재 스텝              |
| `context`     | `object`        | 누적된 컨텍스트 데이터 |
| `history`     | `FunnelHistory` | 히스토리 관리 객체     |
| `Funnel`      | `Component`     | 퍼널 컨테이너          |
| `Step`        | `Component`     | 스텝 컴포넌트          |

### `history` 객체

| 메서드/속성   | 타입                      | 설명                         |
| ------------- | ------------------------- | ---------------------------- |
| `push`        | `(step, data?) => void`   | 새 스텝으로 이동 (히스토리 추가) |
| `replace`     | `(step, data?) => void`   | 현재 스텝 교체 (히스토리 유지)   |
| `back`        | `() => void`              | 이전 스텝으로 이동           |
| `canGoBack`   | `boolean`                 | 뒤로가기 가능 여부           |

### `useFunnelContext()`

Funnel 내부에서 현재 스텝 정보를 가져옵니다.

```tsx
import { useFunnelContext } from '@frontend-toolkit-js/hooks';

function MyStepContent() {
  const { currentStep, context } = useFunnelContext();
  return <div>현재: {currentStep}</div>;
}
```

## 실무 패턴

### 진행률 표시

```tsx
const steps = ['a', 'b', 'c'] as const;
const funnel = useFunnel(steps, { initialStep: 'a' });

const currentIndex = steps.indexOf(funnel.currentStep);
const progress = ((currentIndex + 1) / steps.length) * 100;

return (
  <div>
    <ProgressBar value={progress} />
    <funnel.Funnel>...</funnel.Funnel>
  </div>
);
```

### 조건부 스텝

```tsx
<funnel.Step name="payment">
  {needsVerification ? (
    <button onClick={() => funnel.history.push('verify')}>본인인증</button>
  ) : (
    <button onClick={() => funnel.history.push('complete')}>결제하기</button>
  )}
</funnel.Step>
```

### 초기화 (처음부터 다시)

```tsx
<button onClick={() => funnel.history.replace('step1', {})}>
  처음부터 다시
</button>
```

## 주의사항

### 어댑터별 요구사항

| 어댑터 | 요구사항 |
|--------|----------|
| Next.js App Router | `Suspense`로 감싸기 필요 |
| Next.js Pages Router | Router 컨텍스트 내에서 사용 |
| React Router | `<BrowserRouter>` 등 Router 컨텍스트 내에서 사용 |

### 브라우저 뒤로가기 시 context 유지

`history.push` 호출 시 내부적으로 replace→push 패턴을 사용합니다.
이를 통해 브라우저 뒤로가기 시에도 이전 스텝의 context가 유지됩니다.

## 파일 구조

```
useFunnel/
├── index.ts              # public exports
├── useFunnel.ts          # 메인 훅
├── utils.ts              # 직렬화/역직렬화 유틸
├── core/
│   ├── types.ts          # 타입 정의
│   ├── components.tsx    # Funnel, Step 컴포넌트 팩토리
│   └── FunnelContext.tsx # Context, useFunnelContext
└── adapters/
    ├── index.ts          # 어댑터 exports
    ├── types.ts          # 어댑터 인터페이스
    ├── memory.ts         # 메모리 어댑터
    ├── browser.ts        # 브라우저 어댑터
    ├── next-app.ts       # Next.js App Router 어댑터
    ├── next-pages.ts     # Next.js Pages Router 어댑터
    └── react-router.ts   # React Router 어댑터
```
