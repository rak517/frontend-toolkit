import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { ErrorBoundaryImplProps, ErrorBoundaryImplState } from './types';

export class ErrorBoundaryImpl extends Component<
  ErrorBoundaryImplProps,
  ErrorBoundaryImplState
> {
  constructor(props: ErrorBoundaryImplProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryImplState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryImplProps): void {
    const { resetKeys } = this.props;
    const { error } = this.state;

    if (error == null) {
      return;
    }

    if (resetKeys == null) {
      return;
    }

    const hasResetKeysChanged =
      prevProps.resetKeys == null ||
      resetKeys.length !== prevProps.resetKeys.length ||
      resetKeys.some(
        (key, index) => !Object.is(key, prevProps.resetKeys![index])
      );

    if (hasResetKeysChanged) {
      this.reset();
    }
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error != null) {
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }

      return fallback;
    }

    return children;
  }
}
