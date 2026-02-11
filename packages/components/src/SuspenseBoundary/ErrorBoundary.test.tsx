import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { useState } from 'react';

// 의도적으로 에러를 throw하는 테스트용 컴포넌트
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('테스트 에러');
  return <div>정상 렌더링</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React가 에러 바운더리에서 console.error를 출력하므로 모킹
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('정상 동작', () => {
    it('자식 컴포넌트가 정상 렌더링된다', () => {
      render(
        <ErrorBoundary fallback={<div>에러 발생</div>}>
          <div>정상 콘텐츠</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('정상 콘텐츠')).toBeDefined();
    });
  });

  describe('에러 캐치', () => {
    it('에러 발생 시 fallback(ReactNode)을 렌더링한다', () => {
      render(
        <ErrorBoundary fallback={<div>에러 발생</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('에러 발생')).toBeDefined();
      expect(screen.queryByText('정상 렌더링')).toBeNull();
    });

    it('에러 발생 시 fallback(함수)에 error와 reset을 전달한다', () => {
      render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <div>
              <span>{error.message}</span>
              <button onClick={reset}>리셋</button>
            </div>
          )}
        >
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('테스트 에러')).toBeDefined();
      expect(screen.getByText('리셋')).toBeDefined();
    });

    it('fallback 함수가 올바른 에러 메시지를 전달받는다', () => {
      const specificError = '특정 에러 메시지';

      function ThrowSpecificError() {
        throw new Error(specificError);
      }

      render(
        <ErrorBoundary
          fallback={(error) => <div>에러: {error.message}</div>}
        >
          <ThrowSpecificError />
        </ErrorBoundary>
      );

      expect(screen.getByText(`에러: ${specificError}`)).toBeDefined();
    });

    it('onError 콜백이 error, errorInfo와 함께 호출된다', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary fallback={<div>에러</div>} onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  describe('리셋', () => {
    it('reset() 호출 시 children으로 복귀한다', async () => {
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>복귀 성공</div>;
      }

      render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <button onClick={() => { shouldThrow = false; reset(); }}>
              재시도
            </button>
          )}
        >
          <ConditionalError />
        </ErrorBoundary>
      );

      expect(screen.getByText('재시도')).toBeDefined();

      fireEvent.click(screen.getByText('재시도'));

      expect(screen.getByText('복귀 성공')).toBeDefined();
    });

    it('reset() 호출 시 onReset 콜백이 호출된다', async () => {
      const onReset = vi.fn();
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>복귀</div>;
      }

      render(
        <ErrorBoundary
          fallback={(error, reset) => (
            <button onClick={() => { shouldThrow = false; reset(); }}>
              재시도
            </button>
          )}
          onReset={onReset}
        >
          <ConditionalError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('재시도'));

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('리셋 후 다시 에러가 발생하면 다시 fallback을 렌더링한다', () => {
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>정상</div>;
      }

      const fallbackFn = (error: Error, reset: () => void) => (
        <button onClick={() => { shouldThrow = false; reset(); }}>
          재시도
        </button>
      );

      const { rerender } = render(
        <ErrorBoundary fallback={fallbackFn}>
          <ConditionalError />
        </ErrorBoundary>
      );

      // 첫 번째 에러 → fallback 렌더링
      expect(screen.getByText('재시도')).toBeDefined();

      // 리셋 → 정상 복귀
      fireEvent.click(screen.getByText('재시도'));
      expect(screen.getByText('정상')).toBeDefined();

      // 다시 에러 발생
      shouldThrow = true;
      rerender(
        <ErrorBoundary fallback={fallbackFn}>
          <ConditionalError />
        </ErrorBoundary>
      );

      // 다시 fallback 렌더링
      expect(screen.getByText('재시도')).toBeDefined();
    });
  });

  describe('resetKeys', () => {
    it('resetKeys 변경 시 자동으로 에러 상태가 리셋된다', () => {
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>복귀 성공</div>;
      }

      function Wrapper() {
        const [key, setKey] = useState(0);
        return (
          <>
            <button onClick={() => { shouldThrow = false; setKey(k => k + 1); }}>
              키 변경
            </button>
            <ErrorBoundary
              fallback={<div>에러 발생</div>}
              resetKeys={[key]}
            >
              <ConditionalError />
            </ErrorBoundary>
          </>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('에러 발생')).toBeDefined();

      fireEvent.click(screen.getByText('키 변경'));
      expect(screen.getByText('복귀 성공')).toBeDefined();
    });

    it('resetKeys가 변경되지 않으면 에러 상태가 유지된다', () => {
      function Wrapper() {
        const [, setCount] = useState(0);
        return (
          <>
            <button onClick={() => setCount(c => c + 1)}>리렌더</button>
            <ErrorBoundary
              fallback={<div>에러 발생</div>}
              resetKeys={['고정값']}
            >
              <ThrowError />
            </ErrorBoundary>
          </>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('에러 발생')).toBeDefined();

      fireEvent.click(screen.getByText('리렌더'));
      expect(screen.getByText('에러 발생')).toBeDefined();
    });

    it('resetKeys 길이가 변경되면 리셋된다', () => {
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>복귀 성공</div>;
      }

      function Wrapper() {
        const [keys, setKeys] = useState<unknown[]>([1]);
        return (
          <>
            <button onClick={() => { shouldThrow = false; setKeys([1, 2]); }}>
              키 추가
            </button>
            <ErrorBoundary
              fallback={<div>에러 발생</div>}
              resetKeys={keys}
            >
              <ConditionalError />
            </ErrorBoundary>
          </>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('에러 발생')).toBeDefined();

      fireEvent.click(screen.getByText('키 추가'));
      expect(screen.getByText('복귀 성공')).toBeDefined();
    });
  });

  describe('개발 모드 로깅', () => {
    it('development 환경에서 콘솔에 에러를 출력한다', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary fallback={<div>에러</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(console.group).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
