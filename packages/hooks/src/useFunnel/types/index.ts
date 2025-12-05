import type { ReactElement, ReactNode } from 'react';

/**
 * Funnel Step 컴포넌트 Props
 */
export interface FunnelStepProps<TStep extends string> {
  name: TStep;
  children: ReactNode;
}

/**
 * Funnel 컨테이너 Props
 */
export interface FunnelProps<TStep extends string> {
  children: ReactElement<FunnelStepProps<TStep>>[];
}

/**
 * useFunnel 옵션
 */
export interface UseFunnelOptions<
  TStep extends string,
  TContext extends Record<TStep, unknown>,
> {
  initialStep: TStep;
  initialContext: TContext;
  onStepChange: (step: TStep, context: TContext) => void;
}

/**
 * useFunnel 반환 타입
 */
export interface UseFunnelReturn<
  TStep extends string,
  TContext extends Record<TStep, unknown>,
> {
  currentStep: TStep;
  context: TContext;
  setStep: (step: TStep, data?: Partial<TContext>) => void;
  Funnel: (props: FunnelProps<TStep>) => ReactElement | null;
  Step: (props: FunnelStepProps<TStep>) => ReactElement;
}

/**
 * FunnelContext 값 타입
 */
export interface FunnelContextValue {
  currentStep: string;
}
