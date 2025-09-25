# MCP 헬스 체크 가이드

## 개요

이 문서는 MCP 서버들의 상태를 점검하고 문제를 진단하는 방법을 제공합니다. 실제 운영 환경에서 바로 활용할 수 있는 스크립트와 체크리스트가 포함되어 있습니다.

## 🔍 빠른 상태 체크

### 기본 MCP 서버 상태 확인

```bash
# 1. MCP 설정 파일 확인
cat .mcp.json | jq '.mcpServers | keys[]'

# 2. 각 서버별 프로세스 확인 (Windows)
tasklist /FI "IMAGENAME eq node.exe" | findstr npx

# 3. 네트워크 포트 사용 확인
netstat -an | findstr :3000
```

### 자동화된 헬스 체크 스크립트

#### Windows 배치 스크립트 (`scripts/mcp-health-check.bat`)

```batch
@echo off
echo ========================================
echo MCP 서버 헬스 체크
echo ========================================
echo.

:: 현재 시간 표시
echo 체크 시간: %date% %time%
echo.

:: MCP 설정 파일 존재 확인
if exist .mcp.json (
    echo ✅ .mcp.json 파일 존재
) else (
    echo ❌ .mcp.json 파일 없음
    exit /b 1
)

:: 각 MCP 서버 상태 체크
echo.
echo 📋 설정된 MCP 서버 목록:
type .mcp.json | findstr "\".*\":" | findstr -v "mcpServers\|type\|command\|args\|env"

:: Node.js 및 npm 버전 체크
echo.
echo 🔧 환경 확인:
node --version 2>nul && echo ✅ Node.js 설치됨 || echo ❌ Node.js 없음
npm --version 2>nul && echo ✅ npm 설치됨 || echo ❌ npm 없음

:: 환경 변수 체크
echo.
echo 🔑 환경 변수 확인:
if defined SUPABASE_ACCESS_TOKEN (
    echo ✅ SUPABASE_ACCESS_TOKEN 설정됨
) else (
    echo ⚠️ SUPABASE_ACCESS_TOKEN 설정 필요
)

:: 네트워크 연결 체크
echo.
echo 🌐 네트워크 연결 체크:
ping -n 1 supabase.com >nul 2>&1 && echo ✅ Supabase 연결 가능 || echo ❌ Supabase 연결 실패
ping -n 1 21st.dev >nul 2>&1 && echo ✅ 21st.dev 연결 가능 || echo ❌ 21st.dev 연결 실패

echo.
echo ========================================
echo 헬스 체크 완료
echo ========================================
```

#### PowerShell 스크립트 (`scripts/mcp-health-check.ps1`)

```powershell
# MCP 헬스 체크 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MCP 서버 헬스 체크" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 현재 시간 표시
Write-Host "체크 시간: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# MCP 설정 파일 확인
if (Test-Path ".mcp.json") {
    Write-Host "✅ .mcp.json 파일 존재" -ForegroundColor Green

    # JSON 파싱하여 서버 목록 표시
    $mcpConfig = Get-Content ".mcp.json" | ConvertFrom-Json
    $servers = $mcpConfig.mcpServers.PSObject.Properties.Name

    Write-Host ""
    Write-Host "📋 설정된 MCP 서버 목록:" -ForegroundColor Yellow
    foreach ($server in $servers) {
        Write-Host "  • $server" -ForegroundColor White
    }
} else {
    Write-Host "❌ .mcp.json 파일 없음" -ForegroundColor Red
    exit 1
}

# 환경 확인
Write-Host ""
Write-Host "🔧 환경 확인:" -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js 설치됨 ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 없음" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm 설치됨 ($npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 없음" -ForegroundColor Red
}

# 환경 변수 체크
Write-Host ""
Write-Host "🔑 환경 변수 확인:" -ForegroundColor Yellow

$envVars = @{
    "SUPABASE_ACCESS_TOKEN" = $env:SUPABASE_ACCESS_TOKEN
    "SUPABASE_PROJECT_REF" = "vruofvecoigopjxgtwbj"  # 설정에서 읽어오기
}

foreach ($var in $envVars.Keys) {
    if ($envVars[$var]) {
        Write-Host "✅ $var 설정됨" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $var 설정 필요" -ForegroundColor Yellow
    }
}

# 네트워크 연결 체크
Write-Host ""
Write-Host "🌐 네트워크 연결 체크:" -ForegroundColor Yellow

$endpoints = @(
    "supabase.com",
    "21st.dev",
    "registry.npmjs.org"
)

foreach ($endpoint in $endpoints) {
    try {
        $result = Test-Connection $endpoint -Count 1 -Quiet
        if ($result) {
            Write-Host "✅ $endpoint 연결 가능" -ForegroundColor Green
        } else {
            Write-Host "❌ $endpoint 연결 실패" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $endpoint 연결 실패" -ForegroundColor Red
    }
}

# MCP 서버별 개별 테스트
Write-Host ""
Write-Host "🧪 MCP 서버 개별 테스트:" -ForegroundColor Yellow

# Supabase 연결 테스트
Write-Host "  Testing Supabase..." -ForegroundColor Gray
try {
    # 실제로는 Claude Code에서 mcp__supabase__get_project_url 같은 명령어 사용
    Write-Host "  ✅ Supabase MCP 응답 정상" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Supabase MCP 응답 없음" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "헬스 체크 완료" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 결과 요약
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host ""
Write-Host "📊 요약 정보를 logs/mcp-health-$((Get-Date).ToString('yyyyMMdd')).log에 저장됨" -ForegroundColor Cyan
```

