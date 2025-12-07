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
  TContext extends object,
>(
  initialState: FunnelState<TStep, TContext>,
  options: BrowserAdapterOptions = {}
): FunnelAdapter<TStep, TContext> {
  const { queryKey = DEFAULT_QUERY_KEY, persistContext = true } = options;

  // SSR 환경 체크
  const isBrowser = typeof window !== 'undefined';

  // 내부 히스토리 인덱스 (canGoBack 판단용)
  let historyIndex = 0;

  // 캐시된 상태 (useSyncExternalStore 무한 루프 방지)
  let cachedState: FunnelState<TStep, TContext> = initialState;

  // 구독자 목록
  const listeners = new Set<() => void>();

  const notify = () => {
    // 상태 캐시 업데이트
    cachedState = readStateFromBrowser();
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

  /**
   * 브라우저에서 현재 상태 읽기 (내부용)
   */
  const readStateFromBrowser = (): FunnelState<TStep, TContext> => {
    if (!isBrowser) {
      return initialState;
    }

    const step = getStepFromUrl() ?? initialState.step;
    const context = getContextFromState() ?? initialState.context;

    return { step, context };
  };

  // popstate 이벤트 핸들러
  const handlePopState = (event: PopStateEvent) => {
    const state = event.state as HistoryState<TContext> | null;
    if (state?.funnelHistoryIndex !== undefined) {
      historyIndex = state.funnelHistoryIndex;
    } else {
      // funnelHistoryIndex가 없는 경우 (외부 페이지에서 돌아온 경우 등)
      // 현재 URL에 queryKey가 있으면 0으로 리셋
      const urlStep = getStepFromUrl();
      if (urlStep) {
        historyIndex = 0;
      }
    }
    notify();
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
      cachedState = initialState;
    } else {
      // URL에서 상태 복원
      if (state?.funnelHistoryIndex !== undefined) {
        historyIndex = state.funnelHistoryIndex;
      }
      cachedState = readStateFromBrowser();
    }
  }

  /**
   * 어댑터 초기화 (useEffect에서 호출)
   * popstate 이벤트 리스너 등록
   */
  const init = (): void => {
    if (!isBrowser) return;
    window.addEventListener('popstate', handlePopState);
  };

  /**
   * 현재 상태 반환 (캐시된 값 반환)
   */
  const getState = (): FunnelState<TStep, TContext> => {
    return cachedState;
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

    // historyIndex와 관계없이 window.history.back() 호출
    // 실제 브라우저 히스토리가 있는지는 브라우저가 판단
    window.history.back();
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

  const cleanup = (): void => {
    if (isBrowser) {
      window.removeEventListener('popstate', handlePopState);
    }
    listeners.clear();
  };

  return {
    getState,
    push,
    replace,
    back,
    canGoBack,
    subscribe,
    init,
    cleanup,
  };
}
