import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendar } from './useCalendar';

describe('useCalendar', () => {
  describe('초기화', () => {
    it('기본 옵션으로 초기화된다', () => {
      const { result } = renderHook(() => useCalendar());

      expect(result.current.days).toHaveLength(42);
      expect(result.current.weekdays).toHaveLength(7);
      expect(result.current.currentDate).toBeInstanceOf(Date);
    });

    it('defaultDate로 초기 날짜를 설정할 수 있다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 5, 15) })
      );

      expect(result.current.currentDate.getFullYear()).toBe(2024);
      expect(result.current.currentDate.getMonth()).toBe(5);
    });

    it('문자열 defaultDate를 파싱한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: '2024-06' })
      );

      expect(result.current.currentDate.getFullYear()).toBe(2024);
      expect(result.current.currentDate.getMonth()).toBe(5);
    });

    it('timestamp defaultDate를 파싱한다', () => {
      const timestamp = new Date(2024, 5, 15).getTime();
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: timestamp })
      );

      expect(result.current.currentDate.getFullYear()).toBe(2024);
      expect(result.current.currentDate.getMonth()).toBe(5);
    });
  });

  describe('네비게이션', () => {
    it('prev()로 이전 달로 이동한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 5, 15) })
      );

      act(() => {
        result.current.prev();
      });

      expect(result.current.currentDate.getMonth()).toBe(4);
    });

    it('next()로 다음 달로 이동한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 5, 15) })
      );

      act(() => {
        result.current.next();
      });

      expect(result.current.currentDate.getMonth()).toBe(6);
    });

    it('today()로 오늘 날짜로 이동한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2020, 0, 1) })
      );

      act(() => {
        result.current.today();
      });

      const now = new Date();
      expect(result.current.currentDate.getMonth()).toBe(now.getMonth());
      expect(result.current.currentDate.getFullYear()).toBe(now.getFullYear());
    });

    it('setDate()로 특정 날짜로 이동한다', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.setDate(new Date(2025, 11, 25));
      });

      expect(result.current.currentDate.getFullYear()).toBe(2025);
      expect(result.current.currentDate.getMonth()).toBe(11);
      expect(result.current.currentDate.getDate()).toBe(25);
    });

    it('연도를 넘어가는 네비게이션이 올바르게 동작한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 0, 15) })
      );

      act(() => {
        result.current.prev();
      });

      expect(result.current.currentDate.getFullYear()).toBe(2023);
      expect(result.current.currentDate.getMonth()).toBe(11);
    });
  });

  describe('onChange 콜백', () => {
    it('네비게이션 시 onChange가 호출된다', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 5, 15), onChange })
      );

      act(() => {
        result.current.next();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('setDate 시 onChange가 호출된다', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useCalendar({ onChange })
      );

      const targetDate = new Date(2025, 3, 1);
      act(() => {
        result.current.setDate(targetDate);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(targetDate);
    });
  });

  describe('weekStartsOn 옵션', () => {
    it('weekStartsOn: 0이면 일요일부터 시작한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 0, 15), weekStartsOn: 0 })
      );

      expect(result.current.days[0].date.getDay()).toBe(0);
    });

    it('weekStartsOn: 1이면 월요일부터 시작한다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 0, 15), weekStartsOn: 1 })
      );

      expect(result.current.days[0].date.getDay()).toBe(1);
    });
  });

  describe('days 배열', () => {
    it('네비게이션 후 days가 갱신된다', () => {
      const { result } = renderHook(() =>
        useCalendar({ defaultDate: new Date(2024, 0, 15) })
      );

      const initialDays = result.current.days;

      act(() => {
        result.current.next();
      });

      expect(result.current.days).not.toBe(initialDays);
      const febDays = result.current.days.filter(d => d.isCurrentMonth);
      expect(febDays[0].date.getMonth()).toBe(1);
    });
  });
});
