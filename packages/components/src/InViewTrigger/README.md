<!-- packages/components/src/InViewTrigger/README.md -->

# InViewTrigger

Intersection Observer 기반 화면 진입/이탈 감지 컴포넌트

## 설치

```bash
npm install @frontend-toolkit-js/components
```

## 기본 사용법

```tsx
import { InViewTrigger } from '@frontend-toolkit-js/components';

<InViewTrigger onInView={() => console.log('화면에 보임!')}>
  <div>내용</div>
</InViewTrigger>;
```

---

## 주요 사용 사례

### 무한 스크롤

```tsx
<InViewTrigger onInView={loadMore} threshold={0.5}>
  <div>Loading...</div>
</InViewTrigger>
```

### 이미지 지연 로딩

```tsx
<InViewTrigger triggerOnce onInView={() => setLoaded(true)}>
  {loaded ? <img src={src} /> : <Skeleton />}
</InViewTrigger>
```

### 애니메이션 트리거

```tsx
<InViewTrigger
  onInView={() => setVisible(true)}
  onOutView={() => setVisible(false)}
>
  <motion.div animate={{ opacity: visible ? 1 : 0 }}>Fade In/Out</motion.div>
</InViewTrigger>
```

### 조회수 트래킹 (디바운스)

```tsx
<InViewTrigger
  triggerOnce
  debounce={1000}
  onInView={() => trackView(articleId)}
  threshold={0.8}
>
  <article>{content}</article>
</InViewTrigger>
```

---

## 주요 옵션

### threshold

얼마나 보여야 트리거할지 결정 (0.0 ~ 1.0)

```tsx
<InViewTrigger threshold={0.1} onInView={...} />   // 10% 보이면 실행
<InViewTrigger threshold={0.5} onInView={...} />   // 50% 보이면 실행
<InViewTrigger threshold={1.0} onInView={...} />   // 100% 보이면 실행
```

### triggerOnce

한 번만 실행 (지연 로딩에 유용)

```tsx
<InViewTrigger triggerOnce onInView={() => loadImage()}>
  <img src={imageUrl} />
</InViewTrigger>
```

### debounce

빠른 스크롤 시 불필요한 호출 방지 (밀리초)

```tsx
<InViewTrigger debounce={300} onInView={trackView}>
  <Article />
</InViewTrigger>
```

### rootMargin

감지 영역 확장/축소 (무한 스크롤에 유용)

```tsx
// 200px 전에 미리 로드
<InViewTrigger rootMargin="200px 0px" onInView={loadMore}>
  <LoadMoreButton />
</InViewTrigger>
```

---

## 성능 팁

### ✅ 좋은 패턴

```tsx
// 한 번만 실행 (triggerOnce)
<InViewTrigger triggerOnce onInView={loadImage} />

// 디바운스 활용
<InViewTrigger debounce={300} onInView={track} />

// 적절한 threshold
<InViewTrigger threshold={0.1} onInView={loadMore} />  // 미리 로드
```

### ❌ 피해야 할 패턴

```tsx
// 불필요한 매번 실행
<InViewTrigger onInView={loadImage} />  // triggerOnce 빠짐!

// 디바운스 없이 트래킹
<InViewTrigger onInView={track} />  // 빠른 스크롤 시 과도한 호출

// 너무 높은 threshold
<InViewTrigger threshold={1.0} onInView={loadMore} />  // 늦게 로드됨
```

---

## TypeScript

모든 props에 타입이 정의되어 있습니다.

```tsx
interface InViewTriggerProps {
  onInView: (entry: IntersectionObserverEntry) => void;
  onOutView?: (entry: IntersectionObserverEntry) => void;
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
  disabled?: boolean;
  debounce?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}
```

자세한 타입 정의는 IDE에서 자동 완성으로 확인하세요.

---

## 브라우저 지원

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

IE 11은 [intersection-observer](https://www.npmjs.com/package/intersection-observer) polyfill 필요

---

## 트러블슈팅

**Q: Observer가 동작하지 않아요**

A: 요소에 높이가 있는지 확인하세요

```tsx
// ❌ 높이가 0이면 감지 안 됨
<InViewTrigger onInView={...}>
  <div style={{ height: 0 }}>Content</div>
</InViewTrigger>

// ✅ 높이 지정
<InViewTrigger onInView={...}>
  <div style={{ minHeight: '100px' }}>Content</div>
</InViewTrigger>
```

**Q: 콜백이 너무 자주 실행돼요**

A: `debounce`를 추가하세요

```tsx
<InViewTrigger debounce={300} onInView={...}>
  <div>Content</div>
</InViewTrigger>
```

**Q: triggerOnce를 리셋하고 싶어요**

A: `disabled`를 토글하세요

```tsx
const [disabled, setDisabled] = useState(false);

// 리셋
setDisabled(true);
setTimeout(() => setDisabled(false), 0);
```

---

## 관련 문서

- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [GitHub Repository](https://github.com/rak517/frontend-toolkit)

## 라이선스

MIT © [rak517](https://github.com/rak517)
