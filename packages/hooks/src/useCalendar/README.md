# useCalendar

선언적이고 타입 안전한 달력 훅입니다.

## 사용법

```tsx
import { useCalendar } from '@frontend-toolkit-js/hooks';

function MyCalendar() {
  const cal = useCalendar({
    weekStartsOn: 1, // 월요일 시작
    defaultDate: new Date(2025, 0, 1),
  });

  return <div>{/* 여기에 달력 UI 구현 */}</div>;
}
```

## API

### 옵션

```typescript
interface UseCalendarOptions {
  defaultDate?: Date; // 초기 날짜 (기본값: 오늘)
  weekStartsOn?: 0 | 1; // 주 시작일 (0=일요일, 1=월요일, 기본값: 0)
}
```

### 반환값

```typescript
{
  days: CalendarDay[];        // 42개 날짜 (6주 × 7일)
  weekdays: Weekday[];        // 요일 헤더 (7개)
  currentDate: Date;          // 현재 표시 중인 월
  prev: () => void;           // 이전 달로 이동
  next: () => void;           // 다음 달로 이동
  today: () => void;          // 오늘로 이동
  setDate: (date: Date) => void; // 특정 날짜로 설정
}
```

### 타입

```typescript
interface CalendarDay {
  date: Date; // 전체 Date 객체
  day: number; // 일 (1-31)
  isCurrentMonth: boolean; // 현재 표시 월에 속하는지
  isToday: boolean; // 오늘인지
  isWeekend: boolean; // 주말인지 (토/일)
}

interface Weekday {
  date: Date; // Date 객체
  label: string; // 짧은 레이블 ("월", "화", ...)
  labelLong: string; // 긴 레이블 ("월요일", "화요일", ...)
  index: number; // 요일 인덱스 (0-6)
}
```

## 예제

### 월요일 시작

```tsx
const cal = useCalendar({ weekStartsOn: 1 });
```

### 커스텀 스타일링

```tsx
{
  cal.days.map((day, i) => (
    <div
      key={i}
      className={cn(
        day.isCurrentMonth ? 'opacity-100' : 'opacity-30',
        day.isToday && 'font-bold bg-yellow-200',
        day.isWeekend && 'text-red-500'
      )}
    >
      {day.day}
    </div>
  ));
}
```

### 날짜 선택 기능 추가

```tsx
const [selected, setSelected] = useState<Date | null>(null);

{
  cal.days.map((day, i) => (
    <button
      key={i}
      onClick={() => setSelected(day.date)}
      style={{
        backgroundColor:
          selected && isSameDay(selected, day.date) ? 'blue' : 'white',
      }}
    >
      {day.day}
    </button>
  ));
}
```

### 헤더에 요일 표시

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
  {cal.weekdays.map((weekday, i) => (
    <div key={i}>
      {weekday.label} {/* "월", "화", ... */}
    </div>
  ))}
</div>
```

### 네비게이션

```tsx
<div>
  <button onClick={cal.prev}>◀ 이전 달</button>
  <h2>
    {cal.currentDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    })}
  </h2>
  <button onClick={cal.next}>다음 달 ▶</button>
  <button onClick={cal.today}>오늘</button>
</div>
```

## 동작 방식

- 항상 42개(6주 × 7일)의 날짜를 생성하여 레이아웃 안정성을 보장합니다
- 이전 달/다음 달의 날짜도 포함되며 `isCurrentMonth`로 구분할 수 있습니다
- `date-fns`를 사용하여 날짜 계산을 정확하게 처리합니다

## 참고

- Playground 예제: [CalendarExample.tsx](../../../../apps/playground/src/CalendarExample.tsx)
