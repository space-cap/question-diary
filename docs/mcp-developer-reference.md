# MCP 개발자 참조 가이드

## 빠른 참조

### 주요 명령어 치트시트

#### Supabase 관련
```bash
# 프로젝트 정보
mcp__supabase__get_project_url
mcp__supabase__get_anon_key

# 데이터베이스 관리
mcp__supabase__list_tables
mcp__supabase__execute_sql
mcp__supabase__apply_migration

# Edge Functions
mcp__supabase__list_edge_functions
mcp__supabase__deploy_edge_function
```

#### UI 컴포넌트 생성
```bash
# Magic MCP 사용
/ui 버튼 컴포넌트 생성
/21 로그인 폼 만들기

# ShadCN UI 사용
mcp__shadcn-ui__list_components
mcp__shadcn-ui__get_component "button"
```

#### SuperClaude 워크플로우
```bash
/sc:analyze     # 코드 분석
/sc:improve     # 코드 개선
/sc:test        # 테스트 전략
/sc:document    # 문서화
/sc:implement   # 기능 구현
```

## 실무 활용 사례

### 1. 새로운 기능 개발 프로세스

```bash
# 1단계: 요구사항 분석
/sc:brainstorm "사용자 프로필 관리 기능"

# 2단계: 데이터베이스 설계
mcp__supabase__apply_migration "create_user_profiles"

# 3단계: UI 컴포넌트 생성
/ui 프로필 수정 폼

# 4단계: 백엔드 API 구현
mcp__supabase__deploy_edge_function "update-profile"

# 5단계: 테스트 및 검증
/sc:test --unit --integration
```

### 2. 버그 수정 워크플로우

```bash
# 1단계: 문제 진단
/sc:troubleshoot --trace --logs

# 2단계: 코드 분석
/sc:analyze --security --performance

# 3단계: 수정 구현
/sc:improve --refactor --validate

# 4단계: 테스트 검증
/sc:test --regression
```

### 3. 성능 최적화 과정

```bash
# 1단계: 성능 분석
/sc:analyze --performance --deep

# 2단계: 데이터베이스 최적화
mcp__supabase__execute_sql "EXPLAIN ANALYZE SELECT ..."

# 3단계: 코드 최적화
/sc:improve --optimize --modernize

# 4단계: 결과 검증
/sc:test --performance
```

## 고급 사용 패턴

### 병렬 작업 패턴

```bash
# 동시에 여러 작업 수행
parallel_tasks:
  - mcp__supabase__list_tables
  - mcp__shadcn-ui__list_components
  - /sc:analyze --architecture
```

### 워크플로우 체인

```bash
# 순차적 작업 체인
workflow:
  analyze -> design -> implement -> test -> deploy

# 각 단계별 MCP 활용
analyze: /sc:analyze --deep
design: /ui 컴포넌트 설계
implement: mcp__supabase__deploy_edge_function
test: /sc:test --comprehensive
deploy: /sc:workflow --stages
```

## 개발 환경별 설정

### 로컬 개발 환경

```json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_PROJECT_REF": "local-dev-ref"
      }
    }
  }
}
```

### 스테이징 환경

```json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_PROJECT_REF": "staging-ref"
      }
    }
  }
}
```

### 프로덕션 환경

```json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_PROJECT_REF": "production-ref"
      }
    }
  }
}
```

## 성능 최적화 팁

### 1. 요청 최적화

```typescript
// 배치 처리 활용
const batchOperations = [
  'mcp__supabase__list_tables',
  'mcp__supabase__list_edge_functions'
];

// 병렬 실행
await Promise.all(batchOperations.map(op => executeOperation(op)));
```

### 2. 캐싱 전략

```typescript
// 자주 사용되는 데이터 캐싱
const cachedComponents = new Map();

function getCachedComponent(name: string) {
  if (!cachedComponents.has(name)) {
    const component = mcp__shadcn_ui__get_component(name);
    cachedComponents.set(name, component);
  }
  return cachedComponents.get(name);
}
```

### 3. 요청 제한 관리

