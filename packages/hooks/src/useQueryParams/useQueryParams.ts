import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { ParserBuilder } from './core';
import { createBrowserAdapter, type QueryParamsAdapter } from './adapters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Schema = Record<string, ParserBuilder<any>>;

type InferValues<T extends Schema> = {
  [K in keyof T]: T[K] extends { defaultValue: infer V }
    ? V
    : T[K] extends ParserBuilder<infer V>
      ? V | null
      : never;
};

interface SetParamsOptions {
  history?: 'push' | 'replace';
}

interface UseQueryParamsOptions {
  adapter?: QueryParamsAdapter;
}

export function useQueryParams<T extends Schema>(
  schema: T,
  options?: UseQueryParamsOptions
) {
  const adapterRef = useRef<QueryParamsAdapter | null>(null);
  if (!adapterRef.current) {
    adapterRef.current = options?.adapter ?? createBrowserAdapter();
  }
  const adapter = adapterRef.current;

  const searchParams = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSearchParams,
    adapter.getServerSnapshot
  );

  useEffect(() => {
    adapter.init?.();
    return () => adapter.cleanup?.();
  }, [adapter]);

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const values = useMemo(() => {
    const result: Record<string, unknown> = {};

    for (const key in schema) {
      const parser = schema[key];
      const raw = searchParams.get(key);
      const parsed = parser?.parse(raw);
      result[key] = parsed ?? parser?.defaultValue ?? null;
    }

    return result as InferValues<T>;
  }, [searchParams, schema]);

  const setParams = useCallback(
    (updates: Partial<InferValues<T>>, opts?: SetParamsOptions) => {
      const current = new URLSearchParams(searchParams);

      for (const key in updates) {
        const parser = schema[key];
        if (!parser) continue;

        const value = updates[key];

        if (value === undefined || value === null) {
          current.delete(key);
        } else {
          current.set(key, parser.serialize(value));
        }
      }

      if (opts?.history === 'push') {
        adapter.push(current);
      } else {
        adapter.replace(current);
      }
    },
    [adapter, searchParams, schema]
  );

  return { ...values, setParams };
}
