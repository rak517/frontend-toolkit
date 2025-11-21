// apps/playground/src/SuspenseBoundaryExample.tsx

import { useState } from 'react';
import {
  SuspenseBoundary,
  ErrorBoundary,
} from '@frontend-toolkit-js/components';

// ============================================
// 타입 정의
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
}

interface CachedPromise<T> extends Promise<T> {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: Error;
}

// ============================================
// 비동기 컴포넌트 시뮬레이션
// ============================================

// 간단한 캐시 (Promise 상태 추적)
const cache = new Map<string, CachedPromise<User>>();

function fetchUser(userId: string): User {
  const cacheKey = `user-${userId}`;

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (cached.status === 'fulfilled') return cached.value!;
    if (cached.status === 'rejected') throw cached.reason;
    throw cached; // pending - Suspense trigger
  }

  const promise = new Promise<User>((resolve, reject) => {
    setTimeout(() => {
      if (userId === 'error') {
        reject(new Error('사용자를 찾을 수 없습니다.'));
      } else {
        resolve({
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
        });
      }
    }, 1000);
  }) as CachedPromise<User>;

  promise.status = 'pending';
  promise.then(
    (value: User) => {
      promise.status = 'fulfilled';
      promise.value = value;
    },
    (reason: Error) => {
      promise.status = 'rejected';
      promise.reason = reason;
    }
  );

  cache.set(cacheKey, promise);
  throw promise; // Suspense trigger
}

// Suspense용 컴포넌트
function UserProfile({ userId }: { userId: string }) {
  const user = fetchUser(userId);

  return (
    <div
      style={{
        padding: '20px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '2px solid #3b82f6',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>👤 {user.name}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
        📧 {user.email}
      </p>
    </div>
  );
}

// ============================================
// 예제 1: SuspenseBoundary 기본 사용
// ============================================

function Example1_Basic() {
  const [userId, setUserId] = useState('1');

  return (
    <ExampleSection title="1. 기본 사용" description="로딩 + 에러를 모두 처리">
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setUserId('1')}>User 1</button>
        <button onClick={() => setUserId('2')} style={{ marginLeft: '8px' }}>
          User 2
        </button>
        <button
          onClick={() => setUserId('error')}
          style={{ marginLeft: '8px' }}
        >
          에러 케이스
        </button>
      </div>

      <SuspenseBoundary
        pendingFallback={
          <div
            style={{
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            ⏳ 사용자 정보 로딩 중...
          </div>
        }
        errorFallback={
          <div
            style={{
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            ❌ 에러가 발생했습니다.
          </div>
        }
      >
        <UserProfile userId={userId} />
      </SuspenseBoundary>
    </ExampleSection>
  );
}

// ============================================
// 예제 2: 함수형 Fallback (재시도)
// ============================================

function Example2_FunctionFallback() {
  const [userId, setUserId] = useState('1');
  const [retryCount, setRetryCount] = useState(0);

  return (
    <ExampleSection
      title="2. 함수형 Fallback (재시도 버튼)"
      description="에러 정보와 reset 함수 활용"
    >
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setUserId('error')}>에러 발생</button>
        <button onClick={() => setUserId('1')} style={{ marginLeft: '8px' }}>
          정상 복구
        </button>
        <span style={{ marginLeft: '12px', color: '#666', fontSize: '14px' }}>
          재시도 횟수: {retryCount}
        </span>
      </div>

      <SuspenseBoundary
        pendingFallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            ⏳ 로딩 중...
          </div>
        }
        errorFallback={(error, reset) => (
          <div
            style={{
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px',
              border: '2px solid #ef4444',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              ❌ 에러 발생
            </p>
            <p
              style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}
            >
              {error.message}
            </p>
            <button
              onClick={() => {
                cache.delete(`user-error`);
                setRetryCount(c => c + 1);
                reset();
              }}
            >
              재시도
            </button>
          </div>
        )}
      >
        <UserProfile userId={userId} />
      </SuspenseBoundary>
    </ExampleSection>
  );
}

// ============================================
// 예제 3: resetKeys (자동 리셋)
// ============================================

function Example3_ResetKeys() {
  const [userId, setUserId] = useState('1');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 4)]);
  };

  return (
    <ExampleSection
      title="3. resetKeys (자동 리셋)"
      description="userId 변경 시 자동으로 에러 상태 초기화"
    >
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          background: '#e0f2fe',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      >
        💡 <strong>팁:</strong> 에러 발생 후 다른 사용자를 선택하면 자동으로
        리셋됩니다.
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setUserId('1')}>User 1</button>
        <button onClick={() => setUserId('2')} style={{ marginLeft: '8px' }}>
          User 2
        </button>
        <button
          onClick={() => setUserId('error')}
          style={{ marginLeft: '8px' }}
        >
          에러 케이스
        </button>
      </div>

      <SuspenseBoundary
        pendingFallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            ⏳ 로딩 중...
          </div>
        }
        errorFallback={
          <div
            style={{
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            ❌ 에러 발생
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
              (다른 사용자를 선택하면 자동 리셋됨)
            </p>
          </div>
        }
        resetKeys={[userId]}
        onReset={() => {
          cache.delete(`user-${userId}`);
          addLog(`리셋됨: userId=${userId}`);
        }}
      >
        <UserProfile userId={userId} />
      </SuspenseBoundary>

      {/* 로그 */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'monospace',
          maxHeight: '150px',
          overflow: 'auto',
        }}
      >
        <strong>📋 리셋 로그:</strong>
        {log.length === 0 ? (
          <p style={{ margin: '8px 0 0 0', color: '#999' }}>
            사용자를 변경해보세요
          </p>
        ) : (
          log.map((line, i) => (
            <div key={i} style={{ padding: '4px 0', color: '#374151' }}>
              {line}
            </div>
          ))
        )}
      </div>
    </ExampleSection>
  );
}

