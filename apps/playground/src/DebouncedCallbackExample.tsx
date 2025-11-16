import { useState } from 'react';
import { useDebouncedCallback } from '@frontend-toolkit-js/hooks';

export function DebouncedCallbackExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>⏱️ useDebouncedCallback 예제</h1>

      <div
        style={{
          padding: '20px',
          background: '#f0f9ff',
          borderRadius: '8px',
          marginBottom: '40px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px' }}>
          각 옵션별로 동작 방식을 확인해보세요!
        </p>
      </div>

      {/* 1. 기본 사용 (Trailing) */}
      <Section1_Basic />

      {/* 2. Leading (버튼 연타 방지) */}
      <Section2_Leading />

      {/* 3. Leading + Trailing */}
      <Section3_LeadingAndTrailing />

      {/* 4. MaxWait (자동 저장) */}
      <Section4_MaxWait />

      {/* 5. 옵션 비교 */}
      <Section5_Comparison />

      {/* 하단 여백 */}
      <div style={{ height: '50vh' }} />
    </div>
  );
}

// ============================================
// 예제 1: 기본 사용 (Trailing)
// ============================================
function Section1_Basic() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedLog = useDebouncedCallback((msg: string) => {
    addLog(`✅ 실행됨: ${msg}`);
  }, 1000);

  const handleClick = () => {
    addLog('🔵 클릭!');
    debouncedLog('Trailing 실행');
  };

  return (
    <ExampleSection
      title="1. 기본 사용 (Trailing Only)"
      description="마지막 클릭 1초 후 실행 (기본 동작)"
    >
      <button onClick={handleClick} style={{ marginBottom: '20px' }}>
        클릭해보세요!
      </button>

      <LogBox logs={logs} />

      <CodeBox>
        {`const debouncedLog = useDebouncedCallback(
  (msg) => console.log(msg),
  1000
  // trailing: true (기본값)
);`}
      </CodeBox>
    </ExampleSection>
  );
}

// ============================================
// 예제 2: Leading (버튼 연타 방지)
// ============================================
function Section2_Leading() {
  const [logs, setLogs] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedSubmit = useDebouncedCallback(
    () => {
      setCount(c => c + 1);
      addLog('✅ 폼 제출 완료!');
    },
    2000,
    { leading: true, trailing: false }
  );

  const handleClick = () => {
    addLog('🔵 제출 버튼 클릭');
    debouncedSubmit();
  };

  return (
    <ExampleSection
      title="2. Leading (버튼 연타 방지)"
      description="첫 클릭만 즉시 실행, 2초 동안 추가 클릭 무시"
    >
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleClick}>폼 제출</button>
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '6px',
            border: '2px solid #10b981',
          }}
        >
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            제출 횟수: {count}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            빠르게 연타해도 2초마다 1번만 실행됨
          </p>
        </div>
      </div>

      <LogBox logs={logs} />

      <CodeBox>
        {`const debouncedSubmit = useDebouncedCallback(
  submitForm,
  2000,
  { leading: true, trailing: false }
);

// 동작:
// 0ms:    클릭 → 즉시 실행 ✅
// 500ms:  클릭 → 무시 ❌
// 1000ms: 클릭 → 무시 ❌
// 2000ms: (리셋)
// 2100ms: 클릭 → 다시 즉시 실행 ✅`}
      </CodeBox>
    </ExampleSection>
  );
}

