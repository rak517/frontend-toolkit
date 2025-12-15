import type { BrowserAdapterOptions, QueryParamsAdapter } from './types';

/**
 * Browser History 어댑터 생성
 *
 * Browser History API를 사용하여 URL 쿼리 파라미터를 관리
 * - window.location.search로 현재 쿼리 읽기
 * - history.pushState/replaceState로 URL 업데이트
 * - popstate 이벤트로 뒤로가기/앞으로가기 감지
 *
 * @example
 * ```tsx
 * const { page, search, setParams } = useQueryParams({
 *   page: parseAsInteger.withDefault(1),
 *   search: parseAsString,
 * }, {
 *   adapter: createBrowserAdapter(),
 * });
 * ```
 */
export function createBrowserAdapter(
  options: BrowserAdapterOptions = {}
): QueryParamsAdapter {
  const { scroll = false } = options;

  // SSR 환경 체크
  const isBrowser = typeof window !== 'undefined';

  // 캐시된 URLSearchParams (useSyncExternalStore 최적화)
  // getSearchParams가 호출될 때마다 새 객체를 반환하면
  // useSyncExternalStore가 무한 루프에 빠질 수 있음
  let cachedSearch = isBrowser ? window.location.search : '';
  let cachedParams = new URLSearchParams(cachedSearch);

  // 구독자 목록
  const listeners = new Set<() => void>();

  /**
   * 모든 구독자에게 변경 알림
   */
  const notify = () => {
    // 캐시 업데이트
    if (isBrowser) {
      cachedSearch = window.location.search;
      cachedParams = new URLSearchParams(cachedSearch);
    }
    listeners.forEach(listener => listener());
  };

  /**
   * popstate 이벤트 핸들러
   * 브라우저 뒤로가기/앞으로가기 시 호출됨
   */
  const handlePopState = () => {
    notify();
  };

  /**
   * 현재 쿼리 파라미터 반환
   * 캐시된 값을 반환하여 useSyncExternalStore 최적화
   */
  const getSearchParams = (): URLSearchParams => {
    // 캐시가 현재 URL과 다르면 업데이트
    if (isBrowser && window.location.search !== cachedSearch) {
      cachedSearch = window.location.search;
      cachedParams = new URLSearchParams(cachedSearch);
    }
    return cachedParams;
  };

  /**
   * URL 생성 헬퍼
   */
  const buildUrl = (params: URLSearchParams): string => {
    const search = params.toString();
    const pathname = isBrowser ? window.location.pathname : '/';
    return search ? `${pathname}?${search}` : pathname;
  };

  /**
   * 쿼리 파라미터 업데이트 (히스토리 추가)
   * 뒤로가기로 이전 상태로 돌아갈 수 있음
   */
  const push = (params: URLSearchParams): void => {
    if (!isBrowser) return;

    const url = buildUrl(params);
    window.history.pushState(null, '', url);

    // 스크롤 처리
    if (scroll) {
      window.scrollTo(0, 0);
    }

    // pushState는 popstate 이벤트를 발생시키지 않으므로
    // 수동으로 구독자들에게 알림
    notify();
  };

  /**
   * 쿼리 파라미터 업데이트 (히스토리 교체)
   * 뒤로가기 히스토리에 쌓이지 않음
   */
  const replace = (params: URLSearchParams): void => {
    if (!isBrowser) return;

    const url = buildUrl(params);
    window.history.replaceState(null, '', url);

    if (scroll) {
      window.scrollTo(0, 0);
    }

    notify();
  };

  /**
   * 상태 변경 구독
   */
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  /**
   * 어댑터 초기화
   * popstate 이벤트 리스너 등록
   */
  const init = (): void => {
    if (!isBrowser) return;
    window.addEventListener('popstate', handlePopState);
  };

  /**
   * 어댑터 정리
   * 이벤트 리스너 해제 및 구독자 목록 초기화
   */
  const cleanup = (): void => {
    if (isBrowser) {
      window.removeEventListener('popstate', handlePopState);
    }
    listeners.clear();
  };

  return {
    getSearchParams,
    push,
    replace,
    subscribe,
    init,
    cleanup,
  };
}