// ============================================
// 예제 4: 에러 추적 (onError)
// ============================================

function Example4_ErrorTracking() {
  const [userId, setUserId] = useState('1');
  const [errorLog, setErrorLog] = useState<string[]>([]);

  return (
    <ExampleSection
      title="4. 에러 추적 (onError 콜백)"
      description="에러 발생 시 로깅, 분석 도구로 전송 가능"
    >
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setUserId('error')}>에러 발생</button>
        <button onClick={() => setUserId('1')} style={{ marginLeft: '8px' }}>
          정상 복구
        </button>
      </div>

      <SuspenseBoundary
        pendingFallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            ⏳ 로딩 중...
          </div>
        }
        errorFallback={
          <div
            style={{
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            ❌ 에러 발생 (콘솔과 로그 확인)
          </div>
        }
        onError={(error, errorInfo) => {
          const time = new Date().toLocaleTimeString();
          setErrorLog(prev => [
            `[${time}] ${error.message}`,
            ...prev.slice(0, 4),
          ]);

          // 실제 환경에서는 Sentry, Google Analytics 등으로 전송
          console.group('🚨 Error Tracked');
          console.error('Error:', error);
          console.error('Component Stack:', errorInfo.componentStack);
          console.groupEnd();
        }}
        resetKeys={[userId]}
      >
        <UserProfile userId={userId} />
      </SuspenseBoundary>

      {/* 에러 로그 */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: '#1f2937',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#e5e7eb',
          maxHeight: '150px',
          overflow: 'auto',
        }}
      >
        <strong style={{ color: '#fbbf24' }}>📊 에러 로그:</strong>
        {errorLog.length === 0 ? (
          <p style={{ margin: '8px 0 0 0', color: '#9ca3af' }}>
            에러를 발생시켜보세요
          </p>
        ) : (
          errorLog.map((line, i) => (
            <div key={i} style={{ padding: '4px 0' }}>
              {line}
            </div>
          ))
        )}
      </div>
    </ExampleSection>
  );
}

// ============================================
// 예제 5: ErrorBoundary (단독 사용)
// ============================================

function BuggyCalculator({ value }: { value: number }) {
  if (value < 0) {
    throw new Error('음수는 지원하지 않습니다!');
  }

  return (
    <div
      style={{
        padding: '20px',
        background: '#f0fdf4',
        borderRadius: '8px',
        border: '2px solid #10b981',
      }}
    >
      <p style={{ margin: 0, fontSize: '18px' }}>
        √{value} = <strong>{Math.sqrt(value).toFixed(2)}</strong>
      </p>
    </div>
  );
}

