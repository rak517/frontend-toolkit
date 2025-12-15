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

/**
 * 스키마로부터 값 타입 추론
 *
 * - withDefault가 있으면 NonNullable 타입
 * - 없으면 T | null 타입
 */
type InferValues<T extends Schema> = {
  [K in keyof T]: T[K] extends { defaultValue: infer V }
    ? V
    : T[K] extends ParserBuilder<infer V>
      ? V | null
      : never;
};

/** setParams 옵션 */
interface SetParamsOptions {
  /**
   * 히스토리 처리 방식
   * - 'push': 히스토리에 추가 (뒤로가기 가능)
   * - 'replace': 현재 히스토리 교체 (기본값)
   */
  history?: 'push' | 'replace';
}

/** useQueryParams 옵션 */
interface UseQueryParamsOptions {
  /**
   * 쿼리 파라미터 어댑터
   * 기본값: createBrowserAdapter()
   */
  adapter?: QueryParamsAdapter;
}

/**
 * URL 쿼리 파라미터를 선언적으로 관리하는 훅
 *
 * 스키마 기반으로 쿼리 파라미터를 타입 안전하게 읽고 쓸 수 있음
 *
 * @param schema - 파서 스키마 객체
 * @param options - 훅 옵션
 * @returns 파싱된 값들과 setParams 함수
 *
 * @example
 * ```tsx
 * const { page, search, sort, setParams } = useQueryParams({
 *   page: parseAsInteger.withDefault(1),
 *   search: parseAsString.withDefault(''),
 *   sort: parseAsStringEnum(['latest', 'oldest']).withDefault('latest'),
 * });
 *
 * // 값 읽기
 * console.log(page); // 1 (기본값) 또는 URL의 ?page=N 값
 *
 * // 값 쓰기
 * setParams({ page: 2 }); // URL을 ?page=2로 업데이트 (replace)
 * setParams({ page: 2 }, { history: 'push' }); // 히스토리에 추가
 * ```
 */
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
