# 개인 일기 시스템 구현 계획

## 개요

현재의 Question Diary를 개인화된 로그인 기반 일기 시스템으로 확장하는 구현 계획서입니다. 사용자 인증, 개인 데이터 관리, 보안 등을 포함한 종합적인 개발 로드맵을 제공합니다.

---

## 🎯 목표 및 요구사항

### 핵심 목표
- 사용자별 개인 일기 공간 제공
- 안전한 로그인 및 인증 시스템
- 개인 데이터 보안 및 프라이버시 보장
- 기존 기능과의 원활한 통합

### 주요 요구사항
- 이메일/소셜 로그인 지원
- 개인별 일기 데이터 분리
- 반응형 로그인/회원가입 UI
- 세션 관리 및 보안
- 데이터 백업 및 복구

---

## 🏗️ 시스템 아키텍처 설계

### 현재 시스템 vs 목표 시스템

```
현재: 단일 사용자 → 공용 데이터
목표: 다중 사용자 → 개인별 데이터 분리
```

### 아키텍처 변경 사항

#### 1. 데이터베이스 스키마 확장
```sql
-- 기존 테이블들에 user_id 추가
-- 새로운 사용자 관리 테이블 추가
-- 개인정보 및 설정 테이블 추가
```

#### 2. 인증 시스템 통합
```
Supabase Auth → React 앱 → 개인 데이터 접근
```

#### 3. 보안 레이어 추가
```
RLS (Row Level Security) → 사용자별 데이터 격리
JWT 토큰 → 세션 관리
HTTPS → 통신 암호화
```

---

## 📊 데이터베이스 설계

### 1. 사용자 테이블 구조

#### `profiles` 테이블 (사용자 프로필)
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    timezone TEXT DEFAULT 'Asia/Seoul',
    language TEXT DEFAULT 'ko',
    theme_preference TEXT DEFAULT 'system', -- light, dark, system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
```

#### `user_settings` 테이블 (개인 설정)
```sql
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- 개인 설정 예시
-- { key: "diary_reminder_time", value: "20:00" }
-- { key: "mood_tracking_enabled", value: true }
-- { key: "privacy_level", value: "private" }
```

### 2. 기존 테이블 수정

#### `questions` 테이블 수정
```sql
-- 관리자가 생성한 공통 질문 vs 사용자 개인 질문 구분
ALTER TABLE questions ADD COLUMN created_by UUID REFERENCES profiles(id);
ALTER TABLE questions ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN is_active BOOLEAN DEFAULT true;

-- RLS 정책
CREATE POLICY "Users can view public questions or own questions"
    ON questions FOR SELECT
    USING (is_public = true OR created_by = auth.uid());
```

#### `responses` 테이블 수정
```sql
-- 기존 테이블에 사용자 연결
ALTER TABLE responses ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 기존 데이터가 있다면 임시 사용자로 마이그레이션 필요

-- RLS 정책
CREATE POLICY "Users can only see own responses"
    ON responses FOR ALL
    USING (user_id = auth.uid());
```

#### `daily_questions` 테이블 수정
```sql
-- 사용자별 오늘의 질문 관리
ALTER TABLE daily_questions ADD COLUMN user_id UUID REFERENCES profiles(id);
ALTER TABLE daily_questions ADD COLUMN is_custom BOOLEAN DEFAULT false;

-- 사용자가 질문을 건너뛰거나 미루는 기능 추가
ALTER TABLE daily_questions ADD COLUMN status TEXT DEFAULT 'active';
-- 'active', 'skipped', 'postponed', 'completed'
```

### 3. 새로운 테이블 추가

#### `diary_entries` 테이블 (자유형 일기)
```sql
CREATE TABLE diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    weather TEXT,
    location TEXT,
    tags TEXT[], -- 사용자 정의 태그
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 검색을 위한 인덱스
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, created_at DESC);
CREATE INDEX idx_diary_entries_content_fts ON diary_entries USING gin(to_tsvector('korean', content));

