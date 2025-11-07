import { useCalendar } from '@frontend-toolkit/hooks';

export function CalendarExample() {
  const cal = useCalendar();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button onClick={cal.prev}>◀ 이전</button>
        <h2>
          {cal.currentDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </h2>
        <button onClick={cal.next}>다음 ▶</button>
      </div>

      <button onClick={cal.today} style={{ marginBottom: '20px' }}>
        오늘
      </button>

      {/* 요일 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {cal.weekdays.map((day, i) => (
          <div key={i}>{day.label}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}
      >
        {cal.days.map((day, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              textAlign: 'center',
              opacity: day.isCurrentMonth ? 1 : 0.3,
              fontWeight: day.isToday ? 'bold' : 'normal',
              backgroundColor: day.isToday ? '#ffd700' : 'white',
              color: day.isWeekend ? 'red' : 'black',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => console.log(day.date)}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
