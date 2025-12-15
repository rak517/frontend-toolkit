'use client';

import {
  useQueryParams,
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
  parseAsStringEnum,
} from '@frontend-toolkit-js/hooks';

const sortOptions = ['latest', 'oldest', 'popular'] as const;

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: '16px',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  marginRight: '8px',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '6px',
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

export default function QueryParamsPage() {
  const { page, search, sort, showCompleted, setParams } = useQueryParams({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
    sort: parseAsStringEnum(sortOptions).withDefault('latest'),
    showCompleted: parseAsBoolean.withDefault(false),
  });

  return (
    <div>
      <h2>useQueryParams Example</h2>
      <p>URL 쿼리 파라미터를 선언적으로 관리하는 Hook 예제입니다.</p>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>현재 상태</h3>
        <pre
          style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          {JSON.stringify({ page, search, sort, showCompleted }, null, 2)}
        </pre>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          현재 URL: <code>{typeof window !== 'undefined' ? window.location.search || '(없음)' : ''}</code>
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>페이지네이션</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setParams({ page: Math.max(1, page - 1) })}
            disabled={page <= 1}
            style={{ ...secondaryButton, opacity: page <= 1 ? 0.5 : 1 }}
          >
            이전
          </button>
          <span style={{ padding: '0 16px', fontWeight: 'bold' }}>
            {page} 페이지
          </span>
          <button
            onClick={() => setParams({ page: page + 1 })}
            style={secondaryButton}
          >
            다음
          </button>
          <button
            onClick={() => setParams({ page: 1 })}
            style={primaryButton}
          >
            첫 페이지로
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>검색</h3>
        <input
          type="text"
          placeholder="검색어 입력..."
          value={search}
          onChange={(e) => setParams({ search: e.target.value, page: 1 })}
          style={{ ...inputStyle, width: '200px' }}
        />
        {search && (
          <button
            onClick={() => setParams({ search: '', page: 1 })}
            style={secondaryButton}
          >
            초기화
          </button>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>정렬</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => setParams({ sort: option, page: 1 })}
              style={{
                ...buttonStyle,
                background: sort === option ? '#3b82f6' : '#e5e7eb',
                color: sort === option ? 'white' : '#374151',
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>필터</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setParams({ showCompleted: e.target.checked })}
          />
          <span>완료된 항목 표시</span>
        </label>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>History 옵션 테스트</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          replace (기본): 뒤로가기 히스토리에 안 쌓임
          <br />
          push: 뒤로가기로 이전 상태 복원 가능
        </p>
        <button
          onClick={() => setParams({ page: page + 1 }, { history: 'push' })}
          style={primaryButton}
        >
          다음 페이지 (push)
        </button>
        <button
          onClick={() => setParams({ page: page + 1 }, { history: 'replace' })}
          style={secondaryButton}
        >
          다음 페이지 (replace)
        </button>
      </div>
    </div>
  );
}
