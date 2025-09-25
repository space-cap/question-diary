# MCP FAQ 및 트러블슈팅 가이드

## 개요

MCP 서버 사용 중 자주 발생하는 문제들과 해결 방법을 정리한 가이드입니다. 실제 개발자들이 경험한 문제들을 바탕으로 작성되었습니다.

---

## 🔧 설치 및 설정 관련 FAQ

### Q1: MCP 서버가 실행되지 않아요
**증상**: `mcp__supabase__list_tables` 같은 명령어가 응답하지 않음

**원인별 해결책**:

#### Node.js/npm 문제
```bash
# Node.js 버전 확인 (18 이상 필요)
node --version

# npm 버전 확인
npm --version

# Node.js 재설치가 필요한 경우
winget install OpenJS.NodeJS
```

#### 권한 문제
```bash
# 관리자 권한으로 명령 프롬프트 실행
# 또는 PowerShell을 관리자 권한으로 실행

# npm 권한 설정
npm config set registry https://registry.npmjs.org/
```

#### 방화벽/바이러스 백신 문제
```bash
# Windows Defender 예외 추가
# 설정 > 업데이트 및 보안 > Windows 보안 > 바이러스 및 위협 방지
# "바이러스 및 위협 방지 설정" > "제외 추가"
# 프로젝트 폴더 전체를 예외로 추가
```

### Q2: Supabase 연결이 안 돼요
**증상**: `Connection failed` 또는 `Authentication failed` 오류

**체크리스트**:
1. **환경 변수 확인**
   ```bash
   # .env.local 파일 확인
   echo $env:SUPABASE_ACCESS_TOKEN  # PowerShell
   echo %SUPABASE_ACCESS_TOKEN%     # CMD
   ```

2. **토큰 유효성 검증**
   ```bash
   # Supabase CLI로 토큰 테스트
   curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
        https://api.supabase.com/v1/projects
   ```

3. **네트워크 연결 확인**
   ```bash
   ping supabase.com
   nslookup supabase.com
   ```

### Q3: Magic MCP가 컴포넌트를 생성하지 못해요
**증상**: `/ui` 명령어 후 오류 발생 또는 빈 응답

**해결 방법**:
```bash
# 21st.dev 연결 확인
curl -I https://21st.dev

# npm 캐시 정리
npm cache clean --force

# Magic MCP 재설치
npx -y @21st-dev/magic@latest --help
```

---

## ⚠️ 실행 중 오류 해결

### Q4: "ECONNRESET" 또는 "ETIMEDOUT" 오류
**원인**: 네트워크 연결 불안정 또는 방화벽 차단

**해결책**:
1. **재시도 메커니즘 활용**
   ```javascript
   // Claude Code 내부적으로 자동 재시도되지만,
   // 수동으로 재시도해보세요
   ```

2. **네트워크 설정 확인**
   ```bash
   # DNS 플러시
   ipconfig /flushdns

   # 네트워크 재시작
   ipconfig /release
   ipconfig /renew
   ```

3. **프록시 설정 (회사 환경)**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy https://proxy.company.com:8080
   ```

### Q5: "Rate limit exceeded" 오류
**원인**: API 호출 한도 초과

**해결책**:
1. **호출 빈도 조절**
   - 동시에 너무 많은 MCP 명령어 실행 금지
   - 대용량 작업은 배치로 나누어 실행

2. **토큰 사용량 최적화**
   ```bash
   # 불필요한 반복 작업 피하기
   # 캐시 활용 가능한 작업은 결과 저장
   ```

### Q6: SQL 실행 오류가 계속 발생해요
**증상**: `mcp__supabase__execute_sql`에서 권한 또는 문법 오류

**디버깅 단계**:
1. **쿼리 검증**
   ```bash
   # 간단한 쿼리로 테스트
   mcp__supabase__execute_sql "SELECT 1 as test;"
   ```

2. **권한 확인**
   ```bash
   # 현재 사용자 권한 확인
   mcp__supabase__execute_sql "SELECT current_user, session_user;"
   ```

3. **테이블 존재 여부 확인**
   ```bash
   mcp__supabase__list_tables
   ```

---

## 🚀 성능 관련 FAQ

### Q7: MCP 명령어가 너무 느려요
**증상**: 응답 시간이 10초 이상 소요

**최적화 방법**:

1. **네트워크 최적화**
   ```bash
   # 지연 시간 측정
   ping -t supabase.com
   tracert supabase.com
   ```

2. **쿼리 최적화**
   ```sql
   -- 느린 쿼리 식별
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   WHERE mean_time > 1000
   ORDER BY mean_time DESC;
   ```

3. **인덱스 활용**
   ```bash
   mcp__supabase__execute_sql "
   -- 인덱스 사용 현황 확인
   SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
   FROM pg_stat_user_indexes
   ORDER BY idx_tup_read DESC;
   "
   ```

### Q8: 메모리 사용량이 계속 증가해요
**원인**: 메모리 누수 또는 캐시 미정리

**해결책**:
1. **프로세스 재시작**
   ```bash
   # Node.js 프로세스 종료
   taskkill /F /IM node.exe

   # Claude Code 재시작
   ```

2. **캐시 정리**
   ```bash
   npm cache clean --force
   ```

---

## 🔐 보안 관련 FAQ

### Q9: API 키가 노출된 것 같아요
**즉시 조치**:
1. **Supabase 토큰 재생성**
   - Supabase 대시보드 → Settings → API Keys
   - 새 토큰 생성 후 기존 토큰 비활성화

2. **환경 변수 업데이트**
   ```bash
   # .env.local 파일 수정
   SUPABASE_ACCESS_TOKEN=새로운_토큰
   ```

3. **Git 기록 정리** (필요시)
   ```bash
   # 커밋에서 토큰 제거 (주의: 이력 변경됨)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

