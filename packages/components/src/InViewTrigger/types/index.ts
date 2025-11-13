import type { CSSProperties, ReactNode } from 'react';

export interface InViewTriggerProps {
  onInView?: (entry?: IntersectionObserverEntry) => void;
  onOutView?: (entry?: IntersectionObserverEntry) => void;
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  debounce?: number;
}