-- RLS 정책
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own diary entries"
    ON diary_entries FOR ALL
    USING (user_id = auth.uid());
```

#### `user_streaks` 테이블 (연속 기록)
```sql
CREATE TABLE user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL, -- 'daily_question', 'diary_entry', 'mood_tracking'
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);
```

---

## 🔐 인증 및 보안 구현

### 1. Supabase Auth 설정

#### Auth 제공자 설정
```typescript
// supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// 이메일 인증 설정
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
    data: {
      full_name: '사용자 이름',
      username: 'username'
    }
  }
})
```

#### 소셜 로그인 설정
```typescript
// Google 로그인
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback'
  }
})

// GitHub 로그인
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback'
  }
})
```

### 2. React 인증 컨텍스트

#### AuthContext 구현
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 새 사용자 등록 시 프로필 생성
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserProfile(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || '',
        avatar_url: user.user_metadata.avatar_url || '',
        username: user.user_metadata.username || null
      })

    if (error) console.error('프로필 생성 오류:', error)
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}
```

### 3. 보호된 라우트 구현

#### ProtectedRoute 컴포넌트
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login'
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
```

---

## 🎨 UI/UX 컴포넌트 설계

### 1. 인증 페이지 구현

#### 로그인 페이지
```typescript
// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export const LoginPage = () => {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            일기장 로그인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/auth/signup" className="text-blue-600 hover:underline">
                회원가입
              </Link>
            </p>
            <Link
              to="/auth/reset-password"
              className="text-sm text-blue-600 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="github" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 소셜 로그인 버튼 컴포넌트
```typescript
// src/components/auth/SocialLoginButton.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'

interface SocialLoginButtonProps {
  provider: 'google' | 'github'
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider }) => {
  const [loading, setLoading] = useState(false)

  const handleSocialLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error)
    } finally {
      setLoading(false)
    }
  }

  const providerConfig = {
    google: {
      name: 'Google',
      icon: '🔍', // 실제로는 Google 아이콘 사용
      bgColor: 'bg-red-500 hover:bg-red-600'
    },
    github: {
      name: 'GitHub',
      icon: '🐙', // 실제로는 GitHub 아이콘 사용
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    }
  }

  const config = providerConfig[provider]

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSocialLogin}
      disabled={loading}
      className="w-full"
    >
      <span className="mr-2">{config.icon}</span>
      {config.name}
    </Button>
  )
}
```

### 2. 사용자 대시보드

#### 대시보드 메인 페이지
```typescript
// src/pages/DashboardPage.tsx
import { useAuth } from '../contexts/AuthContext'
import { useUserStats } from '../hooks/useUserStats'
import { QuickStats } from '../components/dashboard/QuickStats'
import { RecentEntries } from '../components/dashboard/RecentEntries'
import { MoodChart } from '../components/dashboard/MoodChart'
import { StreakCard } from '../components/dashboard/StreakCard'

export const DashboardPage = () => {
  const { user } = useAuth()
  const { stats, loading } = useUserStats(user?.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user?.user_metadata?.full_name || '사용자'}님! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          오늘도 소중한 하루를 기록해보세요.
        </p>
      </div>

      {/* 빠른 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickStats
          title="총 일기 수"
          value={stats?.totalEntries || 0}
          icon="📝"
        />
        <QuickStats
          title="평균 기분 점수"
          value={stats?.averageMood || 0}
          icon="😊"
          format="decimal"
        />
        <StreakCard
          title="연속 작성"
          current={stats?.currentStreak || 0}
          longest={stats?.longestStreak || 0}
        />
        <QuickStats
          title="이번 달 작성"
          value={stats?.thisMonthEntries || 0}
          icon="📅"
        />
      </div>

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 일기 목록 */}
        <RecentEntries userId={user?.id} />

        {/* 기분 변화 차트 */}
        <MoodChart userId={user?.id} />
      </div>
    </div>
  )
}
```

---

## 🔄 데이터 마이그레이션 계획

### 1. 기존 데이터 마이그레이션

