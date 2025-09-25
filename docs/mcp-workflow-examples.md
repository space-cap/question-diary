# MCP 실무 워크플로우 예제집

## 개요

실제 개발 상황에서 MCP 서버들을 어떻게 활용하는지 단계별로 설명하는 실무 가이드입니다. 각 시나리오는 실제 Question Diary 프로젝트에서 발생할 수 있는 상황들을 기반으로 작성되었습니다.

## 🎯 시나리오 1: 새로운 기능 개발

### 상황: "사용자가 과거 답변을 검색할 수 있는 기능 추가"

#### 1단계: 요구사항 분석 및 아키텍처 설계
```bash
# SuperClaude로 요구사항 탐색
/sc:brainstorm "과거 답변 검색 기능"

# 아키텍처 설계
/sc:design "검색 시스템 아키텍처" --api --database
```

**예상 결과:**
- 검색 요구사항 명세서
- 데이터베이스 스키마 설계안
- API 엔드포인트 설계

#### 2단계: 데이터베이스 스키마 수정
```bash
# 현재 테이블 구조 확인
mcp__supabase__list_tables

# 검색 인덱스 추가 마이그레이션
mcp__supabase__apply_migration "add_search_indexes" "
CREATE INDEX IF NOT EXISTS idx_responses_content_fts
ON responses USING gin(to_tsvector('korean', content));

CREATE INDEX IF NOT EXISTS idx_responses_created_at
ON responses(created_at DESC);
"
```

#### 3단계: 백엔드 API 구현
```bash
# Edge Function 생성
mcp__supabase__deploy_edge_function "search-responses" [
  {
    "name": "index.ts",
    "content": "
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { query, userId, dateRange } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const { data, error } = await supabase
    .from('responses')
    .select('*, questions(*)')
    .eq('user_id', userId)
    .textSearch('content', query)
    .order('created_at', { ascending: false })

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
    "
  }
]
```

#### 4단계: 프론트엔드 UI 구현
```bash
# Magic으로 검색 컴포넌트 생성
/ui 검색 입력 폼과 결과 목록 컴포넌트

# 또는 ShadCN UI 활용
mcp__shadcn_ui__get_component "command"
mcp__shadcn_ui__get_component "input"
```

#### 5단계: 통합 테스트 및 배포
```bash
# 테스트 전략 수립
/sc:test --integration --e2e

# 코드 품질 검증
/sc:improve --validate --security
```

**소요 시간: 2-3시간**
**활용 MCP 서버: SuperClaude, Supabase, Magic/ShadCN UI**

---

## 🐛 시나리오 2: 버그 수정 및 최적화

### 상황: "답변 저장 시 간헐적으로 실패하는 문제"

#### 1단계: 문제 진단
```bash
# 로그 분석
mcp__supabase__get_logs "api"

# 시스템 분석
/sc:troubleshoot --trace --logs --root-cause
```

#### 2단계: 코드 분석
```bash
# 관련 코드 분석
/sc:analyze --security --performance
```

#### 3단계: 데이터베이스 조사
```bash
# 테이블 상태 확인
mcp__supabase__execute_sql "
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename = 'responses'
ORDER BY n_distinct DESC;
"

# 실행 계획 확인
mcp__supabase__execute_sql "
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM responses
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC
LIMIT 10;
"
```

#### 4단계: 수정사항 구현
```bash
# 트랜잭션 개선
mcp__supabase__apply_migration "fix_response_save" "
-- 중복 방지를 위한 유니크 제약 조건 추가
ALTER TABLE responses
ADD CONSTRAINT unique_user_question_date
UNIQUE (user_id, question_id, DATE(created_at));
"

# 코드 개선
/sc:improve --refactor --optimize
```

#### 5단계: 검증 및 모니터링
```bash
# 성능 테스트
/sc:test --performance

# 어드바이저 체크
mcp__supabase__get_advisors "performance"
mcp__supabase__get_advisors "security"
```

**소요 시간: 1-2시간**
**활용 MCP 서버: SuperClaude, Supabase**

---

## 🎨 시나리오 3: UI/UX 개선

### 상황: "답변 작성 폼을 더 직관적이고 접근성 좋게 개선"

#### 1단계: 현재 컴포넌트 분석
```bash
# 기존 컴포넌트 개선
mcp__magic__21st_magic_component_refiner "src/components/AnswerForm.tsx" "
사용자가 답변을 작성할 때 더 편리하고 접근성이 좋은 폼으로 개선:
- 자동 저장 기능
- 글자 수 표시
- 감정 점수 시각적 표시 개선
- 키보드 내비게이션 지원
"
```

