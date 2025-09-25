# 프로젝트 문서 디렉토리

이 디렉토리에는 Question Diary 프로젝트의 모든 기술 문서가 포함되어 있습니다.

## 📁 문서 구조

### 🏗️ 아키텍처 및 설계
- [`system-architecture.md`](./system-architecture.md) - 시스템 전체 아키텍처 설계
- [`api-design.md`](./api-design.md) - API 설계 및 엔드포인트 명세
- [`database-schema.md`](./database-schema.md) - 데이터베이스 스키마 및 테이블 설계

### 🎨 UI/UX 설계
- [`ui-ux-design.md`](./ui-ux-design.md) - 사용자 인터페이스 및 경험 설계

### 🔧 개발 및 구현
- [`development-plan.md`](./development-plan.md) - 개발 계획 및 마일스톤
- [`implementation-plan.md`](./implementation-plan.md) - 구현 상세 계획
- [`remaining-tasks.md`](./remaining-tasks.md) - 남은 작업 목록 및 우선순위

### 🤖 MCP 통합
- [`mcp-integration-guide.md`](./mcp-integration-guide.md) - MCP 서버 통합 가이드 (기본 개념 및 설정)
- [`mcp-developer-reference.md`](./mcp-developer-reference.md) - MCP 개발자 참조 문서 (명령어 및 API)
- [`mcp-workflow-examples.md`](./mcp-workflow-examples.md) - 실무 워크플로우 예제집 (시나리오별 가이드)
- [`mcp-health-check.md`](./mcp-health-check.md) - MCP 헬스 체크 및 모니터링
- [`mcp-faq-troubleshooting.md`](./mcp-faq-troubleshooting.md) - FAQ 및 트러블슈팅 가이드

### 📝 기획 및 요구사항
- [`iwant.md`](./iwant.md) - 프로젝트 초기 요구사항
- [`questions-list.md`](./questions-list.md) - 질문 목록 및 카테고리

## 🚀 빠른 시작

### 새로운 개발자를 위한 필독 문서
1. [`system-architecture.md`](./system-architecture.md) - 전체 시스템 이해
2. [`mcp-integration-guide.md`](./mcp-integration-guide.md) - MCP 서버 기본 개념 및 설정
3. [`mcp-workflow-examples.md`](./mcp-workflow-examples.md) - 실무 개발 워크플로우
4. [`development-plan.md`](./development-plan.md) - 개발 프로세스 및 계획

### 문제 해결이 필요할 때
1. [`mcp-faq-troubleshooting.md`](./mcp-faq-troubleshooting.md) - 자주 발생하는 문제 해결법
2. [`mcp-health-check.md`](./mcp-health-check.md) - 시스템 상태 진단 도구
3. [`mcp-developer-reference.md`](./mcp-developer-reference.md) - 상세 명령어 레퍼런스

### MCP 서버 활용
현재 프로젝트에서 사용 중인 MCP 서버들:

- **🗄️ Supabase MCP**: 데이터베이스 및 백엔드 관리
- **🎨 Magic MCP**: UI/UX 컴포넌트 자동 생성
- **🤖 SuperClaude MCP**: 고급 AI 워크플로우
- **🎯 ShadCN UI MCP**: shadcn/ui 컴포넌트 라이브러리

자세한 사용법은 [`mcp-developer-reference.md`](./mcp-developer-reference.md)를 참고하세요.

## 📊 프로젝트 현황

### 기술 스택
- **Frontend**: React 19.1+ + TypeScript + Tailwind CSS 4.x
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + 21st.dev components

### 주요 기능
- ✅ 일일 질문 시스템
- ✅ 감정 상태 추적
- ✅ 답변 기록 및 저장
- ✅ 반응형 디자인
- ✅ 다크 모드 지원

### 개발 환경
```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 🔄 문서 업데이트 규칙

1. **버전 관리**: 모든 문서 변경사항은 git으로 관리
2. **일관성**: 문서 스타일과 구조 유지
3. **실시간성**: 코드 변경 시 관련 문서도 함께 업데이트
4. **접근성**: 새로운 팀원이 쉽게 이해할 수 있도록 작성

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 문서 개선 제안이 있으시면:
- GitHub Issues를 통해 문의
- 개발팀 슬랙 채널 활용
- 코드 리뷰 시 문서 관련 피드백 제공

---

*이 문서는 프로젝트와 함께 지속적으로 업데이트됩니다.*