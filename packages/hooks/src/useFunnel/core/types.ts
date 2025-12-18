import type { ReactElement, ReactNode } from 'react';

/**
 * 퍼널 컨텍스트 맵 타입
 * 각 스텝별로 저장할 데이터 타입을 정의
 */
export type FunnelContextMap<TStep extends string> = {
  [K in TStep]?: Record<string, unknown>;
};

/**
 * 컨텍스트 맵을 평탄화한 타입
 * 모든 스텝의 컨텍스트를 합친 타입
 */
export type FlattenContext<TContextMap extends FunnelContextMap<string>> =
  UnionToIntersection<NonNullable<TContextMap[keyof TContextMap]>>;

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * 퍼널 상태
 */
export interface FunnelState<TStep extends string, TContext extends object> {
  step: TStep;
  context: TContext;
}

/**
 * 히스토리 관리 인터페이스
 */
export interface FunnelHistory<TStep extends string, TContext extends object> {
  /** 새 스텝으로 이동 (히스토리에 추가) */
  push(step: TStep, context?: Partial<TContext>): void;
  /** 현재 스텝 교체 (히스토리 유지) */
  replace(step: TStep, context?: Partial<TContext>): void;
  /** 이전 스텝으로 이동 */
  back(): void;
  /** 뒤로가기 가능 여부 */
  canGoBack: boolean;
}

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
  TContext extends object,
> {
  /** 초기 스텝 */
  initialStep: TStep;
  /** 초기 컨텍스트 */
  initialContext?: TContext;
  /** 스텝 변경 콜백 */
  onStepChange?: (step: TStep, context: TContext) => void;
}

/**
 * useFunnel 반환 타입
 */
export interface UseFunnelReturn<
  TStep extends string,
  TContext extends object,
> {
  /** 현재 스텝 */
  currentStep: TStep;
  /** 누적된 컨텍스트 */
  context: TContext;
  /** 히스토리 관리 객체 */
  history: FunnelHistory<TStep, TContext>;
  /** Funnel 컨테이너 컴포넌트 */
  Funnel: (props: FunnelProps<TStep>) => ReactElement | null;
  /** Step 컴포넌트 */
  Step: (props: FunnelStepProps<TStep>) => ReactElement;
}

/**
 * FunnelContext 값 타입
 */
export interface FunnelContextValue<
  TStep extends string = string,
  TContext extends object = Record<string, unknown>,
> {
  currentStep: TStep;
  context: TContext;
}
