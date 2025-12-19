import { useRouter } from 'next/router';
import type { FunnelAdapter } from './types';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Next.js Pages Router 어댑터 옵션
 */
export interface NextPagesAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 초기화 여부
   * @default false
   */
  scroll?: boolean;
  /**
   * Shallow routing 사용 여부
   * @default true
   */
  shallow?: boolean;
}

/**
 * Next.js Pages Router용 어댑터 훅
 */
export function useNextPagesAdapter(
  options: NextPagesAdapterOptions = {}
): FunnelAdapter {
  const { scroll = false, shallow = true } = options;

  const router = useRouter();

  const listenersRef = useRef(new Set<() => void>());
  const cachedRef = useRef(new URLSearchParams());

  // router.isReady 후 초기 파라미터 설정
  useEffect(() => {
    if (router.isReady) {
      cachedRef.current = new URLSearchParams(
        router.asPath.split('?')[1] || ''
      );
    }
  }, [router.isReady, router.asPath]);

  const notify = useCallback(() => {
    listenersRef.current.forEach(listener => listener());
  }, []);

  const buildUrl = useCallback(
    (params: URLSearchParams): string => {
      const search = params.toString();
      const pathname = router.pathname;
      return search ? `${pathname}?${search}` : pathname;
    },
    [router.pathname]
  );

  const getSearchParams = useCallback((): URLSearchParams => {
    return cachedRef.current;
  }, []);

  const getServerSnapshot = useCallback((): URLSearchParams => {
    return new URLSearchParams();
  }, []);

  const push = useCallback(
    async (params: URLSearchParams): Promise<void> => {
      cachedRef.current = new URLSearchParams(params);
      await router.push(buildUrl(params), undefined, { scroll, shallow });
      notify();
    },
    [router, buildUrl, scroll, shallow, notify]
  );

  const replace = useCallback(
    async (params: URLSearchParams): Promise<void> => {
      cachedRef.current = new URLSearchParams(params);
      await router.replace(buildUrl(params), undefined, { scroll, shallow });
      notify();
    },
    [router, buildUrl, scroll, shallow, notify]
  );

  const subscribe = useCallback((listener: () => void): (() => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  // routeChangeComplete 이벤트로 URL 변경 감지
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      cachedRef.current = new URLSearchParams(url.split('?')[1] || '');
      notify();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, notify]);

  return {
    getSearchParams,
    getServerSnapshot,
    push,
    replace,
    subscribe,
  };
}
