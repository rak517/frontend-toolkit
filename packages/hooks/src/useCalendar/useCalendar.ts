import { useCallback, useMemo, useState } from 'react';
import type { UseCalendarOptions } from './types';
import { createCalendar, createWeekdays, parseDate } from './core';
import { addMonths, subMonths } from 'date-fns';

/**
 * 달력 데이터와 네비게이션을 제공하는 Hook
 *
 * SSR 환경에서도 안전하게 동작합니다.
 *
 * @param options.defaultDate - 초기 날짜 (Date | "2024-06" | timestamp)
 * @param options.weekStartsOn - 주 시작일 (0: 일요일, 1: 월요일)
 * @param options.onChange - 날짜 변경 시 콜백
 *
 * @returns days - 42개 날짜 배열 (6주 × 7일)
 * @returns weekdays - 요일 헤더 (7개)
 * @returns currentDate - 현재 표시 중인 날짜
 * @returns prev/next/today/setDate - 네비게이션 함수
 *
 * @example
 * ```tsx
 * const cal = useCalendar({
 *   defaultDate: searchParams.get('date'),
 *   onChange: (date) => router.push(`?date=${format(date, 'yyyy-MM')}`)
 * });
 * ```
 */
export function useCalendar(options: UseCalendarOptions = {}) {
  const { defaultDate, weekStartsOn = 0, onChange } = options;

  const [currentDate, setCurrentDate] = useState(() =>
    defaultDate != null ? parseDate(defaultDate) : new Date()
  );

  const days = useMemo(
    () => createCalendar(currentDate, { weekStartsOn }),
    [currentDate, weekStartsOn]
  );

  const weekdays = useMemo(
    () => createWeekdays(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );

  const updateDate = useCallback(
    (newDate: Date | ((prev: Date) => Date)) => {
      setCurrentDate(prev => {
        const next = typeof newDate === 'function' ? newDate(prev) : newDate;
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const prev = useCallback(() => {
    updateDate(date => subMonths(date, 1));
  }, [updateDate]);

  const next = useCallback(() => {
    updateDate(date => addMonths(date, 1));
  }, [updateDate]);

  const today = useCallback(() => {
    updateDate(new Date());
  }, [updateDate]);

  const setDate = useCallback(
    (date: Date) => {
      updateDate(date);
    },
    [updateDate]
  );

  return {
    days,
    weekdays,
    currentDate,
    prev,
    next,
    today,
    setDate,
  };
}