// ============================================
// 예제 3: Leading + Trailing
// ============================================
function Section3_LeadingAndTrailing() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedTrack = useDebouncedCallback(
    () => {
      addLog('📊 스크롤 위치 추적');
    },
    1000,
    { leading: true, trailing: true }
  );

  const handleScroll = () => {
    addLog('🔵 스크롤 이벤트');
    debouncedTrack();
  };

  return (
    <ExampleSection
      title="3. Leading + Trailing"
      description="첫 스크롤 즉시 실행 + 마지막 스크롤 1초 후 실행"
    >
      <div
        onScroll={handleScroll}
        style={{
          height: '200px',
          overflow: 'auto',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          background: '#fafafa',
        }}
      >
        <div style={{ height: '800px' }}>
          <p style={{ position: 'sticky', top: 0, background: '#fafafa' }}>
            👇 스크롤해보세요!
          </p>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i}>라인 {i + 1}</p>
          ))}
        </div>
      </div>

      <LogBox logs={logs} />

      <CodeBox>
        {`const debouncedTrack = useDebouncedCallback(
  trackScroll,
  1000,
  { leading: true, trailing: true }
);

// 동작:
// 스크롤 시작 → 즉시 실행 ✅ (leading)
// 계속 스크롤 → 대기...
// 스크롤 멈춤 → 1초 후 실행 ✅ (trailing)`}
      </CodeBox>
    </ExampleSection>
  );
}