```typescript
// 동시 요청 수 제한
const requestQueue = new Queue({ concurrency: 3 });

requestQueue.add(() => mcp__supabase__execute_sql(query1));
requestQueue.add(() => mcp__supabase__execute_sql(query2));
```

## 에러 처리 가이드

### 일반적인 에러 패턴

```typescript
// 연결 실패 처리
try {
  const result = await mcp__supabase__list_tables();
  return result;
} catch (error) {
  if (error.code === 'CONNECTION_FAILED') {
    // 재시도 로직
    return retryOperation(() => mcp__supabase__list_tables());
  }
  throw error;
}

// 권한 에러 처리
try {
  const result = await mcp__supabase__execute_sql(query);
  return result;
} catch (error) {
  if (error.code === 'INSUFFICIENT_PRIVILEGES') {
    // 권한 확인 및 알림
    notifyAdministrator('Database permission required');
  }
  throw error;
}
```

### 재시도 메커니즘

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retry attempts exceeded');
}
```

## 모니터링 및 로깅

### 성능 메트릭 수집

```typescript
// 요청 시간 측정
const startTime = Date.now();
const result = await mcp__supabase__execute_sql(query);
const executionTime = Date.now() - startTime;

// 메트릭 로깅
console.log(`Query executed in ${executionTime}ms`);
```

### 에러 추적

```typescript
// 구조화된 로깅
const logger = {
  error: (operation: string, error: Error, context?: any) => {
    console.error({
      timestamp: new Date().toISOString(),
      operation,
      error: error.message,
      stack: error.stack,
      context
    });
  }
};

try {
  await mcp__supabase__execute_sql(query);
} catch (error) {
  logger.error('database_query_failed', error, { query });
  throw error;
}
```

## 보안 모범 사례

### 1. 환경변수 관리

```bash
# .env.local (git에서 제외)
SUPABASE_ACCESS_TOKEN=your_token_here
SUPABASE_PROJECT_REF=your_project_ref

# .env.example (git에 포함)
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_REF=your_project_reference
```

### 2. SQL 인젝션 방지

```typescript
// 안전한 쿼리 실행
const safeQuery = `
  SELECT * FROM users
  WHERE id = $1 AND status = $2
`;

const result = await mcp__supabase__execute_sql(
  safeQuery,
  [userId, 'active']
);
```

### 3. 권한 최소화 원칙

```typescript
// 필요한 권한만 요청
const readOnlyQuery = 'SELECT id, name FROM public.users';
const result = await mcp__supabase__execute_sql(readOnlyQuery);
```

## 트러블슈팅 체크리스트

### 연결 문제
- [ ] 네트워크 연결 상태 확인
- [ ] MCP 서버 실행 상태 점검
- [ ] 방화벽 설정 확인
- [ ] DNS 해상도 테스트

### 인증 문제
- [ ] API 키 유효성 확인
- [ ] 토큰 만료 여부 점검
- [ ] 권한 설정 검토
- [ ] 환경변수 로딩 확인

### 성능 문제
- [ ] 쿼리 복잡도 분석
- [ ] 인덱스 활용 확인
- [ ] 네트워크 지연 측정
- [ ] 동시 요청 수 모니터링

## 유용한 유틸리티 함수

### MCP 헬퍼 함수

```typescript
// MCP 상태 확인
export async function checkMcpHealth(): Promise<Record<string, boolean>> {
  const servers = ['supabase', 'magic', 'superclaude', 'shadcn-ui'];
  const results: Record<string, boolean> = {};

  for (const server of servers) {
    try {
      // 각 서버별 기본 동작 테스트
      await testServerConnection(server);
      results[server] = true;
    } catch {
      results[server] = false;
    }
  }

  return results;
}

// 배치 작업 실행기
export async function executeBatch<T>(
  operations: Array<() => Promise<T>>
): Promise<Array<T | Error>> {
  return Promise.allSettled(
    operations.map(op => op())
  ).then(results =>
    results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    )
  );
}
```

이 가이드를 통해 MCP 서버들을 효율적으로 활용하여 개발 생산성을 극대화할 수 있습니다.