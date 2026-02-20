import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from './useIntersectionObserver';

// IntersectionObserver mock
let mockObserverInstances: Array<{
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  triggerEntry: (entry: Partial<IntersectionObserverEntry>) => void;
}>;

beforeEach(() => {
  mockObserverInstances = [];

  const MockIntersectionObserver = vi.fn(function (callback: IntersectionObserverCallback) {
    const instance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '0px',
      thresholds: [0],
      triggerEntry: (entry: Partial<IntersectionObserverEntry>) => {
        callback(
          [{ isIntersecting: false, intersectionRatio: 0, ...entry } as IntersectionObserverEntry],
          instance as unknown as IntersectionObserver
        );
      },
    };
    mockObserverInstances.push(instance);
    return instance;
  });

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIntersectionObserver', () => {
  it('ref에 요소가 연결되면 observer가 생성된다', () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect })
    );

    const element = document.createElement('div');
    act(() => {
      result.current(element);
    });

    expect(mockObserverInstances).toHaveLength(1);
    expect(mockObserverInstances[0].observe).toHaveBeenCalledWith(element);
  });

  it('enabled: false일 때 observer가 생성되지 않는다', () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: false })
    );

    const element = document.createElement('div');
    act(() => {
      result.current(element);
    });

    expect(mockObserverInstances).toHaveLength(0);
  });

  it('교차 상태 변경 시 onIntersect가 호출된다', () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect })
    );

    const element = document.createElement('div');
    act(() => {
      result.current(element);
    });

    act(() => {
      mockObserverInstances[0].triggerEntry({ isIntersecting: true });
    });

    expect(onIntersect).toHaveBeenCalledTimes(1);
    expect(onIntersect).toHaveBeenCalledWith(
      expect.objectContaining({ isIntersecting: true }),
      expect.anything()
    );
  });

  it('threshold, rootMargin 옵션이 observer에 전달된다', () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({
        onIntersect,
        threshold: 0.5,
        rootMargin: '10px',
      })
    );

    const element = document.createElement('div');
    act(() => {
      result.current(element);
    });

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5, rootMargin: '10px' })
    );
  });

  it('언마운트 시 observer가 disconnect된다', () => {
    const onIntersect = vi.fn();
    const { result, unmount } = renderHook(() =>
      useIntersectionObserver({ onIntersect })
    );

    const element = document.createElement('div');
    act(() => {
      result.current(element);
    });

    unmount();

    expect(mockObserverInstances[0].disconnect).toHaveBeenCalled();
  });
});
