import { useState } from 'react';
import { InViewTrigger } from '@frontend-toolkit-js/components';

export function InViewTriggerExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔭 InViewTrigger 예제</h1>

      {/* 스크롤 가이드 */}
      <div
        style={{
          padding: '20px',
          background: '#f0f9ff',
          borderRadius: '8px',
          marginBottom: '40px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px' }}>
          👇 아래로 스크롤해서 각 박스가 화면에 들어오는 걸 확인해보세요!
        </p>
      </div>

      {/* 1. 기본 사용 */}
      <Section1_Basic />

      {/* 2. 한 번만 실행 (triggerOnce) */}
      <Section2_TriggerOnce />

      {/* 3. 지연 실행 (debounce) */}
      <Section3_Debounce />

      {/* 4. 진입/이탈 감지 */}
      <Section4_EnterExit />

      {/* 5. 무한 스크롤 */}
      <Section5_InfiniteScroll />

      {/* 6. 지연 로딩 */}
      <Section6_LazyLoad />

      {/* 하단 여백 */}
      <div style={{ height: '100vh' }} />
    </div>
  );
}

// ============================================
// 예제 1: 기본 사용
// ============================================
function Section1_Basic() {
  const [count, setCount] = useState(0);

  return (
    <ExampleSection
      title="1. 기본 사용"
      description="화면에 보일 때마다 카운트 증가"
    >
      <InViewTrigger onInView={() => setCount(c => c + 1)} threshold={0.5}>
        <Box>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}번</p>
          <p style={{ fontSize: '14px', color: '#666' }}>화면에 보였습니다</p>
        </Box>
      </InViewTrigger>
    </ExampleSection>
  );
}

// ============================================
// 예제 2: 한 번만 실행
// ============================================
function Section2_TriggerOnce() {
  const [triggered, setTriggered] = useState(false);

  return (
    <ExampleSection
      title="2. 한 번만 실행 (triggerOnce)"
      description="처음 화면에 보일 때 딱 한 번만 실행"
    >
      <InViewTrigger
        triggerOnce
        onInView={() => setTriggered(true)}
        threshold={0.5}
      >
        <Box
          style={{
            background: triggered ? '#10b981' : '#e5e7eb',
            color: triggered ? 'white' : '#374151',
            transition: 'all 0.3s',
          }}
        >
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {triggered ? '✅ 활성화됨!' : '⏳ 대기 중...'}
          </p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            {triggered ? '한 번만 실행되었습니다' : '스크롤해서 활성화하세요'}
          </p>
        </Box>
      </InViewTrigger>
    </ExampleSection>
  );
}

// ============================================
// 예제 3: 지연 실행 (디바운스)
// ============================================
function Section3_Debounce() {
  const [lastTime, setLastTime] = useState<string>('없음');

  return (
    <ExampleSection
      title="3. 지연 실행 (debounce: 500ms)"
      description="화면에 보인 후 500ms 후에 실행 (빠른 스크롤 시 불필요한 호출 방지)"
    >
      <InViewTrigger
        debounce={500}
        onInView={() => {
          setLastTime(new Date().toLocaleTimeString());
        }}
        threshold={0.5}
      >
        <Box>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>⏱️ 지연 실행</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            마지막 실행: {lastTime}
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            빠르게 스크롤하면 실행 안 됨!
          </p>
        </Box>
      </InViewTrigger>
    </ExampleSection>
  );
}

// ============================================
// 예제 4: 진입/이탈 감지
// ============================================
function Section4_EnterExit() {
  const [status, setStatus] = useState<'outside' | 'inside'>('outside');

  return (
    <ExampleSection
      title="4. 진입/이탈 감지"
      description="화면에 들어오고 나갈 때 모두 감지"
    >
      <InViewTrigger
        onInView={() => setStatus('inside')}
        onOutView={() => setStatus('outside')}
        threshold={0.5}
      >
        <Box
          style={{
            background: status === 'inside' ? '#3b82f6' : '#6b7280',
            color: 'white',
            transition: 'all 0.3s',
          }}
        >
          <p style={{ fontSize: '24px' }}>
            {status === 'inside' ? '👀 보임' : '🙈 안 보임'}
          </p>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            상태: {status === 'inside' ? '화면 안' : '화면 밖'}
          </p>
        </Box>
      </InViewTrigger>
    </ExampleSection>
  );
}

// ============================================
// 예제 5: 무한 스크롤
// ============================================
function Section5_InfiniteScroll() {
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    if (loading) return;

    setLoading(true);

    // 1초 후 새 아이템 추가 (API 호출 시뮬레이션)
    setTimeout(() => {
      setItems(prev => [
        ...prev,
        prev.length + 1,
        prev.length + 2,
        prev.length + 3,
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <ExampleSection
      title="5. 무한 스크롤"
      description="하단에 도달하면 자동으로 더 로드"
    >
      <div
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        {items.map(item => (
          <div
            key={item}
            style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          >
            아이템 #{item}
          </div>
        ))}

        {/* 트리거 */}
        <InViewTrigger onInView={loadMore} threshold={0.1}>
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            {loading ? '로딩 중...' : '👇 더 보기'}
          </div>
        </InViewTrigger>
      </div>
    </ExampleSection>
  );
}

// ============================================
// 예제 6: 지연 로딩
// ============================================
function Section6_LazyLoad() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <ExampleSection
      title="6. 지연 로딩 (이미지)"
      description="화면에 보일 때 이미지 로드"
    >
      <InViewTrigger
        triggerOnce
        onInView={() => setImageLoaded(true)}
        threshold={0.3}
      >
        <div
          style={{
            width: '100%',
            height: '200px',
            background: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {imageLoaded ? (
            <img
              src="https://picsum.photos/400/200"
              alt="Lazy loaded"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px' }}>🖼️</div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                이미지 대기 중...
              </p>
            </div>
          )}
        </div>
      </InViewTrigger>
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
    <section style={{ marginBottom: '80px' }}>
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

interface BoxProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function Box({ children, style }: BoxProps) {
  return (
    <div
      style={{
        padding: '40px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        textAlign: 'center',
        background: 'white',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
