---
name: mcp-dev-orchestrator
description: "frontend-toolkit MCP 서버 개발을 조율하는 오케스트레이터. MCP 도구 구현, frontend-mcp-kit 코드 이식, 테스트, 리뷰를 파이프라인으로 실행한다. 'MCP 개발', 'MCP 서버 구현', '도구 구현 시작', '파이프라인 실행', 'MCP 빌드' 요청 시 반드시 이 스킬을 사용. 후속: MCP 결과 수정, 부분 재실행, 업데이트, 보완, 다시 실행, 이전 결과 개선 시에도 반드시 이 스킬을 사용."
---

# MCP Dev Orchestrator

frontend-toolkit MCP 서버 개발 에이전트를 조율하는 오케스트레이터.

## 실행 모드: 서브 에이전트

## 에이전트 구성

| 에이전트 | subagent_type | 역할 | 스킬 | 출력 |
|---------|--------------|------|------|------|
| mcp-builder | mcp-builder | MCP 도구 구현 | create-mcp-tool | 도구 .ts 파일 |
| integrator | integrator | 코드 복사+적응 | adapt-from-mcp-kit | 적응된 파일들 |
| tester | tester | 테스트 작성+실행 | test-mcp-tool | 테스트 파일 + 결과 |
| reviewer | reviewer | 코드 리뷰+검증 | — (인라인 규칙) | 리뷰 보고서 |

## 워크플로우

### Phase 0: 컨텍스트 확인
1. `packages/mcp-server/` 존재 여부 확인
2. 실행 모드 결정:
   - **미존재** → Phase 1(패키지 scaffold)부터 시작
   - **존재 + 도구 추가 요청** → Phase 3으로 건너뜀
   - **존재 + 코드 이식 요청** → Phase 2로 건너뜀
   - **존재 + 테스트/리뷰 요청** → Phase 4/5로 건너뜀

### Phase 1: 패키지 scaffold
메인(오케스트레이터)이 직접 수행:
1. packages/mcp-server/ 디렉토리 + package.json + tsconfig.json + src/index.ts 생성
2. 도메인 디렉토리: src/tools/hooks/, src/tools/components/, src/tools/test/, src/runners/, src/utils/
3. 테스트 디렉토리: src/__tests__/tools/hooks/, src/__tests__/tools/components/, src/__tests__/tools/test/, src/__tests__/integration/
4. pnpm install

### Phase 2: 코드 이식 (integrator)
Agent(subagent_type: "integrator", model: "opus") — adapt-from-mcp-kit 스킬을 따라 실행.

### Phase 3: 도구 구현 (mcp-builder)
구현 순서 (의존성 기반):
1~3 병렬: list_hooks, get_hook_details, list_components
4~7: scaffold_hook, register_hook (병렬), review_hook → validate_hook (순차)

### Phase 4: 테스트 (tester)
Agent(subagent_type: "tester", model: "opus") — test-mcp-tool 스킬을 따라 실행.

### Phase 5: 리뷰 (reviewer)
Agent(subagent_type: "reviewer", model: "opus") — 구조 검증 + eng-review D1~D9 정합성.

### Phase 6: 정리
WARN/FAIL 수정, 최종 테스트, 결과 요약 보고.

## 데이터 흐름
```
[오케스트레이터]
    ├── Phase 1: 직접 scaffold
    ├── Phase 2: Agent(integrator) → 적응된 파일들
    ├── Phase 3: Agent(mcp-builder) × N → 도구 파일들
    ├── Phase 4: Agent(tester) → 테스트 파일 + 결과
    ├── Phase 5: Agent(reviewer) → 리뷰 보고서
    └── Phase 6: 수정 + 최종 확인
```

## 에러 핸들링

| 상황 | 전략 | 구체적 동작 |
|------|------|-----------|
| mcp-builder 실패 | 1회 재시도 | 에러 메시지를 포함한 프롬프트로 같은 에이전트를 다시 디스패치. 2회 연속 실패 시 `[SKIPPED] {도구명}: {에러}` 보고 후 다음 Phase로 진행 |
| integrator 타입 체크 실패 | 수정 재시도 (최대 2회) | tsc 에러 출력을 integrator에게 전달하여 수정 요청. 2회 실패 시 보고 |
| tester 테스트 실패 | 피드백 루프 | 실패한 테스트명 + assertion 에러를 mcp-builder에게 전달하여 구현 수정 요청. 수정 후 tester 재실행 (최대 2회 루프) |
| reviewer FAIL | 수정 전달 | FAIL 항목의 구체적 사유를 해당 에이전트에 전달하여 수정 후 reviewer 재실행 |

## 테스트 시나리오

### 정상 흐름
1. "MCP 서버 구현 시작" → Phase 0~6 순차 실행 → 결과 요약

### 에러 흐름
1. Phase 3에서 validate_hook 실패 → vitest-runner 적응 문제 → integrator 재요청 → 재시도
