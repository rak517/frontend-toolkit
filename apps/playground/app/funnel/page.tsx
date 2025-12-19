'use client';

import { useState, Suspense } from 'react';
import { useFunnel } from '@frontend-toolkit-js/hooks';
import { useNextAppAdapter } from '@frontend-toolkit-js/hooks/useFunnel/adapters/next-app';

interface SignUpContext {
  email?: string;
  name?: string;
  agreeToTerms?: boolean;
}

const steps = ['email', 'password', 'profile', 'done'] as const;
type Step = (typeof steps)[number];

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  maxWidth: '400px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  marginBottom: '12px',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '16px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  marginRight: '8px',
};

const primaryButton: React.CSSProperties = {
  ...buttonStyle,
  background: '#3b82f6',
  color: 'white',
};

const secondaryButton: React.CSSProperties = {
  ...buttonStyle,
  background: '#e5e7eb',
  color: '#374151',
};

function EmailStep({
  onNext,
  defaultValue,
}: {
  onNext: (email: string) => void;
  defaultValue?: string;
}) {
  const [email, setEmail] = useState(defaultValue || '');

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>1. 이메일 입력</h2>
      <p style={{ color: '#6b7280' }}>사용할 이메일을 입력해주세요</p>
      <input
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <button
        onClick={() => onNext(email)}
        disabled={!email.includes('@')}
        style={{
          ...primaryButton,
          opacity: email.includes('@') ? 1 : 0.5,
        }}
      >
        다음
      </button>
    </div>
  );
}

function PasswordStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const isValid = password.length >= 8 && password === confirm;

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>2. 비밀번호 설정</h2>
      <p style={{ color: '#6b7280' }}>8자 이상의 비밀번호를 설정해주세요</p>
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="비밀번호 확인"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        style={inputStyle}
      />
      {password && confirm && password !== confirm && (
        <p style={{ color: '#ef4444', fontSize: '14px' }}>
          비밀번호가 일치하지 않습니다
        </p>
      )}
      <div>
        <button onClick={onBack} style={secondaryButton}>
          이전
        </button>
        <button
          onClick={() => onNext()}
          disabled={!isValid}
          style={{ ...primaryButton, opacity: isValid ? 1 : 0.5 }}
        >
          다음
        </button>
      </div>
    </div>
  );
}

function ProfileStep({
  onNext,
  onBack,
}: {
  onNext: (name: string, agreeToTerms: boolean) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const isValid = name.trim().length > 0 && agreeToTerms;

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>3. 프로필 설정</h2>
      <p style={{ color: '#6b7280' }}>이름과 약관 동의를 확인해주세요</p>
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle}
      />
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={e => setAgreeToTerms(e.target.checked)}
        />
        <span>이용약관에 동의합니다</span>
      </label>
      <div>
        <button onClick={onBack} style={secondaryButton}>
          이전
        </button>
        <button
          onClick={() => onNext(name, agreeToTerms)}
          disabled={!isValid}
          style={{ ...primaryButton, opacity: isValid ? 1 : 0.5 }}
        >
          가입 완료
        </button>
      </div>
    </div>
  );
}

function DoneStep({
  context,
  onReset,
}: {
  context: SignUpContext;
  onReset: () => void;
}) {
  return (
    <div style={{ ...cardStyle, textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>가입 완료</div>
      <h2 style={{ marginTop: 0 }}>환영합니다!</h2>
      <p style={{ color: '#6b7280' }}>
        <strong>{context.name}</strong>님, 환영합니다!
      </p>
      <div
        style={{
          background: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'left',
          marginBottom: '16px',
        }}
      >
        <p style={{ margin: '4px 0' }}>
          <strong>이메일:</strong> {context.email}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>이름:</strong> {context.name}
        </p>
      </div>
      <button onClick={onReset} style={primaryButton}>
        처음부터 다시
      </button>
    </div>
  );
}

function MemoryAdapterExample() {
  const funnel = useFunnel<Step, SignUpContext>(steps, {
    initialStep: 'email',
    initialContext: {},
  });

  return (
    <div>
      <h3>Memory Adapter (기본)</h3>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        메모리에만 상태 저장. 새로고침 시 초기화됩니다.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background:
                steps.indexOf(funnel.currentStep) >= i ? '#3b82f6' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      <funnel.Funnel>
        <funnel.Step name="email">
          <EmailStep
            defaultValue={funnel.context.email}
            onNext={email => funnel.history.push('password', { email })}
          />
        </funnel.Step>

        <funnel.Step name="password">
          <PasswordStep
            onNext={() => funnel.history.push('profile')}
            onBack={() => funnel.history.back()}
          />
        </funnel.Step>

        <funnel.Step name="profile">
          <ProfileStep
            onNext={(name, agreeToTerms) =>
              funnel.history.push('done', { name, agreeToTerms })
            }
            onBack={() => funnel.history.back()}
          />
        </funnel.Step>

        <funnel.Step name="done">
          <DoneStep
            context={funnel.context}
            onReset={() => funnel.history.replace('email', {})}
          />
        </funnel.Step>
      </funnel.Funnel>
    </div>
  );
}

function NextAppAdapterExample() {
  const adapter = useNextAppAdapter();
  const funnel = useFunnel<Step, SignUpContext>(steps, {
    initialStep: 'email',
    initialContext: {},
    adapter,
  });

  return (
    <div>
      <h3>Next.js App Router Adapter (URL 동기화)</h3>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        Next.js App Router용 어댑터. URL 쿼리파라미터와 동기화!
        <br />
        현재 URL: <code>?step={funnel.currentStep}&context=...</code>
      </p>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background:
                steps.indexOf(funnel.currentStep) >= i ? '#10b981' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      <funnel.Funnel>
        <funnel.Step name="email">
          <EmailStep
            defaultValue={funnel.context.email}
            onNext={email => funnel.history.push('password', { email })}
          />
        </funnel.Step>

        <funnel.Step name="password">
          <PasswordStep
            onNext={() => funnel.history.push('profile')}
            onBack={() => funnel.history.back()}
          />
        </funnel.Step>

        <funnel.Step name="profile">
          <ProfileStep
            onNext={(name, agreeToTerms) =>
              funnel.history.push('done', { name, agreeToTerms })
            }
            onBack={() => funnel.history.back()}
          />
        </funnel.Step>

        <funnel.Step name="done">
          <DoneStep
            context={funnel.context}
            onReset={() => funnel.history.replace('email', {})}
          />
        </funnel.Step>
      </funnel.Funnel>
    </div>
  );
}

export default function FunnelPage() {
  const [adapterType, setAdapterType] = useState<'memory' | 'next-app'>(
    'memory'
  );

  return (
    <div>
      <h2>useFunnel Example</h2>
      <p>단계별 UI 흐름(퍼널)을 관리하는 Hook 예제입니다.</p>

      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setAdapterType('memory')}
          style={{
            ...buttonStyle,
            background: adapterType === 'memory' ? '#3b82f6' : '#e5e7eb',
            color: adapterType === 'memory' ? 'white' : '#374151',
          }}
        >
          Memory Adapter
        </button>
        <button
          onClick={() => setAdapterType('next-app')}
          style={{
            ...buttonStyle,
            background: adapterType === 'next-app' ? '#10b981' : '#e5e7eb',
            color: adapterType === 'next-app' ? 'white' : '#374151',
          }}
        >
          Next.js App Router
        </button>
      </div>

      {adapterType === 'memory' ? (
        <MemoryAdapterExample />
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <NextAppAdapterExample />
        </Suspense>
      )}
    </div>
  );
}
