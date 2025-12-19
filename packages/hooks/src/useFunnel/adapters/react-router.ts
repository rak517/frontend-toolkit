import { useSearchParams } from 'react-router-dom';
import type { FunnelAdapter } from './types';

/**
 * React Router v6+ 어댑터 옵션
 */
export interface ReactRouterAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 유지 여부
   * @default false
   */
  preventScrollReset?: boolean;
}

/**
 * React Router v6+ 어댑터 훅
 *
 * react-router-dom의 useSearchParams를 사용하여 URL 쿼리 파라미터를 관리
 * React Router v7에서도 동일하게 동작
 */
export function useReactRouterAdapter(
  options: ReactRouterAdapterOptions = {}
): FunnelAdapter {
  const { preventScrollReset = false } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchParams = (): URLSearchParams => {
    return searchParams;
  };

  const getServerSnapshot = (): URLSearchParams => {
    return searchParams;
  };

  const push = (params: URLSearchParams): void => {
    setSearchParams(params, { preventScrollReset });
  };

  const replace = (params: URLSearchParams): void => {
    setSearchParams(params, { replace: true, preventScrollReset });
  };

  const subscribe = (_listener: () => void): (() => void) => {
    return () => {};
  };

  return {
    getSearchParams,
    getServerSnapshot,
    push,
    replace,
    subscribe,
  };
}
