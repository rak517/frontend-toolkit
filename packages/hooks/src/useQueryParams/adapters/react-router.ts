import { useSearchParams } from 'react-router-dom';
import type { QueryParamsAdapter } from './types';

export interface ReactRouterAdapterOptions {
  preventScrollReset?: boolean;
}

export function useReactRouterAdapter(
  options: ReactRouterAdapterOptions = {}
): QueryParamsAdapter {
  const { preventScrollReset = false } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  return {
    getSearchParams: () => searchParams,
    getServerSnapshot: () => searchParams,
    push: (params: URLSearchParams) => {
      setSearchParams(params, { preventScrollReset });
    },
    replace: (params: URLSearchParams) => {
      setSearchParams(params, { replace: true, preventScrollReset });
    },
    subscribe: () => () => {},
  };
}
