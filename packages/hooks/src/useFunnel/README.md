# useFunnel

단계별 UI 흐름(퍼널)을 선언적으로 관리하는 Hook입니다.

## 언제 사용하나요?

- 📝 회원가입 플로우
- 💳 결제 프로세스
- 🎯 온보딩 튜토리얼
- 📋 설문조사, 폼 위저드

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
        <button onClick={() => funnel.setStep('step2')}>다음</button>
      </funnel.Step>
      <funnel.Step name="step2">
        <button onClick={() => funnel.setStep('step3')}>다음</button>
      </funnel.Step>
      <funnel.Step name="step3">
        <p>완료!</p>
      </funnel.Step>
    </funnel.Funnel>
  );
}
```

## 컨텍스트로 데이터 전달

스텝 간 데이터를 전달하려면 `setStep`의 두 번째 인자를 사용합니다.

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
funnel.setStep('password', { email: 'user@example.com' });

// 이전 데이터 접근
console.log(funnel.context.email); // 'user@example.com'
```

## API

### `useFunnel(steps, options)`

#### Parameters

| 이름                     | 타입                      | 설명                             |
| ------------------------ | ------------------------- | -------------------------------- |
| `steps`                  | `readonly string[]`       | 스텝 이름 배열 (`as const` 권장) |
| `options.initialStep`    | `string`                  | 초기 스텝 (필수)                 |
| `options.initialContext` | `object`                  | 초기 컨텍스트 데이터             |
| `options.onStepChange`   | `(step, context) => void` | 스텝 변경 콜백                   |

#### Returns

| 이름          | 타입                    | 설명                   |
| ------------- | ----------------------- | ---------------------- |
| `currentStep` | `string`                | 현재 스텝              |
| `context`     | `object`                | 누적된 컨텍스트 데이터 |
| `setStep`     | `(step, data?) => void` | 스텝 이동 함수         |
| `Funnel`      | `Component`             | 퍼널 컨테이너          |
| `Step`        | `Component`             | 스텝 컴포넌트          |

### `useFunnelStep()`

Funnel 내부에서 현재 스텝 정보를 가져옵니다.

```tsx
function MyStepContent() {
  const { currentStep } = useFunnelStep();
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

### 뒤로가기 구현

```tsx
<funnel.Step name="step2">
  <button onClick={() => funnel.setStep('step1')}>이전</button>
  <button onClick={() => funnel.setStep('step3')}>다음</button>
</funnel.Step>
```

### 조건부 스텝

```tsx
<funnel.Step name="payment">
  {needsVerification ? (
    <button onClick={() => funnel.setStep('verify')}>본인인증</button>
  ) : (
    <button onClick={() => funnel.setStep('complete')}>결제하기</button>
  )}
</funnel.Step>
```

## 성능

- **번들 크기**: ~0.8 KB (minified)
- **의존성**: React만 필요
- **리렌더링**: 스텝 변경 시에만 발생

## 파일 구조

```
useFunnel/
├── index.ts        # public exports
├── useFunnel.ts    # 메인 훅
├── components.tsx  # Funnel, Step 컴포넌트
├── context.ts      # FunnelContext, useFunnelStep
├── types/
│   └── index.ts    # 타입 정의
└── README.md
```

## 다음 버전 예정 (Phase 2)

- [ ] URL 동기화 (쿼리 파라미터)
- [ ] 히스토리 스택 (브라우저 뒤로가기)
- [ ] 스토리지 어댑터 (새로고침 복원)
