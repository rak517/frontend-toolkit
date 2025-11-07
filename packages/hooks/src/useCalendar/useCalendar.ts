import { useCallback, useMemo, useState } from 'react';
import type { UseCalendarOptions } from './types';
import { createCalendar, createWeekdays } from './core';
import { addMonths, subMonths } from 'date-fns';

/**
 * 달력 Hook
 *
 * 달력 데이터와 네비게이션을 제공합니다.
 * UI는 완전히 사용자가 제어하며, 이 Hook은 로직만 제공합니다.
 *
 * @param options - 달력 옵션
 * @param options.defaultDate - 초기 날짜 (기본: 오늘)
 * @param options.weekStartsOn - 주 시작일 (0: 일요일, 1: 월요일)
 *
 * @returns 달력 데이터 및 네비게이션 함수
 *
 * @example
 * ```tsx
 * function Calendar() {
 *   const cal = useCalendar({ weekStartsOn: 1 });
 *
 *   return (
 *     <div>
 *       <button onClick={cal.prev}>◀</button>
 *       <h2>{cal.currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
 *       <button onClick={cal.next}>▶</button>
 *
 *       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
 *         {cal.days.map((day, i) => (
 *           <div
 *             key={i}
 *             style={{
 *               padding: '8px',
 *               opacity: day.isCurrentMonth ? 1 : 0.3,
 *               fontWeight: day.isToday ? 'bold' : 'normal',
 *               backgroundColor: day.isToday ? '#ffd700' : 'white',
 *               color: day.isWeekend ? 'red' : 'black',
 *             }}
 *           >
 *             {day.day}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCalendar(options: UseCalendarOptions = {}) {
  const { defaultDate = new Date(), weekStartsOn = 0 } = options;

  const [currentDate, setCurrentDate] = useState(defaultDate);

  const days = useMemo(
    () => createCalendar(currentDate, { weekStartsOn }),
    [currentDate, weekStartsOn]
  );

  const weekdays = useMemo(
    () => createWeekdays(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );

  const prev = useCallback(() => {
    setCurrentDate(date => subMonths(date, 1));
  }, []);

  const next = useCallback(() => {
    setCurrentDate(date => addMonths(date, 1));
  }, []);

  const today = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    days,
    weekdays,
    currentDate,
    prev,
    next,
    today,
    setDate: setCurrentDate,
  };
}