#### 2단계: 새로운 컴포넌트 탐색
```bash
# 영감 얻기
mcp__magic__21st_magic_component_inspiration "텍스트 에디터"

# ShadCN UI 컴포넌트 확인
mcp__shadcn_ui__list_components | grep -i "form\|input\|textarea"
mcp__shadcn_ui__get_component_demo "textarea"
```

#### 3단계: 접근성 개선
```bash
# 접근성 컴포넌트 생성
/ui "WCAG 2.1 AA 준수하는 텍스트 입력 컴포넌트"

# 접근성 테스트를 위한 Playwright 활용
mcp__playwright__browser_navigate "http://localhost:5173"
mcp__playwright__browser_snapshot
```

#### 4단계: 사용자 테스트
```bash
# 실제 사용자 시나리오 테스트
mcp__playwright__browser_fill_form [
  {
    "name": "답변 내용",
    "type": "textbox",
    "ref": "textarea",
    "value": "오늘은 정말 좋은 하루였습니다. 새로운 것을 배웠고..."
  },
  {
    "name": "기분 점수",
    "type": "slider",
    "ref": "mood-slider",
    "value": "8"
  }
]

# 스크린샷으로 시각적 검증
mcp__playwright__browser_take_screenshot "answer-form-test.png"
```

**소요 시간: 1-2시간**
**활용 MCP 서버: Magic, ShadCN UI, Playwright**

---

## 📊 시나리오 4: 데이터 분석 및 리포트

### 상황: "사용자 참여도 분석 대시보드 구현"

#### 1단계: 데이터 분석 쿼리 작성
```bash
# 사용자 통계 조회
mcp__supabase__execute_sql "
WITH user_stats AS (
  SELECT
    u.id,
    u.email,
    COUNT(r.id) as total_responses,
    COUNT(DISTINCT DATE(r.created_at)) as active_days,
    AVG(r.mood_score) as avg_mood,
    MAX(r.created_at) as last_activity
  FROM users u
  LEFT JOIN responses r ON u.id = r.user_id
  WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY u.id, u.email
)
SELECT * FROM user_stats ORDER BY total_responses DESC;
"
```

#### 2단계: 시각화 컴포넌트 구현
```bash
# 차트 컴포넌트 생성
/ui "사용자 참여도를 보여주는 대시보드 - 선 그래프, 바 차트, 통계 카드 포함"

# ShadCN UI 차트 컴포넌트 활용
mcp__shadcn_ui__get_component "chart"
mcp__shadcn_ui__get_component "card"
```

#### 3단계: 실시간 데이터 연동
```bash
# 실시간 통계 Edge Function
mcp__supabase__deploy_edge_function "user-analytics" [
  {
    "name": "index.ts",
    "content": "
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // 일별 응답 수 통계
  const { data: dailyStats } = await supabase
    .from('responses')
    .select('created_at, mood_score')
    .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())

  // 통계 계산 로직...

  return new Response(JSON.stringify({ dailyStats }))
})
    "
  }
]
```

**소요 시간: 3-4시간**
**활용 MCP 서버: Supabase, Magic, ShadCN UI**

---

## 🚀 시나리오 5: 성능 최적화

### 상황: "앱 로딩 속도가 느려서 사용자 경험 개선 필요"

#### 1단계: 성능 분석
```bash
# 전체 성능 분석
/sc:analyze --performance --deep

# 번들 크기 분석
/sc:improve --optimize --modernize
```

#### 2단계: 데이터베이스 최적화
```bash
# 쿼리 성능 분석
mcp__supabase__execute_sql "
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%responses%'
ORDER BY total_time DESC
LIMIT 10;
"

# 인덱스 최적화
mcp__supabase__apply_migration "optimize_indexes" "
-- 자주 사용되는 쿼리를 위한 복합 인덱스
CREATE INDEX CONCURRENTLY idx_responses_user_date
ON responses(user_id, created_at DESC);

-- 사용되지 않는 인덱스 제거
DROP INDEX IF EXISTS old_unused_index;
"
```

#### 3단계: 프론트엔드 최적화
```bash
# 코드 분할 및 지연 로딩 구현
/sc:improve --optimize --bundle-size

# 이미지 최적화 (필요한 경우)
mcp__playwright__browser_navigate "http://localhost:5173"
mcp__playwright__browser_evaluate "() => {
  // 이미지 로딩 성능 측정
  const images = document.querySelectorAll('img');
  return Array.from(images).map(img => ({
    src: img.src,
    loaded: img.complete,
    naturalWidth: img.naturalWidth
  }));
}"
```