#### 마이그레이션 스크립트
```sql
-- 1단계: 임시 사용자 생성 (기존 데이터용)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'legacy@questiondiary.local',
    NOW(),
    NOW()
);

-- 2단계: 프로필 생성
INSERT INTO profiles (id, email, full_name, username)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'legacy@questiondiary.local',
    'Legacy User',
    'legacy_user'
);

-- 3단계: 기존 응답에 사용자 ID 할당
UPDATE responses
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

-- 4단계: 기존 오늘의 질문에 사용자 ID 할당
UPDATE daily_questions
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;
```

### 2. 데이터 무결성 확인

#### 마이그레이션 검증 쿼리
```sql
-- 고아 레코드 확인
SELECT COUNT(*) FROM responses WHERE user_id IS NULL;
SELECT COUNT(*) FROM daily_questions WHERE user_id IS NULL;

-- 사용자별 데이터 분포 확인
SELECT
    p.username,
    COUNT(DISTINCT r.id) as response_count,
    COUNT(DISTINCT dq.id) as daily_question_count
FROM profiles p
LEFT JOIN responses r ON p.id = r.user_id
LEFT JOIN daily_questions dq ON p.id = dq.user_id
GROUP BY p.id, p.username;
```

---

## 🚀 구현 우선순위 및 단계

### Phase 1: 기본 인증 시스템 (1-2주)
1. **Supabase Auth 설정**
   - 이메일/비밀번호 인증
   - 소셜 로그인 (Google, GitHub)
   - 이메일 인증 플로우

2. **React 인증 구조**
   - AuthContext 구현
   - ProtectedRoute 컴포넌트
   - 로그인/회원가입 페이지

3. **기본 데이터베이스 스키마**
   - profiles 테이블 생성
   - 기존 테이블에 user_id 추가
   - RLS 정책 적용

### Phase 2: 사용자별 데이터 분리 (1-2주)
1. **데이터 마이그레이션**
   - 기존 데이터 사용자 할당
   - 데이터 무결성 검증

2. **개인화된 UI**
   - 사용자 대시보드
   - 개인 설정 페이지
   - 프로필 관리

3. **개인 일기 기능**
   - 자유형 일기 작성
   - 일기 목록 및 검색
   - 태그 시스템

### Phase 3: 고급 기능 (2-3주)
1. **통계 및 분석**
   - 개인 통계 대시보드
   - 기분 변화 차트
   - 작성 패턴 분석

2. **사용자 경험 개선**
   - 연속 작성 스트릭
   - 알림 및 리마인더
   - 데이터 내보내기

3. **보안 강화**
   - 2단계 인증
   - 세션 관리 개선
   - 데이터 암호화

### Phase 4: 추가 기능 (1-2주)
1. **소셜 기능** (선택사항)
   - 일기 공유 (선택적)
   - 친구 시스템
   - 공개 일기 피드

2. **고급 분석**
   - AI 기반 감정 분석
   - 개인화된 질문 추천
   - 성장 트래킹

---

## 🛡️ 보안 및 프라이버시 고려사항

### 1. 데이터 보호
- **암호화**: 민감한 개인 정보 암호화 저장
- **RLS**: Row Level Security로 데이터 격리
- **백업**: 정기적인 데이터 백업 및 복구 계획

### 2. 사용자 권한 관리
- **최소 권한 원칙**: 필요한 최소한의 권한만 부여
- **세션 관리**: JWT 토큰 만료 시간 설정
- **로그아웃 처리**: 완전한 세션 정리

### 3. 컴플라이언스
- **GDPR 대응**: 사용자 데이터 삭제 권리
- **개인정보보호법**: 국내 개인정보 보호 규정 준수
- **이용약관**: 명확한 데이터 사용 정책

---

## 🧪 테스트 전략

### 1. 인증 시스템 테스트
```typescript
// 로그인 테스트 예시
describe('Authentication', () => {
  test('사용자가 올바른 자격 증명으로 로그인할 수 있다', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginPage />)

    fireEvent.change(getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(getByPlaceholderText('비밀번호'), {
      target: { value: 'password123' }
    })

    fireEvent.click(getByText('로그인'))

    // 대시보드로 리디렉션 확인
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard')
    })
  })
})
```

