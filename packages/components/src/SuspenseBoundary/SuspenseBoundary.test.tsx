import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { SuspenseBoundary } from './SuspenseBoundary';
import { useState } from 'react';

// Promise를 throw하여 Suspense를 트리거하는 테스트 헬퍼
function createSuspender() {
  let resolve: () => void;
  let status: 'pending' | 'resolved' = 'pending';
  const promise = new Promise<void>((r) => {
    resolve = () => {
      r();
      status = 'resolved';
    };
  });

  function Suspender() {
    if (status === 'pending') throw promise;
    return <div>로딩 완료</div>;
  }

  return { Suspender, resolve: resolve! };
}

// 에러를 throw하는 테스트용 컴포넌트
function ThrowError() {
  throw new Error('테스트 에러');
}

describe('SuspenseBoundary', () => {
  beforeEach(() => {
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
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={<div>에러</div>}
        >
          <div>정상 콘텐츠</div>
        </SuspenseBoundary>
      );

      expect(screen.getByText('정상 콘텐츠')).toBeDefined();
    });
  });

  describe('로딩 상태 (Suspense)', () => {
    it('Promise throw 시 pendingFallback을 렌더링한다', () => {
      const { Suspender } = createSuspender();

      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={<div>에러</div>}
        >
          <Suspender />
        </SuspenseBoundary>
      );

      expect(screen.getByText('로딩 중...')).toBeDefined();
      expect(screen.queryByText('로딩 완료')).toBeNull();
    });

    it('Promise resolve 후 children을 렌더링한다', async () => {
      const { Suspender, resolve } = createSuspender();

      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={<div>에러</div>}
        >
          <Suspender />
        </SuspenseBoundary>
      );

      expect(screen.getByText('로딩 중...')).toBeDefined();

      await act(async () => {
        resolve();
      });

      expect(screen.getByText('로딩 완료')).toBeDefined();
      expect(screen.queryByText('로딩 중...')).toBeNull();
    });
  });

  describe('에러 상태', () => {
    it('에러 발생 시 errorFallback(ReactNode)을 렌더링한다', () => {
      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={<div>에러 발생</div>}
        >
          <ThrowError />
        </SuspenseBoundary>
      );

      expect(screen.getByText('에러 발생')).toBeDefined();
    });

    it('에러 발생 시 errorFallback(함수)에 error와 reset을 전달한다', () => {
      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={(error, reset) => (
            <div>
              <span>{error.message}</span>
              <button onClick={reset}>재시도</button>
            </div>
          )}
        >
          <ThrowError />
        </SuspenseBoundary>
      );

      expect(screen.getByText('테스트 에러')).toBeDefined();
      expect(screen.getByText('재시도')).toBeDefined();
    });
  });

  describe('통합 동작 (Suspense + ErrorBoundary)', () => {
    it('로딩 → 에러: Suspense 해소 후 에러 발생 시 errorFallback을 렌더링한다', async () => {
      let resolve: () => void;
      let status: 'pending' | 'resolved' = 'pending';
      const promise = new Promise<void>((r) => {
        resolve = () => {
          r();
          status = 'resolved';
        };
      });

      // resolve 후 렌더링 시 에러를 throw하는 컴포넌트
      function SuspendThenError() {
        if (status === 'pending') throw promise;
        throw new Error('로딩 후 에러');
      }

      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={(error) => <div>에러: {error.message}</div>}
        >
          <SuspendThenError />
        </SuspenseBoundary>
      );

      // 1단계: 로딩 상태
      expect(screen.getByText('로딩 중...')).toBeDefined();

      // 2단계: resolve → 렌더링 시도 → 에러 → errorFallback
      await act(async () => {
        resolve!();
      });

      expect(screen.getByText('에러: 로딩 후 에러')).toBeDefined();
      expect(screen.queryByText('로딩 중...')).toBeNull();
    });
  });

  describe('props 전달', () => {
    it('onError가 호출된다', () => {
      const onError = vi.fn();

      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={<div>에러</div>}
          onError={onError}
        >
          <ThrowError />
        </SuspenseBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('onReset이 호출된다', () => {
      const onReset = vi.fn();
      let shouldThrow = true;

      function ConditionalError() {
        if (shouldThrow) throw new Error('에러');
        return <div>복귀</div>;
      }

      render(
        <SuspenseBoundary
          pendingFallback={<div>로딩 중...</div>}
          errorFallback={(error, reset) => (
            <button onClick={() => { shouldThrow = false; reset(); }}>
              재시도
            </button>
          )}
          onReset={onReset}
        >
          <ConditionalError />
        </SuspenseBoundary>
      );

      fireEvent.click(screen.getByText('재시도'));
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('resetKeys 변경 시 에러 상태가 리셋된다', () => {
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
            <SuspenseBoundary
              pendingFallback={<div>로딩 중...</div>}
              errorFallback={<div>에러 발생</div>}
              resetKeys={[key]}
            >
              <ConditionalError />
            </SuspenseBoundary>
          </>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('에러 발생')).toBeDefined();

      fireEvent.click(screen.getByText('키 변경'));
      expect(screen.getByText('복귀 성공')).toBeDefined();
    });
  });
});
