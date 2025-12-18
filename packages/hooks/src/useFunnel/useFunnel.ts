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
import { parseState, serializeState } from './utils';

/** 기본 쿼리 파라미터 키 */
const DEFAULT_STEP_KEY = 'step';
const DEFAULT_CONTEXT_KEY = 'context';

/**
 * 어댑터를 포함한 useFunnel 옵션
 */
export interface UseFunnelOptionsWithAdapter<
  TStep extends string,
  TContext extends object,
> extends UseFunnelOptions<TStep, TContext> {
  /** 상태 관리 어댑터 (기본값: memory) */
  adapter?: FunnelAdapter;
  /** step 쿼리 파라미터 키 (기본값: 'step') */
  stepKey?: string;
  /** context 쿼리 파라미터 키 (기본값: 'context') */
  contextKey?: string;
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
 * import { useFunnel, createBrowserAdapter } from '@frontend-toolkit-js/hooks';
 *
 * const funnel = useFunnel(['step1', 'step2'] as const, {
 *   initialStep: 'step1',
 *   adapter: createBrowserAdapter(),
 * });
 *
 * // URL: ?step=step2&context={"email":"user@example.com"}
 * funnel.history.push('step2', { email: 'user@example.com' });
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
    adapter: adapterOption,
    stepKey = DEFAULT_STEP_KEY,
    contextKey = DEFAULT_CONTEXT_KEY,
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

  const defaultAdapter = useMemo(() => createMemoryAdapter(), []);
  const adapter = adapterOption ?? defaultAdapter;

  // 히스토리 인덱스 추적 (canGoBack용)
  const historyIndexRef = useRef(0);

  // useSyncExternalStore로 searchParams 직접 구독
  const searchParams = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSearchParams,
    adapter.getServerSnapshot
  );

  // searchParams → state 변환 (useMemo)
  const state = useMemo(
    () =>
      parseState<TStep, TContext>(
        searchParams,
        stepKey,
        contextKey,
        initialStep,
        initialContext
      ),
    [searchParams, stepKey, contextKey, initialStep, initialContext]
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

        const newContext = data ? { ...state.context, ...data } : state.context;

        // 1. 현재 상태를 현재 히스토리 엔트리에 저장 (replace)
        const currentState: FunnelState<TStep, TContext> = {
          step: currentStep,
          context: newContext,
        };
        const currentParams = serializeState(currentState, stepKey, contextKey);
        adapter.replace(currentParams);

        // 2. 새 스텝으로 이동 (push)
        const newState: FunnelState<TStep, TContext> = {
          step,
          context: newContext,
        };
        const newParams = serializeState(newState, stepKey, contextKey);
        adapter.push(newParams);

        historyIndexRef.current++;

        onStepChange?.(step, newContext);
      },

      replace: (step: TStep, data?: Partial<TContext>) => {
        if (process.env.NODE_ENV === 'development' && !steps.includes(step)) {
          console.warn(
            `[useFunnel] "${step}"은 정의되지 않은 스텝입니다.\n` +
              `사용 가능한 steps: ${steps.join(', ')}`
          );
        }

        const newContext = data ? { ...state.context, ...data } : state.context;

        const newState: FunnelState<TStep, TContext> = {
          step,
          context: newContext,
        };
        const params = serializeState(newState, stepKey, contextKey);

        adapter.replace(params);

        onStepChange?.(step, newContext);
      },

      back: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
          historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
        }
      },

      get canGoBack() {
        return historyIndexRef.current > 0;
      },
    }),
    [adapter, steps, stepKey, contextKey, state, onStepChange]
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
