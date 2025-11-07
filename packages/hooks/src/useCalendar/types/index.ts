/**
 * 달력의 한 날짜
 */
export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

/**
 * 달력 옵션
 */
export interface CalendarOptions {
  /** 주 시작 (0=일요일, 1=월요일) */
  weekStartsOn?: 0 | 1;
}

/**
 * useCalendar 옵션
 */
export interface UseCalendarOptions extends CalendarOptions {
  defaultDate?: Date;
}

export interface Weekday {
  date: Date;
  label: string;
  labelLong: string;
  index: number;
}
