import type { ErrorInfo, ReactNode } from 'react';

/**
 * SuspenseBoundary Props
 */
export interface SuspenseBoundaryProps {
  children: ReactNode;
  pendingFallback: ReactNode;
  errorFallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;

  /**
   * 이 값이 변경되면 자동으로 에러 상태 리셋
   * @example [userId, postId]
   */
  resetKeys?: unknown[];
}

/**
 * ErrorBoundaryImpl Props (내부용)
 */
export interface ErrorBoundaryImplProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}

/**
 * ErrorBoundaryImpl State (내부용)
 */
export interface ErrorBoundaryImplState {
  error: Error | null;
}

/**
 * ErrorBoundary Props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}
