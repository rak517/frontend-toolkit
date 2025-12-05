import { createContext, useContext } from 'react';
import type { FunnelContextValue } from './types';

/**
 * Funnel 내부 컨텍스트
 * Step 컴포넌트가 현재 스텝 정보에 접근할 수 있도록 함
 */
export const FunnelContext = createContext<FunnelContextValue | null>(null);

/**
 * 현재 Funnel의 스텝 정보를 가져오는 Hook
 * Step 컴포넌트 내부에서 사용
 *
 * @returns 현재 스텝 정보
 * @throws Funnel 컴포넌트 외부에서 호출 시 에러
 *
 * @example
 * ```tsx
 * function MyStepContent() {
 *   const { currentStep } = useFunnelStep();
 *   return <div>현재: {currentStep}</div>;
 * }
 * ```
 */
export function useFunnelStep(): FunnelContextValue {
  const context = useContext(FunnelContext);

  if (!context) {
    throw new Error(
      '[useFunnelStep] Funnel 컴포넌트 내부에서만 사용할 수 있습니다.'
    );
  }

  return context;
}
