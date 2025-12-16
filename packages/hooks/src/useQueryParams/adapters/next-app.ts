import type { QueryParamsAdapter } from './types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface NextAppAdapterOptions {
  scroll?: boolean;
}

export function useNextAppAdapter(
  options: NextAppAdapterOptions = {}
): QueryParamsAdapter {
  const { scroll = false } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cached = new URLSearchParams(searchParams.toString());

  const buildUrl = (params: URLSearchParams): string => {
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  return {
    getSearchParams: () => cached,
    getServerSnapshot: () => cached,
    push: (params: URLSearchParams) => {
      router.push(buildUrl(params), { scroll });
    },
    replace: (params: URLSearchParams) => {
      router.replace(buildUrl(params), { scroll });
    },
    subscribe: () => () => {},
  };
}
