# @frontend-toolkit-js/components

선언적이고 타입 안전한 React 컴포넌트 라이브러리

[![npm version](https://badge.fury.io/js/%40frontend-toolkit-js%2Fcomponents.svg)](https://www.npmjs.com/package/@frontend-toolkit-js/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 설치

```bash
npm install @frontend-toolkit-js/components
# or
pnpm add @frontend-toolkit-js/components
# or
yarn add @frontend-toolkit-js/components
```

## 특징

- ✅ **선언적 API** - 무엇을 할지만 표현
- ✅ **TypeScript 완벽 지원** - strict mode 100%
- ✅ **작은 번들 크기** - Tree-shaking 지원
- ✅ **제로 의존성** - React만 필요

---

## 컴포넌트

### InViewTrigger

Intersection Observer 기반 화면 진입/이탈 감지 컴포넌트

```tsx
import { InViewTrigger } from '@frontend-toolkit-js/components';

// 기본 사용
<InViewTrigger onInView={() => console.log('화면에 보임!')}>
  <div>내용</div>
</InViewTrigger>

// 무한 스크롤
<InViewTrigger onInView={loadMore}>
  <LoadingIndicator />
</InViewTrigger>

// 이미지 지연 로딩
<InViewTrigger triggerOnce onInView={() => setLoaded(true)}>
  {loaded ? <img src={src} /> : <Skeleton />}
</InViewTrigger>
```

**주요 Props**:

- `onInView` - 화면 진입 시 콜백 (필수)
- `threshold` - 가시성 임계값 (0.0 ~ 1.0)
- `triggerOnce` - 한 번만 실행
- `debounce` - 지연 시간 (ms)

[📖 자세한 문서](./src/InViewTrigger/README.md)

---

## 개발 중

다음 컴포넌트들이 추가될 예정입니다:

- `LazyImage` - 이미지 지연 로딩
- `VirtualScroll` - 가상 스크롤
- `Portal` - Portal 래퍼

---

## TypeScript

모든 컴포넌트는 TypeScript로 작성되었으며 타입 정의가 포함되어 있습니다.

```tsx
<InViewTrigger
  onInView={entry => {
    // entry: IntersectionObserverEntry (자동 추론)
    console.log(entry.intersectionRatio);
  }}
>
  <div>내용</div>
</InViewTrigger>
```

---

## 브라우저 지원

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

IE 11은 [intersection-observer](https://www.npmjs.com/package/intersection-observer) polyfill 필요

---

## 관련 패키지

- [@frontend-toolkit-js/hooks](../hooks) - React Hooks 라이브러리
- [@frontend-toolkit-js/utils](../utils) - 유틸리티 함수 라이브러리

---

## 개발

```bash
pnpm dev        # 개발 모드
pnpm build      # 빌드
pnpm test       # 테스트
```

---

## 라이선스

MIT © [rak517](https://github.com/rak517)
