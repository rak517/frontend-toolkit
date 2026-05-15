---
name: create-hook
description: "새 React 훅을 생성하는 파이프라인. MCP 서버의 scaffold_hook → review_hook → validate_hook → register_hook 도구를 순차 호출하여 훅을 처음부터 끝까지 생성한다. '훅 만들어', '새 훅', 'create hook', 'hook 생성' 요청 시 반드시 이 스킬을 사용."
---

# Create Hook

> **Phase 2 stub** — MCP 서버 도구 완성 후 구현 예정.

새 React 훅을 생성하는 파이프라인 스킬.

## 파이프라인
1. `scaffold_hook` — 디렉토리 + 템플릿 파일 생성
2. AI가 훅 구현 코드 작성 (기존 컨벤션 기반)
3. `review_hook` — 구조적 검증 (디렉토리, 파일 명명, barrel export)
4. AI 품질 검증 — React hooks best practice, 안티패턴 검사
5. `validate_hook` — vitest 실행으로 테스트 통과 확인
6. `register_hook` — barrel export 업데이트

## 전제 조건
- packages/mcp-server/의 MCP 도구들이 모두 구현되어 있어야 한다
- MCP 서버가 Claude Code에 등록되어 있어야 한다

## TODO (Phase 2)
- [ ] 각 MCP 도구 호출 방법 상세 기술
- [ ] AI 구현 단계의 프롬프트 템플릿 작성
- [ ] AI 품질 검증 규칙 목록 작성
- [ ] 에러 시 롤백 로직 정의
