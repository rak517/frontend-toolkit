import { useCallback, useMemo, useState } from 'react';
import type { UseFunnelOptions, UseFunnelReturn } from './types';
import { createFunnelComponent, createStepComponent } from './components';

/**
 * 단계별 UI 흐름(퍼널)을 관리하는 Hook
 *
 * 회원가입, 결제, 온보딩 등 여러 단계를 거치는 UI를
 * 선언적으로 구현할 수 있습니다.
 *
 * @param steps - 퍼널의 스텝 이름 배열 (as const 권장)
 * @param options - 초기 스텝, 컨텍스트, 콜백 설정
 * @returns Funnel 컴포넌트와 상태 관리 함수
 *
 * * @example
 * 기본 사용법
 * ```tsx
 * const funnel = useFunnel(['step1', 'step2', 'step3'] as const, {
 *   initialStep: 'step1',
 * });
 *
 * return (
 *   <funnel.Funnel>
 *     <funnel.Step name="step1">
 *       <button onClick={() => funnel.setStep('step2')}>다음</button>
 *     </funnel.Step>
 *     <funnel.Step name="step2">
 *       <button onClick={() => funnel.setStep('step3')}>다음</button>
 *     </funnel.Step>
 *     <funnel.Step name="step3">
 *       <p>완료!</p>
 *     </funnel.Step>
 *   </funnel.Funnel>
 * );
 * ```
 **/
export function useFunnel<
  TStep extends string,
  TContext extends Record<string, unknown> = Record<string, unknown>,
>(
  steps: readonly TStep[],
  options: UseFunnelOptions<TStep, TContext>
): UseFunnelReturn<TStep, TContext> {
  const {
    initialStep,
    initialContext = {} as TContext,
    onStepChange,
  } = options;

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

  const [currentStep, setCurrentStep] = useState<TStep>(initialStep);
  const [context, setContext] = useState<TContext>(initialContext);

  const setStep = useCallback(
    (step: TStep, data?: Partial<TContext>) => {
      if (process.env.NODE_ENV === 'development' && !steps.includes(step)) {
        console.warn(
          `[useFunnel] "${step}"은 정의되지 않은 스텝입니다.\n` +
            `사용 가능한 steps: ${steps.join(', ')}`
        );
      }

      setCurrentStep(step);

      if (data) {
        setContext(prev => {
          const next = { ...prev, ...data };
          return next;
        });
      } else {
        onStepChange?.(step, context);
      }
    },
    [steps, context, onStepChange]
  );

  const Step = useCallback(createStepComponent<TStep>(), []);

  const Funnel = useMemo(
    () => createFunnelComponent<TStep>(currentStep),
    [currentStep]
  );

  return {
    currentStep,
    context,
    setStep,
    Funnel,
    Step,
  };
}
