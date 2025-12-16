import { useRouter } from 'next/router';
import type { QueryParamsAdapter } from './types';

export interface NextPagesAdapterOptions {
  scroll?: boolean;
  shallow?: boolean;
}

export function useNextPagesAdapter(
  options: NextPagesAdapterOptions = {}
): QueryParamsAdapter {
  const { scroll = false, shallow = true } = options;

  const router = useRouter();

  const getSearchParams = (): URLSearchParams => {
    const queryString = router.asPath.split('?')[1] || '';
    return new URLSearchParams(queryString);
  };

  const buildUrl = (params: URLSearchParams): string => {
    const pathname = router.pathname;
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  return {
    getSearchParams,
    getServerSnapshot: () => new URLSearchParams(),
    push: (params: URLSearchParams) => {
      void router.push(buildUrl(params), undefined, { scroll, shallow });
    },
    replace: (params: URLSearchParams) => {
      void router.replace(buildUrl(params), undefined, { scroll, shallow });
    },
    subscribe: () => () => {},
  };
}
