'use client';

import { Suspense, useState } from 'react';
import { useCalendar } from '@frontend-toolkit-js/hooks';
import { useSearchParams, useRouter } from 'next/navigation';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function CalendarExample() {
  const [dateInput, setDateInput] = useState('2024-01');
  const [changeLog, setChangeLog] = useState<string[]>([]);

  const cal = useCalendar({
    defaultDate: dateInput,
    onChange: date => {
      const formatted = formatDate(date);
      const timestamp = new Date().toLocaleTimeString();
      setChangeLog(prev => [
        `[${timestamp}] ${formatted}`,
        ...prev.slice(0, 4),
      ]);
    },
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>onChange 테스트</h3>
        <label>
          날짜 입력 (YYYY-MM):
          <input
            type="text"
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
            placeholder="2024-01"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
        <button
          onClick={() => setDateInput('2024-06')}
          style={{ marginLeft: '10px' }}
        >
          2024년 6월
        </button>
        <button
          onClick={() => setDateInput(new Date().toISOString().slice(0, 7))}
          style={{ marginLeft: '10px' }}
        >
          이번 달
        </button>

        <div style={{ marginTop: '15px' }}>
          <strong>onChange 호출 로그:</strong>
          <ul
            style={{
              margin: '10px 0 0 0',
              padding: '10px',
              background: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              maxHeight: '120px',
              overflowY: 'auto',
              listStyle: 'none',
            }}
          >
            {changeLog.length === 0 ? (
              <li style={{ color: '#999' }}>네비게이션 버튼을 눌러보세요</li>
            ) : (
              changeLog.map((log, i) => (
                <li key={i} style={{ padding: '4px 0' }}>
                  {log}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button onClick={cal.prev}>이전</button>
        <h2>
          {cal.currentDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </h2>
        <button onClick={cal.next}>다음</button>
      </div>

      <button onClick={cal.today} style={{ marginBottom: '20px' }}>
        오늘
      </button>

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

function CalendarWithURLExample() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get('date');

  const cal = useCalendar({
    defaultDate: dateParam ?? undefined,
    onChange: date => {
      const newDate = formatYearMonth(date);
      router.push(`/calendar?date=${newDate}`);
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
        <h3 style={{ marginTop: 0 }}>URL 동기화 예제</h3>
        <p style={{ margin: '10px 0', fontSize: '14px' }}>
          현재 URL: <code>?date={dateParam || '(없음)'}</code>
        </p>
        <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
          네비게이션 버튼을 누르면 URL이 자동으로 업데이트됩니다.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button onClick={cal.prev}>이전</button>
        <h2>
          {cal.currentDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </h2>
        <button onClick={cal.next}>다음</button>
      </div>

      <button onClick={cal.today} style={{ marginBottom: '20px' }}>
        오늘
      </button>

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

export default function CalendarPage() {
  return (
    <div>
      <h2>useCalendar Example</h2>
      <CalendarExample />
      <hr style={{ margin: '40px 0' }} />
      <Suspense fallback={<div>로딩 중...</div>}>
        <CalendarWithURLExample />
      </Suspense>
    </div>
  );
}
