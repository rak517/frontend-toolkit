import { useState } from 'react';
import { CalendarExample } from './CalendarExample';
import { CalendarWithURLExample } from './CalendarWithURLExample';
import { InViewTriggerExample } from './InViewTriggerExample';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'inview'>('calendar');

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🧰 Frontend Toolkit Playground</h1>
      <p>개발 및 테스트를 위한 환경입니다.</p>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '2rem',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'calendar' ? '#3b82f6' : 'transparent',
            color: activeTab === 'calendar' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          📅 Calendar
        </button>
        <button
          onClick={() => setActiveTab('inview')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'inview' ? '#3b82f6' : 'transparent',
            color: activeTab === 'inview' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          🔭 InViewTrigger
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'calendar' && (
          <>
            <CalendarExample />
            <CalendarWithURLExample />
          </>
        )}
        {activeTab === 'inview' && <InViewTriggerExample />}
      </div>
    </div>
  );
}

export default App;
