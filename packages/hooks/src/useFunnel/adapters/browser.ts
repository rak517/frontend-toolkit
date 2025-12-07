import type { FunnelState } from '../core/types';
import type { BrowserAdapterOptions, FunnelAdapter } from './types';

const DEFAULT_QUERY_KEY = 'step';

interface HistoryState<TContext> {
  funnelContext?: TContext;
  funnelHistoryIndex?: number;
}

/**
 * Browser History 어댑터 생성
 *
 * Browser History API를 사용하여 URL과 상태를 동기화
 * 브라우저 뒤로가기/앞으로가기 지원
 *
 * @example
 * ```tsx
 * const funnel = useFunnel(STEPS, {
 *   initialStep: 'step1',
 *   adapter: createBrowserAdapter({ queryKey: 'step' }),
 * });
 * ```
 */
export function createBrowserAdapter<
  TStep extends string,
  TContext extends Record<string, unknown>,
>(
  initialState: FunnelState<TStep, TContext>,
  options: BrowserAdapterOptions = {}
): FunnelAdapter<TStep, TContext> {
  const { queryKey = DEFAULT_QUERY_KEY, persistContext = true } = options;

  // SSR 환경 체크
  const isBrowser = typeof window !== 'undefined';

  // 내부 히스토리 인덱스 (canGoBack 판단용)
  let historyIndex = 0;

  // 구독자 목록
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  /**
   * URL에서 현재 스텝 읽기
   */
  const getStepFromUrl = (): TStep | null => {
    if (!isBrowser) return null;

    const params = new URLSearchParams(window.location.search);
    return params.get(queryKey) as TStep | null;
  };

  /**
   * history.state에서 컨텍스트 읽기
   */
  const getContextFromState = (): TContext | null => {
    if (!isBrowser) return null;

    const state = window.history.state as HistoryState<TContext> | null;
    return state?.funnelContext ?? null;
  };

  /**
   * URL 쿼리 파라미터 업데이트
   */
  const buildUrl = (step: TStep): string => {
    const url = new URL(window.location.href);
    url.searchParams.set(queryKey, step);
    return url.toString();
  };

  /**
   * history.state 생성
   */
  const buildState = (context: TContext, index: number): HistoryState<TContext> => {
    return persistContext
      ? { funnelContext: context, funnelHistoryIndex: index }
      : { funnelHistoryIndex: index };
  };

  // 초기화: URL에 스텝이 없으면 초기 스텝으로 설정
  if (isBrowser) {
    const urlStep = getStepFromUrl();
    const state = window.history.state as HistoryState<TContext> | null;

    if (!urlStep) {
      // URL에 스텝이 없으면 초기 상태로 replace
      window.history.replaceState(
        buildState(initialState.context, 0),
        '',
        buildUrl(initialState.step)
      );
    } else if (state?.funnelHistoryIndex !== undefined) {
      // 기존 히스토리 인덱스 복원 (새로고침 시)
      historyIndex = state.funnelHistoryIndex;
    }

    // popstate 이벤트 리스너 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', event => {
      const state = event.state as HistoryState<TContext> | null;
      if (state?.funnelHistoryIndex !== undefined) {
        historyIndex = state.funnelHistoryIndex;
      }
      notify();
    });
  }

  const getState = (): FunnelState<TStep, TContext> => {
    if (!isBrowser) {
      return initialState;
    }

    const step = getStepFromUrl() ?? initialState.step;
    const context = getContextFromState() ?? initialState.context;

    return { step, context };
  };

  const push = (step: TStep, context?: Partial<TContext>): void => {
    if (!isBrowser) return;

    const current = getState();
    const newContext = context
      ? { ...current.context, ...context }
      : current.context;

    historyIndex++;

    window.history.pushState(
      buildState(newContext, historyIndex),
      '',
      buildUrl(step)
    );

    notify();
  };

  const replace = (step: TStep, context?: Partial<TContext>): void => {
    if (!isBrowser) return;

    const current = getState();
    const newContext = context
      ? { ...current.context, ...context }
      : current.context;

    window.history.replaceState(
      buildState(newContext, historyIndex),
      '',
      buildUrl(step)
    );

    notify();
  };

  const back = (): void => {
    if (!isBrowser) return;

    if (historyIndex > 0) {
      window.history.back();
      // historyIndex는 popstate 이벤트에서 업데이트됨
    }
  };

  const canGoBack = (): boolean => {
    return historyIndex > 0;
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    push,
    replace,
    back,
    canGoBack,
    subscribe,
  };
}
