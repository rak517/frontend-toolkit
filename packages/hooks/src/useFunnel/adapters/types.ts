import type { FunnelState } from '../core/types';

/**
 * 퍼널 어댑터 인터페이스
 *
 * 상태 저장 방식을 추상화하여 다양한 환경에서 사용 가능하도록 함
 * - memory: 메모리에만 저장 (기본값)
 * - browser: Browser History API 사용
 * - storage: SessionStorage/LocalStorage 사용
 * - custom: 사용자 정의 (Next.js, React Router 등)
 */
export interface FunnelAdapter<
  TStep extends string,
  TContext extends Record<string, unknown>,
> {
  /**
   * 현재 상태 읽기
   */
  getState: (this: void) => FunnelState<TStep, TContext>;

  /**
   * 새 스텝으로 이동 (히스토리에 추가)
   */
  push: (this: void, step: TStep, context?: Partial<TContext>) => void;

  /**
   * 현재 스텝 교체 (히스토리 유지)
   */
  replace: (this: void, step: TStep, context?: Partial<TContext>) => void;

  /**
   * 이전 스텝으로 이동
   */
  back: (this: void) => void;

  /**
   * 뒤로가기 가능 여부
   */
  canGoBack: (this: void) => boolean;

  /**
   * 상태 변경 구독
   * @returns 구독 해제 함수
   */
  subscribe: (this: void, listener: () => void) => () => void;
}

/**
 * 어댑터 생성 함수 타입
 */
export type CreateAdapter<TOptions = void> = <
  TStep extends string,
  TContext extends Record<string, unknown>,
>(
  initialState: FunnelState<TStep, TContext>,
  options?: TOptions
) => FunnelAdapter<TStep, TContext>;

/**
 * Memory 어댑터 옵션 (현재는 없음, 확장성을 위해 정의)
 */
export interface MemoryAdapterOptions {
  /** 히스토리 최대 크기 (기본값: 50) */
  maxHistorySize?: number;
}

/**
 * Browser 어댑터 옵션
 */
export interface BrowserAdapterOptions {
  /** URL 쿼리 파라미터 키 (기본값: 'step') */
  queryKey?: string;
  /** 컨텍스트를 history.state에 저장할지 여부 (기본값: true) */
  persistContext?: boolean;
}

/**
 * Storage 어댑터 옵션
 */
export interface StorageAdapterOptions {
  /** 스토리지 키 */
  storageKey: string;
  /** 스토리지 타입 (기본값: 'session') */
  storageType?: 'session' | 'local';
}
