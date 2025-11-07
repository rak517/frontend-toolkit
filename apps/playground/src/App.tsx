import { useState } from 'react';
import { CalendarExample } from './CalendarExample';
// import { useDebounce } from '@frontend-toolkit/hooks';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🧰 Frontend Toolkit Playground</h1>
      <p>개발 및 테스트를 위한 환경입니다.</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>예제</h2>
        <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      </div>

      <div style={{ marginTop: '2rem', color: '#666' }}>
        <p>🚧 훅과 컴포넌트가 추가되면 여기서 테스트할 수 있습니다.</p>
        <CalendarExample />
      </div>
    </div>
  );
}

export default App;
