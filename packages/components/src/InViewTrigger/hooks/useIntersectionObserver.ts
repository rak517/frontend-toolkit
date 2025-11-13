import { useEffect, useState } from 'react';
import { useLatest } from './useLatest';

/**
 * IntersectionObserver 옵션
 */
export interface UseIntersectionObserverOptions {
  /**
   * 가시성 임계값 (0.0 ~ 1.0)
   * @default 0
   */
  threshold?: number | number[];

  /**
   * 루트 요소의 마진
   * @default "0px"
   */
  rootMargin?: string;

  /**
   * 교차 영역 기준 요소
   * @default null
   */
  root?: Element | Document | null;

  /**
   * 교차 상태 변경 시 실행할 콜백
   */
  onIntersect: (
    entry: IntersectionObserverEntry,
    observer: IntersectionObserver
  ) => void;

  /**
   * Observer 활성화 여부
   * @default true
   */
  enabled?: boolean;
}

/**
 * IntersectionObserver를 관리하는 Hook
 *
 * @param options - Observer 옵션
 * @returns 관찰할 요소에 연결할 ref
 *
 * @example
 * ```tsx
 * const elementRef = useIntersectionObserver<HTMLDivElement>({
 *   threshold: 0.5,
 *   onIntersect: (entry, observer) => {
 *     if (entry.isIntersecting) {
 *       console.log('화면에 보임!');
 *       observer.disconnect(); // 한 번만 실행하고 해제
 *     }
 *   },
 * });
 *
 * return <div ref={elementRef}>내용</div>;
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionObserverOptions
) {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    onIntersect,
    enabled = true,
  } = options;

  const [element, setElement] = useState<T | null>(null);
  const onIntersectRef = useLatest(onIntersect);

  useEffect(() => {
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          onIntersectRef.current(entry, observer);
        }
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, rootMargin, root, enabled, onIntersectRef]);

  return setElement;
}
