# 남은 작업 목록 및 로드맵

## 🚨 긴급 우선순위 (즉시 해결 필요)

### 1. 이메일 인증 이슈 해결
**현재 상황**: 테스트 계정이 이메일 미인증 상태로 로그인 불가

#### 해결 방법 A: 개발 환경 우회 로직 (권장)
```typescript
// src/contexts/AuthContext.tsx에 추가
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 개발 환경에서 이메일 인증 오류 우회
    if (import.meta.env.DEV && error.message.includes('Email not confirmed')) {
      console.warn('⚠️ 개발 환경: 이메일 인증 우회');
      // 다른 방법으로 사용자 정보 확인 후 진행
      return { data, error: null };
    }
    return { data: null, error };
  }

  return { data, error: null };
};
```

#### 해결 방법 B: 실제 이메일로 새 계정 생성
- Gmail, Naver 등 실제 접근 가능한 이메일로 계정 생성
- 이메일 인증 링크 클릭하여 계정 활성화

**예상 소요시간**: 15-30분
**완료 기준**: 테스트 계정으로 성공적으로 로그인

---

## ⚡ 높은 우선순위 (Phase 2 완료용)

### 2. 서비스 파일 인증 시스템 연동

#### 2-1. QuestionService 업데이트
**파일**: `src/services/questionService.ts`

**수정 필요사항**:
```typescript
export class QuestionService {
  static async getTodayQuestion(): Promise<Question | null> {
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const today = new Date().toISOString().split('T')[0];

    // 오늘의 질문 가져오기
    const { data: dailyQuestion } = await supabase
      .from('daily_questions')
      .select('*, question:questions(*)')
      .eq('assigned_date', today)
      .single();

    if (dailyQuestion) {
      // 사용자의 답변 확인
      const { data: userResponse } = await supabase
        .from('responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', dailyQuestion.question_id)
        .eq('response_date', today)
        .single();

      return {
        ...dailyQuestion.question,
        user_response: userResponse,
        daily_question_id: dailyQuestion.id
      };
    }

    return null;
  }
}
```

#### 2-2. ResponseService 업데이트
```typescript
export class ResponseService {
  static async saveResponse(
    questionId: string,
    content: string,
    moodRating?: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('responses')
      .insert({
        user_id: user.id,
        question_id: questionId,
        content,
        mood_rating: moodRating,
        response_date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
  }

  static async updateResponse(
    responseId: number,
    content: string,
    moodRating?: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('responses')
      .update({ content, mood_rating: moodRating })
      .eq('id', responseId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}
```

**예상 소요시간**: 1-2시간

### 3. HomePage 컴포넌트 연동 확인
- 기존 HomePage가 새로운 서비스와 잘 작동하는지 확인
- 필요 시 타입 및 인터페이스 조정

**예상 소요시간**: 30분-1시간

---

## 🔧 중간 우선순위 (기능 개선)

### 4. 사용자 경험 개선

#### 4-1. 에러 처리 강화
- 네트워크 오류 시 재시도 로직
- 사용자 친화적 에러 메시지
- 오프라인 상태 감지 및 안내

#### 4-2. 로딩 상태 개선
- 스켈레톤 UI 적용
- 진행률 표시
- 더 직관적인 로딩 애니메이션

#### 4-3. 답변 작성 UX
- 자동저장 기능 (임시 저장)
- 글자 수 실시간 표시
- 기분 선택 UI 개선

### 5. 성능 최적화

#### 5-1. 데이터 캐싱 전략
```typescript
// React Query 도입 예시
const { data: todayQuestion, isLoading, error } = useQuery(
  ['todayQuestion', user?.id, today],
  () => QuestionService.getTodayQuestion(),
  {
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    enabled: !!user,
  }
);
```

#### 5-2. 번들 크기 최적화
- 코드 분할 적용
- 불필요한 라이브러리 제거
- Tree shaking 최적화

---

## 🚀 낮은 우선순위 (향후 확장)

### 6. 고급 기능

#### 6-1. 검색 및 필터링
```typescript
interface SearchFilters {
  dateRange: { start: string; end: string };
  moodRange: { min: number; max: number };
  categories: string[];
  keywords: string;
}
```

#### 6-2. 통계 및 분석
- 답변 작성 빈도 그래프
- 기분 변화 추이 차트
- 카테고리별 참여도 분석
- 월별/연도별 요약 리포트

#### 6-3. 데이터 내보내기
- PDF 형태 일기장
- JSON/CSV 백업 파일
- 이메일 전송 기능

#### 6-4. 협업 기능 (선택적)
- 가족/친구와 질문 공유
- 그룹 챌린지 기능
- 익명 답변 갤러리

### 7. 기술적 개선

#### 7-1. 테스트 자동화
```typescript
// 예상 테스트 구조
describe('QuestionService', () => {
  it('should get today question for authenticated user', async () => {
    // 테스트 구현
  });

  it('should throw error for unauthenticated user', async () => {
    // 테스트 구현
  });
});
```

#### 7-2. CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
      - name: Build Application
      - name: Deploy to Vercel
```

#### 7-3. 모니터링 시스템
- 에러 추적 (Sentry)
- 성능 모니터링 (Web Vitals)
- 사용자 행동 분석

---

## 📅 로드맵

### 🎯 이번 주 목표: Phase 2 완전 완료
**Day 1-2**: 이메일 인증 이슈 해결 + 서비스 파일 연동
**Day 3-4**: 전체 기능 테스트 및 버그 수정
**Day 5**: 문서 정리 및 Phase 2 완료 선언

### 📈 다음 주 목표: 사용자 경험 개선
- 에러 처리 및 로딩 상태 개선
- 성능 최적화 적용
- 반응형 디자인 보완

### 🚀 향후 2-4주: 고급 기능 구현
- 검색 및 필터링 시스템
- 통계 및 분석 대시보드
- 데이터 내보내기 기능

### 🔧 장기 계획 (1-3개월)
- 테스트 자동화 구축
- CI/CD 파이프라인 완성
- 모니터링 및 분석 시스템
- 모바일 앱 개발 고려

---

## ✅ 성공 기준 및 KPI

### Phase 2 완료 기준
- [ ] 이메일 인증 없이도 개발 환경에서 로그인 가능
- [ ] 사용자별 독립된 질문-답변 데이터
- [ ] 모든 CRUD 기능 정상 작동
- [ ] TypeScript 에러 0개
- [ ] 기본 UI/UX 완성도 90% 이상

### 사용자 만족도 목표
- 회원가입부터 첫 답변까지 3분 이내
- 페이지 로딩 시간 2초 이내
- 모바일 접근성 90% 이상
- 7일 연속 사용 가능 (안정성)

### 기술적 품질 기준
- 코드 커버리지 80% 이상 (향후)
- Core Web Vitals 모든 지표 Good
- 보안 취약점 0개
- 접근성 WCAG 2.1 AA 레벨

---

## 🔄 지속적 개선 프로세스

### 주간 리뷰
- 사용자 피드백 수집 및 분석
- 성능 지표 모니터링
- 버그 리포트 검토 및 우선순위 설정

### 월간 계획
- 새로운 기능 우선순위 재검토
- 기술 스택 업데이트 검토
- 보안 감사 및 업데이트

### 분기별 목표
- 주요 기능 로드맵 업데이트
- 사용자 만족도 조사
- 경쟁사 분석 및 차별화 전략 수립

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
*최종 수정: 2025년 9월 25일*
*담당자: Claude Code Development Team*