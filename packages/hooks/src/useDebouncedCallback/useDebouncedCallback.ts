import { useCallback, useEffect, useRef } from 'react';

export interface DebouncedCallbackOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * 콜백 함수를 디바운스하여 반환하는 Hook
 *
 *
 * @param callback - 디바운스할 콜백 함수
 * @param delay - 디바운스 지연 시간 (ms)
 * @param options - 디바운스 옵션
 * @returns 디바운스된 콜백 함수
 *
 * @example
 * 기본 사용 (검색 자동완성)
 * ```tsx
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetch(`/api/search?q=${query}`);
 * }, 300);
 * ```
 *
 * @example
 * Leading edge (버튼 연타 방지)
 * ```tsx
 * const handleSubmit = useDebouncedCallback(
 *   () => submitForm(),
 *   1000,
 *   { leading: true, trailing: false }
 * );
 * ```
 *
 * @example
 * MaxWait (자동 저장)
 * ```tsx
 * const autoSave = useDebouncedCallback(
 *   () => saveData(),
 *   1000,
 *   { maxWait: 5000 }  // 최대 5초마다 강제 실행
 * );
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebouncedCallbackOptions = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;

  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastArgsRef = useRef<Parameters<T>>();
  const isFirstCallRef = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      lastArgsRef.current = args;

      if (leading && isFirstCallRef.current) {
        callbackRef.current(...args);
        isFirstCallRef.current = false;

        setTimeout(() => {
          isFirstCallRef.current = true;
        }, delay);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          timeoutRef.current = undefined;

          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = undefined;
          }
        }, delay);
      }

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
          }

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          maxTimeoutRef.current = undefined;
        }, maxWait);
      }
    }) as T,
    [delay, leading, trailing, maxWait]
  );
}
