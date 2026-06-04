---
name: create-hook
description: "새 React 훅을 생성하는 파이프라인. MCP 서버의 scaffold_hook → review_hook → validate_hook → register_hook 도구를 순차 호출하여 훅을 처음부터 끝까지 생성한다. '훅 만들어', '새 훅', 'create hook', 'hook 생성' 요청 시 반드시 이 스킬을 사용."
---

# Create Hook

새 React 훅을 생성하는 파이프라인 스킬.
6단계 파이프라인으로 MCP 도구 4개를 호출하여 훅을 처음부터 끝까지 생성한다.

## 전제 조건
- MCP 서버(frontend-toolkit)가 Claude Code에 등록되어 있어야 한다
- `packages/hooks/src/` 디렉토리가 존재해야 한다

## 입력 수집

사용자로부터 다음 정보를 확인한다:
1. **hookName** (필수): `use`로 시작하는 훅 이름 (예: `useCounter`)
   - `use` + 대문자로 시작해야 한다 (`useCounter` O, `usecounter` X)
   - 영숫자만 허용 (`useQuery-Params` X)
2. **훅의 목적** (필수): 어떤 기능을 하는 훅인지 (예: "카운터 상태 관리", "API 데이터 페칭")
3. **파라미터** (선택): 훅이 받을 파라미터 (예: `initialCount: number`)
4. **반환값** (선택): 훅이 반환할 값 구조 (예: `{ count, increment, decrement }`)

hookName이 제공되지 않았으면 사용자에게 물어본다.
hooksDir는 항상 `{process.cwd()}/packages/hooks/src`로 고정한다.

## 파이프라인

### Step 1: scaffold_hook — 디렉토리 + 템플릿 파일 생성

MCP 도구 `scaffold_hook`을 호출한다:

```
도구: scaffold_hook
파라미터:
  hookName: "{사용자가 제공한 훅 이름}"
  hooksDir: "{process.cwd()}/packages/hooks/src"
```

**성공 응답 파싱:**
```json
{
  "created": {
    "hookFile": "/path/to/useCounter/useCounter.ts",
    "testFile": "/path/to/useCounter/useCounter.test.ts",
    "indexFile": "/path/to/useCounter/index.ts"
  },
  "hookName": "useCounter"
}
```

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `HOOK_EXISTS` | "이미 '{hookName}' 훅이 존재합니다. 다른 이름을 선택하거나, 기존 훅을 수정하려면 직접 편집하세요." | 파이프라인 중단 |
| `INVALID_NAME` | "훅 이름은 use로 시작하고 영숫자만 포함해야 합니다. (예: useCounter)" | 올바른 이름을 다시 요청 |
| `WRITE_ERROR` | "파일 생성에 실패했습니다: {message}" | 파이프라인 중단 |

**성공 시 사용자에게 보고:**
> scaffold 완료: `packages/hooks/src/{hookName}/` 디렉토리에 3개 파일이 생성되었습니다.
> - `{hookName}.ts` (훅 본체)
> - `{hookName}.test.ts` (테스트)
> - `index.ts` (re-export)

### Step 2: AI 구현 — 훅 코드 작성

scaffold가 생성한 템플릿 파일(`{hookName}.ts`)을 실제 구현 코드로 채운다.
이 단계는 MCP 도구가 아닌 Claude Code가 직접 수행한다.

**구현 시 참고할 컨벤션:**
1. 기존 훅 패턴을 참조한다:
   - `packages/hooks/src/useCalendar/useCalendar.ts` — 복잡한 상태 관리 예시
   - `packages/hooks/src/useDebounce/useDebounce.ts` — 단순 유틸리티 훅 예시
2. JSDoc 주석을 작성한다: `@param`, `@returns`, `@example` 포함
3. 타입은 같은 디렉토리의 별도 파일(`types.ts`)로 분리하거나, 간단하면 인라인 정의
4. 테스트 파일(`{hookName}.test.ts`)도 실제 동작에 맞게 업데이트한다:
   - `renderHook`으로 훅 호출
   - 반환값 검증
   - 상태 변경 시 `act()` 사용
   - 에러 케이스 검증

**구현 완료 기준:**
- `{hookName}.ts`에 실제 로직이 구현됨
- `{hookName}.test.ts`에 의미 있는 테스트가 작성됨
- TypeScript 타입이 올바르게 정의됨

### Step 3: review_hook — 구조적 검증

MCP 도구 `review_hook`을 호출한다:

```
도구: review_hook
파라미터:
  hookName: "{hookName}"
  hooksDir: "{process.cwd()}/packages/hooks/src"
```

**성공 응답 파싱:**
```json
{
  "hookName": "useCounter",
  "mainFile": "/path/to/useCounter.ts",
  "findings": [
    { "rule": "naming", "severity": "error", "message": "...", "line": 5 }
  ],
  "summary": { "errors": 0, "warnings": 1, "suggestions": 0 }
}
```

