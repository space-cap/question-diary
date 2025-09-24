# MCP 통합 가이드

## 개요

이 문서는 Question Diary 프로젝트에서 사용하는 MCP(Model Context Protocol) 서버들의 설정, 기능, 그리고 활용 방법을 설명합니다.

## MCP(Model Context Protocol)란?

MCP는 AI 어시스턴트가 외부 도구, 데이터베이스, 및 서비스들과 상호작용할 수 있도록 해주는 오픈 소스 프로토콜입니다. 이를 통해 Claude Code는 다양한 전문화된 기능들을 활용할 수 있습니다.

## 현재 설정된 MCP 서버들

### 1. Supabase MCP Server
**목적**: 데이터베이스 관리 및 백엔드 서비스 통합

**주요 기능**:
- 데이터베이스 테이블 조회 및 관리
- SQL 쿼리 실행
- 마이그레이션 적용
- API 키 및 프로젝트 URL 관리
- Edge Functions 배포 및 관리
- 브랜치 관리 (개발/프로덕션 분리)

**설정 정보**:
- 프로젝트 참조: `vruofvecoigopjxgtwbj`
- 액세스 토큰으로 인증 처리

**활용 예시**:
```bash
# 테이블 목록 조회
mcp__supabase__list_tables

# SQL 실행
mcp__supabase__execute_sql

# 마이그레이션 적용
mcp__supabase__apply_migration
```

### 2. Magic MCP Server
**목적**: UI/UX 컴포넌트 자동 생성 및 디자인 시스템

**주요 기능**:
- 21st.dev 라이브러리 기반 컴포넌트 검색
- 모던한 React 컴포넌트 자동 생성
- 접근성 및 반응형 디자인 최적화
- 컴포넌트 개선 및 리팩토링

**활용 예시**:
```bash
# UI 컴포넌트 생성
/ui 버튼 컴포넌트
/21 로그인 폼

# 컴포넌트 개선
mcp__magic__21st_magic_component_refiner
```

### 3. SuperClaude MCP Server
**목적**: 고급 AI 워크플로우 및 태스크 오케스트레이션

**주요 기능**:
- 프로젝트 분석 및 아키텍처 설계
- 코드 품질 개선 및 리팩토링
- 테스트 전략 수립 및 실행
- 문서화 자동 생성
- 워크플로우 최적화

**주요 명령어**:
- `/sc:analyze` - 코드베이스 분석
- `/sc:improve` - 코드 개선
- `/sc:test` - 테스트 전략
- `/sc:document` - 문서 생성
- `/sc:workflow` - 워크플로우 관리

### 4. ShadCN UI MCP Server
**목적**: shadcn/ui 컴포넌트 라이브러리 통합

**주요 기능**:
- shadcn/ui 컴포넌트 소스 코드 조회
- 컴포넌트 데모 및 사용법 제공
- 최신 v4 컴포넌트 지원
- 블록(복합 컴포넌트) 관리

**활용 예시**:
```bash
# 컴포넌트 목록 조회
mcp__shadcn-ui__list_components

# 특정 컴포넌트 소스 코드
mcp__shadcn-ui__get_component

# 컴포넌트 데모
mcp__shadcn-ui__get_component_demo
```

## MCP 서버 활용 전략

### 개발 워크플로우에서의 활용

1. **초기 개발 단계**
   - SuperClaude로 프로젝트 아키텍처 분석
   - Magic/ShadCN UI로 UI 컴포넌트 생성
   - Supabase로 데이터베이스 스키마 설계

2. **구현 단계**
   - Supabase로 백엔드 API 개발
   - Magic으로 프론트엔드 컴포넌트 구현
   - SuperClaude로 코드 품질 관리

3. **테스트 및 배포**
   - SuperClaude로 테스트 전략 수립
   - Supabase로 Edge Functions 배포
   - Magic으로 UI 컴포넌트 검증

### 효율적인 사용 팁

1. **병렬 작업**: 여러 MCP 서버를 동시에 활용하여 작업 효율성 극대화
2. **컨텍스트 유지**: 각 서버의 특성을 이해하고 적절한 상황에서 사용
3. **통합 워크플로우**: 서버 간 연계를 통한 종합적인 개발 환경 구축

## 설정 파일 관리

### .mcp.json 구조
```json
{
  "mcpServers": {
    "서버명": {
      "type": "stdio",
      "command": "실행 명령어",
      "args": ["인자들"],
      "env": {
        "환경변수": "값"
      }
    }
  }
}
```

### 보안 고려사항

1. **환경변수 관리**: 민감한 정보는 환경변수로 분리
2. **토큰 보안**: API 토큰과 키는 `.env.local`에서 관리
3. **액세스 제어**: 프로젝트별 접근 권한 설정

## 문제 해결 가이드

### 일반적인 이슈들

1. **연결 실패**
   - 네트워크 연결 상태 확인
   - MCP 서버 실행 상태 점검
   - 인증 토큰 유효성 검증

2. **권한 오류**
   - API 키 및 토큰 재확인
   - 프로젝트 권한 설정 검토
   - 환경변수 설정 확인

3. **성능 이슈**
   - 동시 요청 수 제한 고려
   - 캐시 활용 방안 검토
   - 요청 최적화 적용

### 디버깅 방법

1. **로그 확인**: MCP 서버 실행 로그 분석
2. **수동 테스트**: 각 서버별 기본 기능 테스트
3. **환경 검증**: 개발 환경 설정 상태 점검

## 향후 확장 계획

### 추가 고려 사항

1. **새로운 MCP 서버 통합**
   - 프로젝트 요구사항에 따른 서버 추가
   - 커스텀 MCP 서버 개발 가능성

2. **성능 최적화**
   - 서버 응답 시간 개선
   - 캐싱 전략 도입
   - 병렬 처리 최적화

3. **모니터링 강화**
   - 사용량 및 성능 메트릭 수집
   - 오류 추적 및 알림 시스템
   - 사용자 경험 개선

## 참고 자료

- [MCP 공식 문서](https://github.com/modelcontextprotocol)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- [21st.dev Magic Library](https://21st.dev)
- [SuperClaude Framework](https://github.com/anthropics/claude-code)
- [shadcn/ui Documentation](https://ui.shadcn.com)