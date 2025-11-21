import { useState } from 'react';
import { CalendarExample } from './CalendarExample';
import { CalendarWithURLExample } from './CalendarWithURLExample';
import { InViewTriggerExample } from './InViewTriggerExample';
import { DebouncedCallbackExample } from './DebouncedCallbackExample';
import { SuspenseBoundaryExample } from './SuspenseBoundaryExample';

function App() {
  const [activeTab, setActiveTab] = useState<
    'calendar' | 'inview' | 'debouncedCallback' | 'suspenseBoundary'
  >('debouncedCallback');

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
        <button
          onClick={() => setActiveTab('debouncedCallback')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background:
              activeTab === 'debouncedCallback' ? '#3b82f6' : 'transparent',
            color: activeTab === 'debouncedCallback' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          🔄 DebouncedCallback
        </button>
        <button
          onClick={() => setActiveTab('suspenseBoundary')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background:
              activeTab === 'suspenseBoundary' ? '#3b82f6' : 'transparent',
            color: activeTab === 'suspenseBoundary' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          {activeTab === 'suspenseBoundary'
            ? '🔄 SuspenseBoundary'
            : '🔄 SuspenseBoundary'}
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
        {activeTab === 'debouncedCallback' && <DebouncedCallbackExample />}
        {activeTab === 'suspenseBoundary' && <SuspenseBoundaryExample />}
      </div>
    </div>
  );
}

export default App;
