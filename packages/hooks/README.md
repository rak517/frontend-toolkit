# @frontend-toolkit/hooks

타입 안전하고 선언적인 React 훅 라이브러리

[![npm version](https://badge.fury.io/js/%40frontend-toolkit%2Fhooks.svg)](https://www.npmjs.com/package/@frontend-toolkit/hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 설치

```bash
npm install @frontend-toolkit-js/hooks
# or
pnpm add @frontend-toolkit-js/hooks
# or
yarn add @frontend-toolkit-js/hooks
```

## 특징

- ✅ TypeScript strict mode 100%
- ✅ 제네릭으로 타입 자동 추론
- ✅ Tree-shaking 지원
- ✅ 자동 cleanup (메모리 누수 방지)

## Hooks

### `useCalendar`

달력 데이터와 네비게이션을 제공합니다. UI는 완전히 사용자가 제어합니다.

```tsx
import { useCalendar } from '@frontend-toolkit/hooks';

function Calendar() {
  const cal = useCalendar({ weekStartsOn: 1 }); // 월요일 시작

  return (
    <div>
      <button onClick={cal.prev}>◀</button>
      <h2>{cal.currentDate.toLocaleDateString('ko-KR')}</h2>
      <button onClick={cal.next}>▶</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cal.days.map((day, i) => (
          <div
            key={i}
            style={{
              opacity: day.isCurrentMonth ? 1 : 0.3,
              fontWeight: day.isToday ? 'bold' : 'normal',
            }}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**옵션:** `defaultDate`, `weekStartsOn` (0=일요일, 1=월요일)

**반환값:** `days`, `weekdays`, `currentDate`, `prev`, `next`, `today`, `setDate`

[전체 API 문서 →](./src/useCalendar/README.md)

## 개발 예정

- `useDebounce` - 디바운스된 값 반환
- `useBoolean` - boolean 상태 관리
- `useLocalStorage` - 타입 안전한 localStorage
- `useFetch` - 선언적 데이터 페칭

## TypeScript

모든 훅은 TypeScript로 작성되었으며 타입이 자동으로 추론됩니다.

```tsx
const cal = useCalendar();
//    ^? { days: CalendarDay[], weekdays: Weekday[], ... }
```

## 브라우저 지원

- 모던 브라우저 (ES2020+)
- React 18+

## 라이선스

MIT © [rak517](https://github.com/rak517)

## 링크

- [문서](https://github.com/rak517/frontend-toolkit)
- [이슈](https://github.com/rak517/frontend-toolkit/issues)
- [변경 이력](./CHANGELOG.md)
