import { useRef, useCallback } from 'react';
import type { FunnelAdapter } from './types';
import { useSearchParams, usePathname } from 'next/navigation';

/**
 * Next.js App Router 어댑터 옵션
 */
export interface NextAppAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 초기화 여부
   * @default false
   */
  scroll?: boolean;
}

/**
 * Next.js App Router용 어댑터 훅
 *
 * router.push/replace는 비동기라 순서 보장이 안되므로
 * window.history API를 직접 사용하여 동기적으로 처리
 */
export function useNextAppAdapter(
  options: NextAppAdapterOptions = {}
): FunnelAdapter {
  const { scroll = false } = options;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // refs로 렌더 간 상태 유지
  const listenersRef = useRef(new Set<() => void>());
  const cachedRef = useRef(new URLSearchParams(searchParams.toString()));

  // searchParams 변경 시 cache 동기화
  cachedRef.current = new URLSearchParams(searchParams.toString());

  const buildUrl = useCallback(
    (params: URLSearchParams): string => {
      const search = params.toString();
      return search ? `${pathname}?${search}` : pathname;
    },
    [pathname]
  );

  const notify = useCallback(() => {
    listenersRef.current.forEach(listener => listener());
  }, []);

  const getSearchParams = useCallback((): URLSearchParams => {
    return cachedRef.current;
  }, []);

  const getServerSnapshot = useCallback((): URLSearchParams => {
    return cachedRef.current;
  }, []);

  const push = useCallback(
    (params: URLSearchParams): void => {
      if (typeof window === 'undefined') return;

      window.history.pushState(null, '', buildUrl(params));
      cachedRef.current = new URLSearchParams(params);

      if (scroll) window.scrollTo(0, 0);
      notify();
    },
    [buildUrl, scroll, notify]
  );

  const replace = useCallback(
    (params: URLSearchParams): void => {
      if (typeof window === 'undefined') return;

      window.history.replaceState(null, '', buildUrl(params));
      cachedRef.current = new URLSearchParams(params);

      if (scroll) window.scrollTo(0, 0);
      notify();
    },
    [buildUrl, scroll, notify]
  );

  const subscribe = useCallback((listener: () => void): (() => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  return {
    getSearchParams,
    getServerSnapshot,
    push,
    replace,
    subscribe,
  };
}
