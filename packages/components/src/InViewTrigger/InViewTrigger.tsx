import { useCallback, useEffect } from 'react';
import type { InViewTriggerProps } from './types';
import { useLatest } from './hooks/useLatest';
import { useOnce } from './hooks/useOnce';
import { useDelayedCallback } from './hooks/useDelayedCallback';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

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
