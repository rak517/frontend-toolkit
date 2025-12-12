'use client';

import { useState } from 'react';
import { useDebouncedCallback } from '@frontend-toolkit-js/hooks';

function Section1_Basic() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedLog = useDebouncedCallback((msg: string) => {
    addLog(`실행됨: ${msg}`);
  }, 1000);

  const handleClick = () => {
    addLog('클릭!');
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
      addLog('폼 제출 완료!');
    },
    2000,
    { leading: true, trailing: false }
  );

  const handleClick = () => {
    addLog('제출 버튼 클릭');
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
);`}
      </CodeBox>
    </ExampleSection>
  );
}

function Section3_LeadingAndTrailing() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const debouncedTrack = useDebouncedCallback(
    () => {
      addLog('스크롤 위치 추적');
    },
    1000,
    { leading: true, trailing: true }
  );

  const handleScroll = () => {
    addLog('스크롤 이벤트');
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
            스크롤해보세요!
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
);`}
      </CodeBox>
    </ExampleSection>
  );
}

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
      addLog(`저장됨: "${content.slice(0, 20)}..."`);
    },
    1000,
    { maxWait: 3000 }
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    addLog('타이핑 중...');
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
          팁: 계속 타이핑해보세요! 3초마다 자동 저장됩니다.
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
);`}
      </CodeBox>
    </ExampleSection>
  );
}

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
        실행 로그
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

export default function DebouncePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>useDebouncedCallback 예제</h1>

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

      <Section1_Basic />
      <Section2_Leading />
      <Section3_LeadingAndTrailing />
      <Section4_MaxWait />

      <div style={{ height: '50vh' }} />
    </div>
  );
}