#### 4단계: 성능 검증
```bash
# Lighthouse 성능 측정 (Playwright로)
mcp__playwright__browser_navigate "http://localhost:5173"
mcp__playwright__browser_evaluate "() => {
  // 페이지 로드 성능 메트릭 수집
  const perfData = performance.getEntriesByType('navigation')[0];
  return {
    loadTime: perfData.loadEventEnd - perfData.fetchStart,
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart
  };
}"
```

**소요 시간: 4-6시간**
**활용 MCP 서버: SuperClaude, Supabase, Playwright**

---

## 🔄 시나리오 6: 배포 및 모니터링

### 상황: "스테이징 환경에서 프로덕션으로 배포"

#### 1단계: 배포 전 준비
```bash
# 어드바이저로 보안 및 성능 체크
mcp__supabase__get_advisors "security"
mcp__supabase__get_advisors "performance"

# 테스트 실행
/sc:test --comprehensive --coverage
```

#### 2단계: 브랜치 관리
```bash
# 개발 브랜치 생성 (필요한 경우)
mcp__supabase__list_branches

# 스테이징 브랜치에서 최종 테스트
mcp__supabase__create_branch "staging-final"
```

#### 3단계: 프로덕션 배포
```bash
# 브랜치 병합
mcp__supabase__merge_branch "staging-branch-id"

# Edge Functions 배포 상태 확인
mcp__supabase__list_edge_functions
```

#### 4단계: 배포 후 모니터링
```bash
# 로그 모니터링
mcp__supabase__get_logs "api"
mcp__supabase__get_logs "auth"

# 성능 지표 확인
mcp__playwright__browser_navigate "https://your-production-url.com"
mcp__playwright__browser_console_messages
```

**소요 시간: 1-2시간**
**활용 MCP 서버: Supabase, SuperClaude, Playwright**

---

## 📋 워크플로우 템플릿

### 일반적인 개발 워크플로우

```yaml
개발_워크플로우:
  1_계획:
    - /sc:brainstorm "기능 요구사항"
    - /sc:design --api --database

  2_백엔드:
    - mcp__supabase__apply_migration
    - mcp__supabase__deploy_edge_function
    - mcp__supabase__execute_sql (테스트)

  3_프론트엔드:
    - /ui "컴포넌트 생성"
    - mcp__shadcn_ui__get_component
    - mcp__magic__21st_magic_component_refiner

  4_테스트:
    - /sc:test --unit --integration
    - mcp__playwright__browser_navigate
    - mcp__playwright__browser_snapshot

  5_최적화:
    - /sc:analyze --performance
    - /sc:improve --optimize
    - mcp__supabase__get_advisors

  6_배포:
    - mcp__supabase__merge_branch
    - mcp__supabase__get_logs
```

### 버그 수정 워크플로우

```yaml
버그_수정_워크플로우:
  1_진단:
    - /sc:troubleshoot --trace --logs
    - mcp__supabase__get_logs

  2_분석:
    - /sc:analyze --deep
    - mcp__supabase__execute_sql (조사)

  3_수정:
    - /sc:improve --refactor
    - mcp__supabase__apply_migration (필요시)

  4_검증:
    - /sc:test --regression
    - mcp__playwright__browser_navigate
```

## 💡 효율성 팁

### 1. 병렬 작업 활용
```bash
# 동시에 여러 작업 실행
parallel:
  - mcp__supabase__list_tables
  - mcp__shadcn_ui__list_components
  - /sc:analyze --architecture
```

### 2. 템플릿 활용
- 자주 사용하는 워크플로우는 템플릿으로 저장
- 프로젝트별 표준 워크플로우 정의
- 체크리스트 형태로 관리

### 3. 자동화 스크립트
```bash
# 개발 환경 셋업 스크립트
./scripts/setup-dev-environment.sh

# 배포 전 체크 스크립트
./scripts/pre-deployment-check.sh
```

## 📚 추가 학습 자료

- [MCP 통합 가이드](./mcp-integration-guide.md) - 기본 개념 학습
- [MCP 개발자 참조](./mcp-developer-reference.md) - 상세 명령어 레퍼런스
- [MCP 헬스 체크](./mcp-health-check.md) - 문제 해결 가이드

---

*실무 경험을 바탕으로 지속적으로 업데이트되는 워크플로우 가이드입니다.*