import { useCallback, useEffect } from 'react';
import type { InViewTriggerProps } from './types';
import { useLatest } from './hooks/useLatest';
import { useOnce } from './hooks/useOnce';
import { useDelayedCallback } from './hooks/useDelayedCallback';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

/**
 * Intersection Observer 기반 화면 진입/이탈 감지 컴포넌트
 *
 * 무한 스크롤, 지연 로딩, 애니메이션 트리거 등에 활용할 수 있습니다.
 *
 * @param props - InViewTrigger 속성
 * @param props.onInView - 화면에 진입했을 때 실행되는 콜백 (필수)
 * @param props.onOutView - 화면에서 벗어났을 때 실행되는 콜백 (선택)
 * @param props.threshold - 가시성 임계값 (0.0 ~ 1.0), 기본값: 0.5
 * @param props.rootMargin - 루트 요소의 마진, 기본값: "0px"
 * @param props.root - 교차 영역 기준 요소, 기본값: null (viewport)
 * @param props.triggerOnce - 한 번만 실행 여부, 기본값: false
 * @param props.disabled - Observer 비활성화 여부, 기본값: false
 * @param props.debounce - 콜백 실행 지연 시간(ms), 기본값: 0
 * @param props.children - 자식 요소
 * @param props.className - CSS 클래스명
 * @param props.style - 인라인 스타일
 *
 * @example
 * 기본 사용
 * ```tsx
 * <InViewTrigger onInView={() => console.log('화면에 보임!')}>
 *   <div>내용</div>
 * </InViewTrigger>
 * ```
 */
export function InViewTrigger({
  onInView,
  onOutView,
  threshold = 0.5,
  root = null,
  rootMargin = '0px',
  triggerOnce = false,
  disabled = false,
  children,
  className,
  style,
  debounce = 0,
}: InViewTriggerProps) {
  const onInViewRef = useLatest(onInView);
  const onOutViewRef = useLatest(onOutView);
  const once = useOnce();

  const { schedule: scheduleCallback } = useDelayedCallback(
    (entry: IntersectionObserverEntry) => {
      once.mark();
      if (onInViewRef.current) {
        onInViewRef.current(entry);
      }
    },
    debounce
  );

  const handleInView = useCallback(
    (entry: IntersectionObserverEntry, observer: IntersectionObserver) => {
      if (triggerOnce && once.check()) {
        observer.disconnect();
        return;
      }
      scheduleCallback(entry);

      if (triggerOnce) {
        observer.disconnect();
      }
    },
    [triggerOnce, once, scheduleCallback]
  );

  const handleOutView = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (onOutViewRef.current) {
        onOutViewRef.current(entry);
      }
    },
    [onOutViewRef]
  );

  const setElement = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    root,
    enabled: !disabled,
    onIntersect: (entry, observer) => {
      if (entry.isIntersecting) {
        handleInView(entry, observer);
      } else {
        handleOutView(entry);
      }
    },
  });

  useEffect(() => {
    if (!disabled) {
      once.reset();
    }
  }, [disabled, once]);

  return (
    <div ref={setElement} className={className} style={style}>
      {children}
    </div>
  );
}
