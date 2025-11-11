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
  /**
   * 초기 날짜
   * - Date 객체
   * - ISO 문자열 (예: "2024-01-15", "2024-01")
   * - Unix timestamp (밀리초)
   */
  defaultDate?: Date | string | number;

  /**
   * 날짜 변경 시 호출되는 콜백
   *
   * @param date - 변경된 날짜
   *
   * @example
   * ```tsx
   * const [searchParams, setSearchParams] = useSearchParams();
   *
   * const cal = useCalendar({
   *   defaultDate: searchParams.get('date') ?? undefined,
   *   onChange: (date) => {
   *     setSearchParams({ date: format(date, 'yyyy-MM') });
   *   }
   * });
   * ```
   */
  onChange?: (date: Date) => void;
}

export interface Weekday {
  date: Date;
  label: string;
  labelLong: string;
  index: number;
}