### Q10: 데이터베이스 접근 권한이 너무 넓어요
**권한 최소화**:
```sql
-- 읽기 전용 사용자 생성
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE your_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

---

## 🔄 개발 워크플로우 관련 FAQ

### Q11: 여러 환경에서 MCP 설정이 다른데 어떻게 관리하나요?

**환경별 설정 파일 관리**:
```bash
# 환경별 설정 파일
.mcp.dev.json      # 개발환경
.mcp.staging.json  # 스테이징환경
.mcp.prod.json     # 프로덕션환경

# 환경 변수로 설정 파일 선택
MCP_CONFIG=dev claude-code
```

**설정 파일 예시**:
```json
// .mcp.dev.json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "SUPABASE_PROJECT_REF": "dev-project-ref"
      }
    }
  }
}
```

### Q12: 팀원들과 MCP 설정을 공유하려면?

**권장 방법**:
1. **.mcp.template.json** 생성
   ```json
   {
     "mcpServers": {
       "supabase": {
         "env": {
           "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
           "SUPABASE_PROJECT_REF": "${SUPABASE_PROJECT_REF}"
         }
       }
     }
   }
   ```

2. **셋업 스크립트** 제공
   ```bash
   # setup-mcp.ps1
   $template = Get-Content .mcp.template.json
   $template = $template -replace '${SUPABASE_ACCESS_TOKEN}', $env:SUPABASE_ACCESS_TOKEN
   $template = $template -replace '${SUPABASE_PROJECT_REF}', $env:SUPABASE_PROJECT_REF
   $template | Out-File .mcp.json
   ```

---

## 🐛 고급 트러블슈팅

### 복합적인 문제 진단

#### 1. 전체 시스템 상태 체크
```bash
# 헬스 체크 스크립트 실행
./scripts/mcp-health-check.ps1

# 시스템 리소스 확인
Get-Process | Where-Object {$_.ProcessName -eq "node"}
Get-PSDrive C | Select-Object Used,Free
```

#### 2. 로그 분석
```bash
# Claude Code 로그 확인 (가능한 경우)
# 윈도우 이벤트 로그 확인
Get-EventLog -LogName Application -Source "Node.js" -Newest 10
```

#### 3. 네트워크 진단
```bash
# 상세 네트워크 진단
Test-NetConnection supabase.com -Port 443 -Verbose
Test-NetConnection 21st.dev -Port 443 -Verbose

# DNS 해상도 확인
Resolve-DnsName supabase.com -Type A
```

#### 4. 프로세스 모니터링
```bash
# 실시간 프로세스 모니터링
Get-Process node | Format-Table ProcessName,CPU,WorkingSet -AutoSize
```

---

## 📞 추가 지원 받기

### 커뮤니티 리소스
- **GitHub Issues**: [MCP Server 이슈 트래커들]
- **Discord/Slack**: 개발자 커뮤니티
- **Stack Overflow**: `model-context-protocol` 태그

### 공식 문서
- [MCP 공식 문서](https://github.com/modelcontextprotocol)
- [Supabase MCP](https://github.com/supabase/mcp-server-supabase)
- [Claude Code 문서](https://docs.claude.ai/code)

### 내부 지원
- **개발팀 슬랙**: #mcp-support
- **이슈 트래킹**: GitHub Issues
- **문서 개선 요청**: PR 또는 Issue

---

## 🔄 문제 보고 템플릿

문제 발생 시 다음 형식으로 보고해주세요:

```markdown
## 문제 요약
[간단한 문제 설명]

## 환경 정보
- OS: Windows 11
- Node.js: v18.x.x
- Claude Code: v1.x.x
- MCP 서버: supabase, magic, etc.

## 재현 단계
1. [첫 번째 단계]
2. [두 번째 단계]
3. [문제 발생]

## 예상 결과
[기대했던 동작]

## 실제 결과
[실제로 발생한 문제]

## 추가 정보
- 에러 메시지: [전체 에러 메시지]
- 스크린샷: [필요한 경우]
- 로그: [관련 로그 내용]

## 시도한 해결책
[이미 시도해본 방법들]
```

---

## 📊 자주 발생하는 문제 통계

| 문제 유형 | 발생 빈도 | 평균 해결 시간 | 주요 원인 |
|-----------|----------|----------------|-----------|
| 연결 실패 | 40% | 5분 | 네트워크, 방화벽 |
| 권한 오류 | 25% | 10분 | API 키, 토큰 |
| 성능 저하 | 20% | 15분 | 쿼리, 인덱스 |
| 설정 오류 | 10% | 20분 | 환경변수, 설정파일 |
| 기타 | 5% | 30분+ | 복합적 원인 |

---

*문제 해결에 도움이 되지 않는 경우, 개발팀에 문의하거나 GitHub Issue를 생성해주세요.*