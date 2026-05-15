---
name: use-hook
description: "frontend-toolkit의 훅을 탐색하고 사용법을 안내하는 스킬. MCP 서버의 list_hooks → get_hook_details 도구를 호출하여 훅 목록 조회, 상세 정보 확인, 코드 예시를 제공한다. '훅 사용법', '훅 목록', 'hook 어떻게 쓰지', '훅 찾아줘', 'use hook' 요청 시 반드시 이 스킬을 사용."
---

# Use Hook

> **Phase 2 stub** — MCP 서버 도구 완성 후 구현 예정.

frontend-toolkit 훅의 탐색 및 사용법 안내 스킬.

## 워크플로우
1. `list_hooks` — 전체 훅 목록 + 시그니처 조회
2. 사용자의 요구사항에 맞는 훅 추천
3. `get_hook_details` — 선택된 훅의 구현, 테스트, 사용 예시 조회
4. 사용자의 코드에 맞는 사용 예시 생성

## 전제 조건
- packages/mcp-server/의 list_hooks, get_hook_details 도구가 구현되어 있어야 한다
- MCP 서버가 Claude Code에 등록되어 있어야 한다

## TODO (Phase 2)
- [ ] 훅 추천 로직 상세 기술
- [ ] 사용 예시 생성 프롬프트 템플릿 작성
