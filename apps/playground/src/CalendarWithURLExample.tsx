import { useCalendar } from '@frontend-toolkit-js/hooks';

// date-fns 없이 간단한 포맷 함수
function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * URL 쿼리 파라미터와 동기화하는 예제
 *
 * 실제 환경에서는 react-router-dom의 useSearchParams 사용
 * 여기서는 간단히 window.location.search로 시연
 */
export function CalendarWithURLExample() {
  // 실제 환경: const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get('date');

  const cal = useCalendar({
    defaultDate: dateParam ?? undefined,
    onChange: date => {
      // 실제 환경: setSearchParams({ date: format(date, 'yyyy-MM') });
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('date', formatYearMonth(date));
      window.history.replaceState({}, '', `?${newParams.toString()}`);
    },
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>🔗 URL 동기화 예제</h3>
        <p style={{ margin: '10px 0', fontSize: '14px' }}>
          현재 URL: <code>{window.location.search || '(쿼리 없음)'}</code>
        </p>
        <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
          네비게이션 버튼을 누르면 URL이 자동으로 업데이트됩니다.
        </p>
      </div>

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
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