// ============================================
// 예제 4: MaxWait (자동 저장)
// ============================================
function Section4_MaxWait() {
  const [logs, setLogs] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [saveCount, setSaveCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedSave = useDebouncedCallback(
    (content: string) => {
      setSaveCount(c => c + 1);
      addLog(`💾 저장됨: "${content.slice(0, 20)}..."`);
    },
    1000,
    { maxWait: 3000 }
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    addLog('⌨️ 타이핑 중...');
    debouncedSave(newText);
  };

  return (
    <ExampleSection
      title="4. MaxWait (자동 저장)"
      description="입력 멈추면 1초 후 저장, 계속 입력해도 최대 3초마다 강제 저장"
    >
      <div
        style={{
          padding: '16px',
          background: '#fef3c7',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          💡 팁: 계속 타이핑해보세요! 3초마다 자동 저장됩니다.
        </p>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="여기에 입력하세요... (자동 저장됩니다)"
        style={{
          width: '100%',
          minHeight: '100px',
          padding: '12px',
          fontSize: '14px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
          fontFamily: 'inherit',
        }}
      />

      <div
        style={{
          padding: '12px',
          background: '#f0fdf4',
          borderRadius: '6px',
          border: '2px solid #10b981',
          marginBottom: '20px',
        }}
      >
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          저장 횟수: {saveCount}
        </p>
      </div>

      <LogBox logs={logs} />

      <CodeBox>
        {`const debouncedSave = useDebouncedCallback(
  save,
  1000,
  { maxWait: 3000 }
);

// 동작:
// 0ms:    타이핑 → 1초 타이머, 3초 타이머 시작
// 500ms:  타이핑 → 1초 타이머 리셋
// 1000ms: 타이핑 → 1초 타이머 리셋
// 2000ms: 타이핑 → 1초 타이머 리셋
// 3000ms: MaxWait 만료 → 강제 저장! ⚡`}
      </CodeBox>
    </ExampleSection>
  );
}

// ============================================
// 예제 5: 옵션 비교
// ============================================
function Section5_Comparison() {
  // ✅ 수정: 명확한 타입 정의
  const [logs, setLogs] = useState<{
    default: { time: string; msg: string }[];
    leading: { time: string; msg: string }[];
    leadingTrailing: { time: string; msg: string }[];
    maxWait: { time: string; msg: string }[];
  }>({
    default: [],
    leading: [],
    leadingTrailing: [],
    maxWait: [],
  });

  const addLog = (
    type: 'default' | 'leading' | 'leadingTrailing' | 'maxWait',
    message: string
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => ({
      ...prev,
      [type]: [{ time: timestamp, msg: message }, ...prev[type].slice(0, 4)],
    }));
  };

  // 1. Default (Trailing)
  const defaultDebounced = useDebouncedCallback(() => {
    addLog('default', '✅ 실행');
  }, 1000);

  // 2. Leading
  const leadingDebounced = useDebouncedCallback(
    () => {
      addLog('leading', '✅ 실행');
    },
    1000,
    { leading: true, trailing: false }
  );

  // 3. Leading + Trailing
  const bothDebounced = useDebouncedCallback(
    () => {
      addLog('leadingTrailing', '✅ 실행');
    },
    1000,
    { leading: true, trailing: true }
  );

  // 4. MaxWait
  const maxWaitDebounced = useDebouncedCallback(
    () => {
      addLog('maxWait', '✅ 실행');
    },
    1000,
    { maxWait: 2000 }
  );

  const handleClick = (
    type: 'default' | 'leading' | 'leadingTrailing' | 'maxWait'
  ) => {
    addLog(type, '🔵 클릭');

    switch (type) {
      case 'default':
        defaultDebounced();
        break;
      case 'leading':
        leadingDebounced();
        break;
      case 'leadingTrailing':
        bothDebounced();
        break;
      case 'maxWait':
        maxWaitDebounced();
        break;
    }
  };

  return (
    <ExampleSection
      title="5. 옵션 비교"
      description="4가지 옵션을 동시에 비교해보세요"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Default */}
        <ComparisonCard
          title="Default"
          description="trailing: true"
          color="#3b82f6"
          logs={logs.default}
          onTest={() => handleClick('default')}
        />

        {/* Leading */}
        <ComparisonCard
          title="Leading"
          description="leading: true"
          color="#10b981"
          logs={logs.leading}
          onTest={() => handleClick('leading')}
        />

        {/* Leading + Trailing */}
        <ComparisonCard
          title="Both"
          description="leading + trailing"
          color="#f59e0b"
          logs={logs.leadingTrailing}
          onTest={() => handleClick('leadingTrailing')}
        />

        {/* MaxWait */}
        <ComparisonCard
          title="MaxWait"
          description="maxWait: 2s"
          color="#ef4444"
          logs={logs.maxWait}
          onTest={() => handleClick('maxWait')}
        />
      </div>
    </ExampleSection>
  );
}

// ============================================
// 헬퍼 컴포넌트
// ============================================

interface ExampleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ExampleSection({ title, description, children }: ExampleSectionProps) {
  return (
    <section style={{ marginBottom: '60px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
        {description}
      </p>
      {children}
    </section>
  );
}

interface LogBoxProps {
  logs: string[];
}

function LogBox({ logs }: LogBoxProps) {
  return (
    <div
      style={{
        padding: '16px',
        background: '#1f2937',
        borderRadius: '8px',
        marginBottom: '20px',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          color: '#9ca3af',
          fontWeight: 'bold',
        }}
      >
        📋 실행 로그
      </p>
      {logs.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          버튼을 눌러보세요!
        </p>
      ) : (
        <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ padding: '4px 0', color: '#e5e7eb' }}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CodeBoxProps {
  children: string;
}

function CodeBox({ children }: CodeBoxProps) {
  return (
    <div
      style={{
        padding: '16px',
        background: '#1f2937',
        borderRadius: '8px',
        overflow: 'auto',
      }}
    >
      <pre
        style={{
          margin: 0,
          fontSize: '13px',
          color: '#e5e7eb',
          fontFamily: 'monospace',
        }}
      >
        {children}
      </pre>
    </div>
  );
}

interface ComparisonCardProps {
  title: string;
  description: string;
  color: string;
  logs: { time: string; msg: string }[];
  onTest: () => void;
}

function ComparisonCard({
  title,
  description,
  color,
  logs,
  onTest,
}: ComparisonCardProps) {
  return (
    <div
      style={{
        padding: '16px',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        background: 'white',
      }}
    >
      <h3
        style={{
          margin: '0 0 4px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          color,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        {description}
      </p>

      <button
        onClick={onTest}
        style={{
          width: '100%',
          marginBottom: '12px',
          background: color,
          color: 'white',
          border: 'none',
        }}
      >
        테스트
      </button>

      <div
        style={{
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '4px',
          minHeight: '120px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        {logs.length === 0 ? (
          <p style={{ margin: 0, color: '#9ca3af' }}>로그 없음</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ padding: '2px 0' }}>
              <span style={{ color: '#6b7280' }}>[{log.time}]</span> {log.msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
