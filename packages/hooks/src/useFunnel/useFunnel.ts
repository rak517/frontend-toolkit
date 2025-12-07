import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type {
  FunnelHistory,
  FunnelState,
  UseFunnelOptions,
  UseFunnelReturn,
} from './core/types';
import { createFunnelComponent, createStepComponent } from './core/components';
import { createMemoryAdapter } from './adapters/memory';
import type { FunnelAdapter } from './adapters/types';

/**
 * 어댑터를 포함한 useFunnel 옵션
 */
export interface UseFunnelOptionsWithAdapter<
  TStep extends string,
  TContext extends object,
> extends UseFunnelOptions<TStep, TContext> {
  /** 상태 관리 어댑터 (기본값: memory) */
  adapter?: (
    initialState: FunnelState<TStep, TContext>
  ) => FunnelAdapter<TStep, TContext>;
}

/**
 * 단계별 UI 흐름(퍼널)을 관리하는 Hook
 *
 * 회원가입, 결제, 온보딩 등 여러 단계를 거치는 UI를
 * 선언적으로 구현할 수 있습니다.
 *
 * @param steps - 퍼널의 스텝 이름 배열 (as const 권장)
 * @param options - 초기 스텝, 컨텍스트, 어댑터 설정
 * @returns Funnel 컴포넌트와 상태 관리 함수
 *
 * @example
 * 기본 사용법 (memory 어댑터)
 * ```tsx
 * const funnel = useFunnel(['step1', 'step2', 'step3'] as const, {
 *   initialStep: 'step1',
 * });
 *
 * return (
 *   <funnel.Funnel>
 *     <funnel.Step name="step1">
 *       <button onClick={() => funnel.history.push('step2')}>다음</button>
 *     </funnel.Step>
 *     <funnel.Step name="step2">
 *       <button onClick={() => funnel.history.push('step3')}>다음</button>
 *     </funnel.Step>
 *     <funnel.Step name="step3">
 *       <p>완료!</p>
 *     </funnel.Step>
 *   </funnel.Funnel>
 * );
 * ```
 *
 * @example
 * URL 동기화 (browser 어댑터)
 * ```tsx
 * import { createBrowserAdapter } from '@frontend-toolkit-js/hooks';
 *
 * const funnel = useFunnel(['step1', 'step2'] as const, {
 *   initialStep: 'step1',
 *   adapter: (initial) => createBrowserAdapter(initial, { queryKey: 'step' }),
 * });
 *
 * // 브라우저 뒤로가기 자동 지원
 * funnel.history.push('step2');  // URL: ?step=step2
 * funnel.history.back();         // URL: ?step=step1
 * ```
 */
export function useFunnel<
  TStep extends string,
  TContext extends object = Record<string, unknown>,
>(
  steps: readonly TStep[],
  options: UseFunnelOptionsWithAdapter<TStep, TContext>
): UseFunnelReturn<TStep, TContext> {
  const {
    initialStep,
    initialContext = {} as TContext,
    onStepChange,
    adapter: createAdapter,
  } = options;

  // 개발 환경 유효성 검사
  if (process.env.NODE_ENV === 'development') {
    if (steps.length === 0) {
      throw new Error(
        '[useFunnel] steps 배열이 비어있습니다. 최소 1개의 스텝이 필요합니다.'
      );
    }
    if (!steps.includes(initialStep)) {
      throw new Error(
        `[useFunnel] initialStep "${initialStep}"이 steps 배열에 없습니다.\n` +
          `사용 가능한 steps: ${steps.join(', ')}`
      );
    }
  }

  // 어댑터 초기화 (한 번만 생성)
  const adapterRef = useRef<FunnelAdapter<TStep, TContext> | null>(null);

  if (!adapterRef.current) {
    const initialState: FunnelState<TStep, TContext> = {
      step: initialStep,
      context: initialContext,
    };

    adapterRef.current = createAdapter
      ? createAdapter(initialState)
      : createMemoryAdapter(initialState);
  }

  const adapter = adapterRef.current;

  // useSyncExternalStore로 어댑터 상태 구독
  const state = useSyncExternalStore(
    adapter.subscribe,
    adapter.getState,
    adapter.getState // SSR용 getServerSnapshot
  );

  const { step: currentStep, context } = state;

  // 히스토리 객체 생성
  const history: FunnelHistory<TStep, TContext> = useMemo(
    () => ({
      push: (step: TStep, data?: Partial<TContext>) => {
        if (process.env.NODE_ENV === 'development' && !steps.includes(step)) {
          console.warn(
            `[useFunnel] "${step}"은 정의되지 않은 스텝입니다.\n` +
              `사용 가능한 steps: ${steps.join(', ')}`
          );
        }

        adapter.push(step, data);
        const newState = adapter.getState();
        onStepChange?.(newState.step, newState.context);
      },

      replace: (step: TStep, data?: Partial<TContext>) => {
        if (process.env.NODE_ENV === 'development' && !steps.includes(step)) {
          console.warn(
            `[useFunnel] "${step}"은 정의되지 않은 스텝입니다.\n` +
              `사용 가능한 steps: ${steps.join(', ')}`
          );
        }

        adapter.replace(step, data);
        const newState = adapter.getState();
        onStepChange?.(newState.step, newState.context);
      },

      back: () => {
        adapter.back();
        const newState = adapter.getState();
        onStepChange?.(newState.step, newState.context);
      },

      get canGoBack() {
        return adapter.canGoBack();
      },
    }),
    [adapter, steps, onStepChange]
  );

  // 어댑터 초기화 및 cleanup
  useEffect(() => {
    adapter.init?.();
    return () => {
      adapter.cleanup?.();
    };
  }, [adapter]);

  // Step 컴포넌트 (한 번만 생성)
  const Step = useMemo(() => createStepComponent<TStep>(), []);

  // Funnel 컴포넌트 (상태 변경 시 재생성)
  const Funnel = useMemo(
    () => createFunnelComponent<TStep, TContext>(currentStep, context),
    [currentStep, context]
  );

  return {
    currentStep,
    context,
    history,
    Funnel,
    Step,
  };
}
