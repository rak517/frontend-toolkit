import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { InViewTrigger } from './InViewTrigger';

// IntersectionObserver mock
let mockObserverCallback: IntersectionObserverCallback;
let mockObserverInstance: {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
};

function triggerIntersection(isIntersecting: boolean) {
  const entry = {
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    target: document.createElement('div'),
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as IntersectionObserverEntry;

  mockObserverCallback(
    [entry],
    mockObserverInstance as unknown as IntersectionObserver
  );

  return entry;
}

beforeEach(() => {
  vi.useFakeTimers();

  const MockIntersectionObserver = vi.fn(function (callback: IntersectionObserverCallback) {
    mockObserverCallback = callback;
    mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };
    return mockObserverInstance;
  });

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanup();
});

describe('InViewTrigger', () => {
  describe('렌더링', () => {
    it('children이 정상 렌더링된다', () => {
      render(
        <InViewTrigger onInView={vi.fn()}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      expect(screen.getByText('콘텐츠')).toBeDefined();
    });

    it('className이 wrapper div에 적용된다', () => {
      const { container } = render(
        <InViewTrigger onInView={vi.fn()} className="custom-class">
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      expect(container.firstElementChild?.className).toBe('custom-class');
    });

    it('style이 wrapper div에 적용된다', () => {
      const { container } = render(
        <InViewTrigger onInView={vi.fn()} style={{ color: 'red' }}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      expect((container.firstElementChild as HTMLElement).style.color).toBe('red');
    });
  });

  describe('뷰포트 감지', () => {
    it('뷰포트 진입 시 onInView가 호출된다', () => {
      const onInView = vi.fn();
      render(
        <InViewTrigger onInView={onInView}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      act(() => {
        triggerIntersection(true);
      });

      expect(onInView).toHaveBeenCalledTimes(1);
    });

    it('뷰포트 이탈 시 onOutView가 호출된다', () => {
      const onOutView = vi.fn();
      render(
        <InViewTrigger onInView={vi.fn()} onOutView={onOutView}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      act(() => {
        triggerIntersection(false);
      });

      expect(onOutView).toHaveBeenCalledTimes(1);
    });

    it('threshold, rootMargin이 IntersectionObserver에 전달된다', () => {
      render(
        <InViewTrigger onInView={vi.fn()} threshold={0.8} rootMargin="20px">
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.8, rootMargin: '20px' })
      );
    });
  });

  describe('triggerOnce', () => {
    it('triggerOnce: true일 때 한 번만 호출되고 disconnect된다', () => {
      const onInView = vi.fn();
      render(
        <InViewTrigger onInView={onInView} triggerOnce>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      act(() => {
        triggerIntersection(true);
      });

      expect(onInView).toHaveBeenCalledTimes(1);
      expect(mockObserverInstance.disconnect).toHaveBeenCalled();
    });

    it('triggerOnce: false일 때 여러 번 호출된다', () => {
      const onInView = vi.fn();
      render(
        <InViewTrigger onInView={onInView} triggerOnce={false}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      act(() => {
        triggerIntersection(true);
      });
      act(() => {
        triggerIntersection(true);
      });

      expect(onInView).toHaveBeenCalledTimes(2);
    });
  });

  describe('disabled', () => {
    it('disabled: true일 때 observer가 생성되지 않는다', () => {
      const constructorCallsBefore = vi.mocked(IntersectionObserver).mock.calls.length;

      render(
        <InViewTrigger onInView={vi.fn()} disabled>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      const constructorCallsAfter = vi.mocked(IntersectionObserver).mock.calls.length;
      expect(constructorCallsAfter).toBe(constructorCallsBefore);
    });
  });

  describe('debounce', () => {
    it('debounce 설정 시 지연 후 onInView가 호출된다', () => {
      const onInView = vi.fn();
      render(
        <InViewTrigger onInView={onInView} debounce={300}>
          <span>콘텐츠</span>
        </InViewTrigger>
      );

      act(() => {
        triggerIntersection(true);
      });
      expect(onInView).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onInView).toHaveBeenCalledTimes(1);
    });
  });
});
