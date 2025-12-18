import type { BrowserAdapterOptions, FunnelAdapter } from './types';

const EMPTY_PARAMS = new URLSearchParams();

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
 *   adapter: createBrowserAdapter(),
 * });
 * ```
 */
export function createBrowserAdapter(
  options: BrowserAdapterOptions = {}
): FunnelAdapter {
  const { scroll = false } = options;

  // SSR 환경 체크
  const isBrowser = typeof window !== 'undefined';

  // 캐시된 상태 (useSyncExternalStore 무한 루프 방지)
  let cachedParams: URLSearchParams = isBrowser
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  // 구독자 목록
  const listeners = new Set<() => void>();

  const notify = () => {
    cachedParams = new URLSearchParams(window.location.search);
    listeners.forEach(listener => listener());
  };

  const getSearchParams = (): URLSearchParams => {
    return cachedParams;
  };

  const getServerSnapshot = (): URLSearchParams => {
    return EMPTY_PARAMS;
  };

  const push = (params: URLSearchParams): void => {
    if (!isBrowser) return;

    const url = new URL(window.location.href);
    url.search = params.toString();

    window.history.pushState(null, '', url.toString());

    if (scroll) {
      window.scrollTo(0, 0);
    }

    notify();
  };

  const replace = (params: URLSearchParams): void => {
    if (!isBrowser) return;

    const url = new URL(window.location.href);
    url.search = params.toString();

    window.history.replaceState(null, '', url.toString());

    if (scroll) {
      window.scrollTo(0, 0);
    }

    notify();
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const handlePopState = () => {
    notify();
  };

  const init = (): void => {
    if (!isBrowser) return;
    window.addEventListener('popstate', handlePopState);
  };

  const cleanup = (): void => {
    if (!isBrowser) return;
    window.removeEventListener('popstate', handlePopState);
    listeners.clear();
  };

  return {
    getSearchParams,
    getServerSnapshot,
    push,
    replace,
    subscribe,
    init,
    cleanup,
  };
}