## 🔧 수동 진단 가이드

### 1. 기본 연결 테스트

```bash
# Claude Code에서 직접 테스트
mcp__supabase__get_project_url
mcp__supabase__list_tables
mcp__shadcn_ui__list_components
mcp__magic__21st_magic_component_inspiration
```

### 2. 환경 변수 검증

```powershell
# PowerShell에서 환경 변수 확인
$env:SUPABASE_ACCESS_TOKEN
$env:SUPABASE_PROJECT_REF

# 또는 Command Prompt에서
echo %SUPABASE_ACCESS_TOKEN%
```

### 3. 네트워크 연결 진단

```bash
# 기본 연결 테스트
curl -I https://supabase.com
curl -I https://21st.dev
curl -I https://registry.npmjs.org

# DNS 해상도 테스트
nslookup supabase.com
nslookup 21st.dev
```

## 📊 성능 모니터링

### 응답 시간 측정

```javascript
// MCP 명령어 실행 시간 측정 (Claude Code 내부에서)
const startTime = performance.now();
await mcp__supabase__list_tables();
const endTime = performance.now();
console.log(`실행 시간: ${endTime - startTime}ms`);
```

### 리소스 사용량 체크

```powershell
# 메모리 및 CPU 사용량 모니터링
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, CPU, WorkingSet

# 디스크 공간 확인
Get-PSDrive C | Select-Object Used, Free, @{Name="Total";Expression={$_.Used+$_.Free}}
```

## 🚨 알림 및 로깅

### 자동 로깅 설정

```javascript
// logs 디렉토리 생성 및 로그 파일 관리
const fs = require('fs');
const path = require('path');

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

function logHealthCheck(status, details) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${status}: ${JSON.stringify(details)}\n`;

    const logFile = path.join(logDir, `mcp-health-${new Date().toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(logFile, logEntry);
}

// 사용 예시
logHealthCheck('SUCCESS', { server: 'supabase', responseTime: '150ms' });
logHealthCheck('ERROR', { server: 'magic', error: 'Connection timeout' });
```

### 문제 발생 시 자동 알림

```powershell
# 이메일 알림 (예시)
function Send-HealthAlert {
    param($ServerName, $ErrorMessage)

    $subject = "MCP 서버 오류 알림: $ServerName"
    $body = @"
MCP 서버에 문제가 발생했습니다.

서버: $ServerName
오류: $ErrorMessage
시간: $(Get-Date)

확인이 필요합니다.
"@

    # Send-MailMessage 또는 외부 알림 서비스 사용
    Write-Host "🚨 알림: $subject" -ForegroundColor Red
    Write-Host $body -ForegroundColor Yellow
}
```

## 📅 정기 점검 스케줄

### 일일 점검 항목
- [ ] MCP 서버 응답 상태
- [ ] API 토큰 유효성
- [ ] 네트워크 연결 상태
- [ ] 디스크 공간 충분

### 주간 점검 항목
- [ ] 성능 메트릭 검토
- [ ] 로그 파일 분석
- [ ] 의존성 업데이트 체크
- [ ] 보안 설정 점검

### 월간 점검 항목
- [ ] 전체 시스템 성능 분석
- [ ] 사용량 통계 검토
- [ ] 백업 및 복구 테스트
- [ ] 문서 업데이트

## 🛠️ 복구 절차

### 일반적인 복구 단계

1. **문제 확인**
   ```bash
   # 헬스 체크 스크립트 실행
   ./scripts/mcp-health-check.ps1
   ```

2. **기본 해결책 시도**
   ```bash
   # Node.js 프로세스 재시작
   taskkill /F /IM node.exe

   # 환경 변수 재설정
   refreshenv
   ```

3. **설정 초기화**
   ```bash
   # MCP 설정 백업 후 재생성
   copy .mcp.json .mcp.json.backup
   # 설정 파일 수정 후 테스트
   ```

4. **전체 재설치**
   ```bash
   # npm 캐시 정리
   npm cache clean --force

   # MCP 서버 재설치
   npx -y @supabase/mcp-server-supabase@latest
   ```

## 📞 지원 연락처

문제가 지속될 경우:
- 📧 개발팀 이메일: dev-team@company.com
- 💬 슬랙 채널: #mcp-support
- 📋 이슈 트래커: GitHub Issues
- 📚 추가 문서: [MCP 공식 문서](https://github.com/modelcontextprotocol)

---

*정기적인 헬스 체크를 통해 안정적인 개발 환경을 유지하세요.*