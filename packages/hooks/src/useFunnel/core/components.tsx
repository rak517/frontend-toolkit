import type { ReactElement } from 'react';
import type { FunnelProps, FunnelStepProps, FunnelContextValue } from './types';
import { FunnelContext } from './FunnelContext';

/**
 * Step 컴포넌트 생성 팩토리
 * useFunnel 내부에서 사용
 */
export function createStepComponent<TStep extends string>() {
  return function Step({ children }: FunnelStepProps<TStep>) {
    return <>{children}</>;
  };
}

/**
 * Funnel 컴포넌트 생성 팩토리
 * useFunnel 내부에서 사용
 */
export function createFunnelComponent<
  TStep extends string,
  TContext extends Record<string, unknown>,
>(currentStep: TStep, context: TContext) {
  return function Funnel({
    children,
  }: FunnelProps<TStep>): ReactElement | null {
    const targetStep = children.find(child => child.props.name === currentStep);

    if (!targetStep) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[useFunnel] 현재 스텝 "${currentStep}"에 해당하는 Step을 찾을 수 없습니다.`
        );
      }
      return null;
    }

    const contextValue: FunnelContextValue<TStep, TContext> = {
      currentStep,
      context,
    };

    return (
      <FunnelContext.Provider value={contextValue}>
        {targetStep}
      </FunnelContext.Provider>
    );
  };
}
