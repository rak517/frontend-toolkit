---
name: use-hook
description: "frontend-toolkit의 훅을 탐색하고 사용법을 안내하는 스킬. MCP 서버의 list_hooks → get_hook_details 도구를 호출하여 훅 목록 조회, 상세 정보 확인, 코드 예시를 제공한다. '훅 사용법', '훅 목록', 'hook 어떻게 쓰지', '훅 찾아줘', 'use hook' 요청 시 반드시 이 스킬을 사용."
---

# Use Hook

frontend-toolkit 훅의 탐색 및 사용법 안내 스킬.
MCP 도구 2개를 호출하여 훅 목록 조회, 상세 분석, 사용 예시를 제공한다.

## 전제 조건
- MCP 서버(frontend-toolkit)가 Claude Code에 등록되어 있어야 한다
- `packages/hooks/src/` 디렉토리에 훅이 존재해야 한다

## 워크플로우

### Step 1: list_hooks — 전체 훅 목록 조회

MCP 도구 `list_hooks`를 호출한다:

```
도구: list_hooks
파라미터:
  hooksDir: "{process.cwd()}/packages/hooks/src"
```

**성공 응답 파싱:**
```json
{
  "hooks": [
    { "name": "useCalendar", "path": "/path/to/useCalendar", "hasTests": true, "hasReadme": false },
    { "name": "useDebounce", "path": "/path/to/useDebounce", "hasTests": true, "hasReadme": false }
  ],
  "total": 6
}
```

**사용자에게 훅 목록 표시:**

> **frontend-toolkit 훅 목록** ({total}개)
>
> | 훅 | 테스트 | README |
> |---|--------|--------|
> | useCalendar | O | X |
> | useDebounce | O | X |
> | ... | ... | ... |

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `DIRECTORY_NOT_FOUND` | "훅 디렉토리를 찾을 수 없습니다. packages/hooks/src/ 경로를 확인하세요." | 스킬 종료 |

### Step 2: 훅 추천

사용자의 요구사항을 분석하여 적합한 훅을 추천한다.

**추천 로직:**
1. 사용자가 특정 훅을 지목한 경우 → 해당 훅으로 바로 Step 3 진행
2. 사용자가 기능을 설명한 경우 → 훅 이름과 목적을 매칭하여 추천:

| 키워드 | 추천 훅 | 이유 |
|--------|--------|------|
| 달력, 날짜, 캘린더, calendar | useCalendar | 달력 UI 데이터 + 네비게이션 |
| 디바운스, debounce, 지연 | useDebounce | 값 디바운스 (검색 입력 등) |
| 디바운스 콜백, debounced callback | useDebouncedCallback | 콜백 함수 디바운스 |
| 퍼널, funnel, 스텝, wizard, 단계 | useFunnel | 다단계 폼/위자드 |
| 마운트, mount, 렌더링 여부 | useIsMounted | SSR 안전 마운트 감지 |
| URL, 쿼리, query params, 파라미터 | useQueryParams | URL 쿼리 파라미터 관리 |

3. 매칭되는 훅이 없는 경우 → 전체 목록을 보여주고 사용자에게 선택 요청
4. 여러 훅이 매칭되는 경우 → 후보를 모두 보여주고 사용자에게 선택 요청

### Step 3: get_hook_details — 선택된 훅 상세 분석

MCP 도구 `get_hook_details`를 호출한다:

```
도구: get_hook_details
파라미터:
  hookName: "{선택된 훅 이름}"
  hooksDir: "{process.cwd()}/packages/hooks/src"
```

**성공 응답 파싱:**
```json
{
  "name": "useCalendar",
  "mainFile": "/path/to/useCalendar.ts",
  "exports": ["useCalendar"],
  "dependencies": ["react", "date-fns"],
  "reactHooks": ["useState", "useCallback", "useMemo"]
}
```

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `HOOK_NOT_FOUND` | "'{hookName}' 훅을 찾을 수 없습니다. 훅 이름을 확인하세요." | Step 1의 목록을 다시 보여주고 재선택 요청 |
| `INVALID_NAME` | "올바른 훅 이름이 아닙니다. use로 시작하는 이름을 입력하세요." | 올바른 이름 재요청 |
| `PARSE_ERROR` | "훅 소스를 분석할 수 없습니다." | 직접 파일을 읽어서 수동 분석 |

### Step 4: 사용 예시 생성

get_hook_details의 응답 + 훅 소스 파일을 직접 읽어서 사용 예시를 생성한다.

**사용 예시 생성 템플릿:**

1. 훅 소스 파일(`mainFile`)을 Read 도구로 읽는다
2. 다음 정보를 추출한다:
   - 파라미터 타입 (Options 인터페이스)
   - 반환값 구조
   - JSDoc의 `@example` (있는 경우)
3. 사용자의 맥락에 맞는 코드 예시를 생성한다

**사용자에게 표시할 정보:**

> ## {hookName}
>
> **Import:**
> ```tsx
> import { {hookName} } from '@frontend-toolkit-js/hooks';
> ```
>
> **내부에서 사용하는 React 훅:** {reactHooks를 쉼표로 나열}
>
> **외부 의존성:** {dependencies를 쉼표로 나열}
>
> **Exports:** {exports를 쉼표로 나열}
>
> **기본 사용법:**
> ```tsx
> // 소스에서 추출한 파라미터와 반환값 기반 예시
> function MyComponent() {
>   const result = {hookName}({파라미터 예시});
>   return <div>{반환값 활용 예시}</div>;
> }
> ```
>
> **실제 코드 참조:** `packages/hooks/src/{hookName}/{hookName}.ts`

### 후속 질문 처리

사용자가 추가 질문을 하면:
- "다른 훅도 알려줘" → Step 1로 돌아가 목록 표시
- "{hookName}의 소스 보여줘" → Read 도구로 파일 직접 읽기
- "이 훅을 사용해서 {기능} 만들어줘" → 코드 생성 (이 스킬 범위 외, 직접 구현)