function Example5_ErrorBoundaryOnly() {
  const [value, setValue] = useState(16);

  return (
    <ExampleSection
      title="5. ErrorBoundary (단독 사용)"
      description="Suspense 없이 에러 처리만 필요할 때"
    >
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      >
        💡 <strong>일반(동기) 컴포넌트</strong>는 ErrorBoundary만 사용하세요.
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setValue(16)}>16 (정상)</button>
        <button onClick={() => setValue(25)} style={{ marginLeft: '8px' }}>
          25 (정상)
        </button>
        <button onClick={() => setValue(-1)} style={{ marginLeft: '8px' }}>
          -1 (에러)
        </button>
      </div>

      <ErrorBoundary
        fallback={(error, reset) => (
          <div
            style={{
              padding: '20px',
              background: '#fee2e2',
              borderRadius: '8px',
              border: '2px solid #ef4444',
            }}
          >
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>
              ❌ {error.message}
            </p>
            <button
              onClick={() => {
                setValue(16);
                reset();
              }}
            >
              초기화 (16으로)
            </button>
          </div>
        )}
        resetKeys={[value]}
      >
        <BuggyCalculator value={value} />
      </ErrorBoundary>
    </ExampleSection>
  );
}

// ============================================
// 예제 6: 중첩 사용 (에러 격리)
// ============================================

function Example6_Nested() {
  const [mainUserId, setMainUserId] = useState('1');
  const [widgetUserId, setWidgetUserId] = useState('1');

  return (
    <ExampleSection
      title="6. 중첩 사용 (에러 격리)"
      description="개별 컴포넌트의 에러가 전체 앱을 망가뜨리지 않음"
    >
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          background: '#e0f2fe',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      >
        💡 <strong>팁:</strong> 위젯 에러가 발생해도 메인 프로필은 정상
        작동합니다.
      </div>

      <ErrorBoundary fallback={<div>🚨 앱 전체 크래시!</div>}>
        {/* 메인 프로필 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
            메인 프로필
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <button onClick={() => setMainUserId('1')}>User 1</button>
            <button
              onClick={() => setMainUserId('error')}
              style={{ marginLeft: '8px' }}
            >
              에러
            </button>
          </div>

          <SuspenseBoundary
            pendingFallback={<div>⏳ 메인 로딩...</div>}
            errorFallback={
              <div style={{ padding: '16px', background: '#fee2e2' }}>
                ❌ 메인 에러
              </div>
            }
            resetKeys={[mainUserId]}
          >
            <UserProfile userId={mainUserId} />
          </SuspenseBoundary>
        </div>

        {/* 위젯 */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
            위젯 (독립 에러 처리)
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <button onClick={() => setWidgetUserId('1')}>User 1</button>
            <button
              onClick={() => setWidgetUserId('error')}
              style={{ marginLeft: '8px' }}
            >
              에러
            </button>
          </div>

          <ErrorBoundary
            fallback={
              <div
                style={{
                  padding: '16px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                }}
              >
                ⚠️ 위젯 에러 (메인은 정상!)
              </div>
            }
            resetKeys={[widgetUserId]}
          >
            <SuspenseBoundary
              pendingFallback={<div>⏳ 위젯 로딩...</div>}
              errorFallback={<div>❌ 위젯 에러</div>}
              resetKeys={[widgetUserId]}
            >
              <div
                style={{
                  padding: '12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '2px dashed #f59e0b',
                }}
              >
                <UserProfile userId={widgetUserId} />
              </div>
            </SuspenseBoundary>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </ExampleSection>
  );
}

// ============================================
// 메인 컴포넌트
// ============================================

export function SuspenseBoundaryExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        🔄 SuspenseBoundary & ErrorBoundary
      </h1>

      <div
        style={{
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          marginBottom: '40px',
          border: '2px solid #3b82f6',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
          비동기 작업의 <strong>로딩 + 에러</strong>를 선언적으로 처리하는
          컴포넌트 예제입니다.
          <br />각 예제를 직접 조작하면서 동작을 확인해보세요! 🚀
        </p>
      </div>

      <Example1_Basic />
      <Example2_FunctionFallback />
      <Example3_ResetKeys />
      <Example4_ErrorTracking />
      <Example5_ErrorBoundaryOnly />
      <Example6_Nested />

      <div style={{ height: '100px' }} />
    </div>
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
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#1f2937',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}
      >
        {description}
      </p>
      {children}
    </section>
  );
}