**결과 처리:**
- `summary.errors > 0`: 에러 내용을 사용자에게 보고하고, Step 2로 돌아가 수정 후 다시 review
- `summary.errors === 0`: 경고/제안이 있어도 다음 단계로 진행 (경고는 사용자에게 보고)
- 최대 2회 재시도. 2회 실패 시 사용자에게 에러 목록을 보여주고 수동 수정 요청

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `HOOK_NOT_FOUND` | "훅 파일을 찾을 수 없습니다. scaffold가 정상 완료되었는지 확인하세요." | 파이프라인 중단, Step 1부터 재시작 제안 |
| `PARSE_ERROR` | "훅 소스를 분석할 수 없습니다. TypeScript 구문 오류를 확인하세요." | Step 2로 돌아가 수정 |

### Step 4: AI 품질 검증 — Best Practice 검사

이 단계는 MCP 도구가 아닌 Claude Code가 직접 수행한다 (eng-review D4: 구조적 검증은 MCP, AI 판단은 스킬).

**검증 규칙:**
1. **Rules of Hooks 준수**: 조건문/반복문 내에서 훅 호출 금지 (review_hook의 conditional-hook 규칙과 중복이지만, AI가 더 정교하게 감지)
2. **의존성 배열 완전성**: useEffect/useCallback/useMemo의 deps 배열에 사용되는 모든 변수가 포함되어 있는지
3. **메모리 누수 방지**: useEffect cleanup 함수가 필요한 곳에 있는지 (타이머, 이벤트 리스너, 구독)
4. **불변성 유지**: 상태를 직접 변경하지 않는지 (예: `state.push()` 대신 `[...state, item]`)
5. **타입 안전성**: any 사용 금지, 반환 타입 명시

**결과 처리:**
- 문제 발견 시 직접 수정하고 수정 내용을 사용자에게 보고
- 수정 후 Step 3(review_hook)을 다시 실행하여 구조적 검증 재확인

### Step 5: validate_hook — 테스트 실행

MCP 도구 `validate_hook`을 호출한다:

```
도구: validate_hook
파라미터:
  hookName: "{hookName}"
  hooksDir: "{process.cwd()}/packages/hooks/src"
  timeout: 30
```

**성공 응답 파싱:**
```json
{
  "hookName": "useCounter",
  "success": true,
  "framework": "vitest",
  "summary": { "total": 3, "passed": 3, "failed": 0, "skipped": 0 },
  "results": [...],
  "error": null
}
```

**결과 처리:**
- `success === true`: 다음 단계로 진행
- `success === false`: 실패한 테스트 내용을 분석하고 Step 2로 돌아가 수정
  - 구현 코드 문제 → `{hookName}.ts` 수정
  - 테스트 코드 문제 → `{hookName}.test.ts` 수정
  - 수정 후 validate_hook 재실행 (최대 2회 루프)

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `HOOK_NOT_FOUND` | "훅 또는 테스트 파일을 찾을 수 없습니다." | 파이프라인 중단 |
| `VITEST_NOT_FOUND` | "프로젝트 루트를 찾을 수 없습니다. 모노레포 루트에서 실행 중인지 확인하세요." | 파이프라인 중단 |

### Step 6: register_hook — barrel export 등록

MCP 도구 `register_hook`을 호출한다:

```
도구: register_hook
파라미터:
  hookName: "{hookName}"
  hooksDir: "{process.cwd()}/packages/hooks/src"
```

**성공 응답 파싱:**
```json
{
  "registered": true,
  "hookName": "useCounter",
  "indexPath": "/path/to/index.ts",
  "exportLine": "export * from './useCounter';"
}
```

**에러 처리:**
| 에러 코드 | 사용자 안내 | 다음 행동 |
|----------|-----------|----------|
| `ALREADY_REGISTERED` | "이미 barrel export에 등록되어 있습니다." | 경고 표시 후 정상 완료 처리 |
| `INDEX_NOT_FOUND` | "barrel export 파일(index.ts)을 찾을 수 없습니다." | 사용자에게 수동 등록 안내 |
| `HOOK_NOT_FOUND` | "훅 디렉토리를 찾을 수 없습니다." | 파이프라인 중단 |

**성공 시 사용자에게 보고:**
> 훅 생성 완료!
>
> **생성된 파일:**
> - `packages/hooks/src/{hookName}/{hookName}.ts` — 훅 구현
> - `packages/hooks/src/{hookName}/{hookName}.test.ts` — 테스트
> - `packages/hooks/src/{hookName}/index.ts` — re-export
>
> **검증 결과:**
> - 구조 검증: errors {N}, warnings {N}, suggestions {N}
> - 테스트: {passed}/{total} 통과
> - barrel export: 등록 완료
>
> 사용법: `import { {hookName} } from '@frontend-toolkit-js/hooks';`

## 롤백 정책

파이프라인 중단 시 이미 생성된 파일을 정리해야 할 수 있다.

| 중단 시점 | 정리 대상 | 방법 |
|----------|----------|------|
| Step 1 실패 | 없음 | scaffold_hook이 자체 cleanup 수행 |
| Step 2~5 실패 | `packages/hooks/src/{hookName}/` 디렉토리 | 사용자에게 삭제 여부 확인 후 `rm -rf` |
| Step 6 실패 | 파일은 유지, barrel export만 미등록 상태 | 사용자에게 수동 등록 안내 |

**중요:** 롤백(디렉토리 삭제)은 반드시 사용자 확인 후 수행한다. 사용자가 이미 코드를 수정했을 수 있으므로.