### 2. 데이터 격리 테스트
```sql
-- RLS 정책 테스트
-- 사용자 A로 로그인 후 사용자 B의 데이터 접근 시도
-- 결과: 접근 거부되어야 함
```

### 3. E2E 테스트
```typescript
// Playwright를 활용한 E2E 테스트
test('전체 사용자 플로우', async ({ page }) => {
  // 회원가입 → 로그인 → 일기 작성 → 로그아웃
  await page.goto('/auth/signup')
  await page.fill('[placeholder="이메일"]', 'newuser@test.com')
  await page.fill('[placeholder="비밀번호"]', 'securepass123')
  await page.click('button[type="submit"]')

  // 이메일 인증 후 로그인
  // ...

  // 일기 작성
  await page.goto('/diary/new')
  await page.fill('[placeholder="오늘 하루는 어땠나요?"]', '오늘은 정말 좋은 하루였습니다.')
  await page.click('button:has-text("저장")')

  // 저장 확인
  await expect(page.locator('text=일기가 저장되었습니다')).toBeVisible()
})
```

---

## 📋 체크리스트

### 개발 전 준비사항
- [ ] Supabase 프로젝트 설정 확인
- [ ] 이메일 제공자 설정 (SendGrid, AWS SES 등)
- [ ] 소셜 로그인 앱 등록 (Google, GitHub)
- [ ] 도메인 및 HTTPS 설정
- [ ] 개발/스테이징 환경 분리

### Phase 1 체크리스트
- [ ] AuthContext 구현 및 테스트
- [ ] 로그인/회원가입 페이지 구현
- [ ] 소셜 로그인 통합
- [ ] ProtectedRoute 구현
- [ ] 기본 프로필 관리 기능
- [ ] 이메일 인증 플로우
- [ ] 비밀번호 재설정 기능

### Phase 2 체크리스트
- [ ] 데이터베이스 스키마 마이그레이션
- [ ] RLS 정책 적용 및 테스트
- [ ] 기존 데이터 마이그레이션
- [ ] 사용자별 일기 CRUD 기능
- [ ] 검색 및 필터링 기능
- [ ] 사용자 설정 관리

### Phase 3 체크리스트
- [ ] 개인 통계 대시보드
- [ ] 기분 변화 추적 차트
- [ ] 연속 작성 스트릭 시스템
- [ ] 알림 시스템 (이메일/브라우저)
- [ ] 데이터 내보내기 기능
- [ ] 모바일 반응형 최적화

---

## 💡 추가 고려사항

### 1. 성능 최적화
- **지연 로딩**: 대용량 일기 목록 페이지네이션
- **캐싱**: 자주 접근하는 사용자 데이터 캐싱
- **이미지 최적화**: 프로필 사진 및 첨부 이미지 처리

### 2. 사용자 경험 개선
- **오프라인 지원**: PWA로 오프라인 일기 작성
- **다크 모드**: 기존 다크 모드와 사용자별 설정 연동
- **접근성**: WCAG 2.1 AA 준수

### 3. 향후 확장 가능성
- **모바일 앱**: React Native로 네이티브 앱 개발
- **AI 통합**: GPT API를 활용한 일기 분석 및 조언
- **팀/가족 기능**: 그룹 일기 또는 가족 공유 기능

---

## 📚 참고 자료

### 기술 문서
- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [React Context API 가이드](https://reactjs.org/docs/context.html)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

### 관련 프로젝트 문서
- [`mcp-integration-guide.md`](./mcp-integration-guide.md) - MCP 서버 활용
- [`system-architecture.md`](./system-architecture.md) - 현재 시스템 구조
- [`database-schema.md`](./database-schema.md) - 현재 데이터베이스 설계

---

*이 문서는 개발 진행에 따라 지속적으로 업데이트됩니다.*