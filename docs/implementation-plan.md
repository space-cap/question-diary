# 구현 작업 계획서

## 개요

Question Diary 프로젝트의 실제 구현을 위한 단계별 작업 계획서입니다.
설계 문서를 바탕으로 실제 개발 작업을 체계적으로 진행하기 위한 가이드입니다.

## 작업 우선순위 매트릭스

### 🔴 Phase 1: 기반 구축 (1주차)
**목표**: 개발 환경 설정 및 데이터베이스 구축

#### 1.1 Supabase 프로젝트 설정 (1일차)
- [ ] Supabase 계정 생성 및 새 프로젝트 생성
- [ ] 프로젝트 URL 및 API Keys 확인
- [ ] 환경변수 파일 설정 (.env.local)
- [ ] Supabase 클라이언트 설치 및 설정

**체크리스트**:
```bash
# 필요한 패키지 설치
npm install @supabase/supabase-js

# 환경변수 설정
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

#### 1.2 데이터베이스 스키마 구현 (2일차)
- [ ] database-schema.md의 테이블 생성 SQL 실행
- [ ] 초기 질문 데이터 마이그레이션
- [ ] RLS 정책 설정
- [ ] 트리거 및 함수 구현

**구현 순서**:
1. questions 테이블 생성
2. responses 테이블 생성
3. daily_questions 테이블 생성
4. 인덱스 및 제약조건 설정
5. 뷰(View) 생성
6. 트리거 함수 구현

#### 1.3 기본 프로젝트 구조 설정 (3일차)
- [ ] 폴더 구조 정리 및 표준화
- [ ] React Router 설치 및 기본 라우팅 설정
- [ ] TypeScript 타입 정의 파일 작성
- [ ] Supabase 클라이언트 wrapper 작성

**폴더 구조**:
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── question/       # 질문 관련 컴포넌트
│   └── response/       # 답변 관련 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── styles/             # 공통 스타일
```

### 🟡 Phase 2: 핵심 기능 구현 (2-3주차)
**목표**: 질문-답변 시스템 구현

#### 2.1 질문 시스템 구현 (4-5일차)
- [ ] Question 타입 정의
- [ ] QuestionService API 서비스 구현
- [ ] 오늘의 질문 조회 로직
- [ ] QuestionCard 컴포넌트 구현
- [ ] 일일 질문 할당 시스템 테스트

**구현 파일들**:
```typescript
// types/question.ts
export interface Question {
  id: number;
  content: string;
  category: string;
  difficulty_level: number;
  tags: string[];
  is_active: boolean;
}

// services/questionService.ts
export class QuestionService {
  static async getTodayQuestion(): Promise<DailyQuestion | null>
  static async getQuestionById(id: number): Promise<Question | null>
}

// components/question/QuestionCard.tsx
export const QuestionCard: React.FC<QuestionCardProps>
```

#### 2.2 답변 시스템 구현 (6-8일차)
- [ ] Response 타입 정의
- [ ] ResponseService API 서비스 구현
- [ ] AnswerForm 컴포넌트 구현
- [ ] 답변 저장/수정 로직
- [ ] MoodRating 컴포넌트 구현
- [ ] 단어 수 카운터 기능

**핵심 컴포넌트들**:
```typescript
// components/response/AnswerForm.tsx
export const AnswerForm: React.FC<{
  questionId: number;
  existingResponse?: Response;
  onSave: (response: Response) => void;
}>

// components/response/MoodRating.tsx
export const MoodRating: React.FC<{
  value?: number;
  onChange: (rating: number) => void;
}>
```

#### 2.3 답변 히스토리 구현 (9-10일차)
- [ ] ResponseHistory 페이지 구현
- [ ] ResponseCard 컴포넌트 구현
- [ ] 페이지네이션 구현
- [ ] 기본 검색 및 필터링 기능
- [ ] 날짜별 정렬 기능

### 🟢 Phase 3: UI/UX 및 최적화 (4주차)
**목표**: 사용자 경험 향상

#### 3.1 반응형 디자인 구현 (11-12일차)
- [ ] 모바일 퍼스트 CSS 작성
- [ ] Tailwind CSS 커스텀 설정
- [ ] 브레이크포인트별 레이아웃 최적화
- [ ] 터치 인터페이스 최적화

#### 3.2 상태 관리 및 UX 개선 (13-14일차)
- [ ] React Query/TanStack Query 도입
- [ ] 로딩 상태 컴포넌트 구현
- [ ] 에러 핸들링 컴포넌트 구현
- [ ] 성공/실패 토스트 메시지 구현
- [ ] 키보드 네비게이션 지원

### 🔵 Phase 4: 테스트 및 배포 (5-6주차)
**목표**: 품질 보증 및 배포 준비

#### 4.1 테스트 구현 (15-16일차)
- [ ] Jest 및 Testing Library 설정
- [ ] 컴포넌트 단위 테스트
- [ ] API 서비스 테스트
- [ ] E2E 테스트 (Playwright)

#### 4.2 배포 및 모니터링 (17-18일차)
- [ ] Vercel/Netlify 배포 설정
- [ ] CI/CD 파이프라인 구축
- [ ] 환경변수 설정
- [ ] 성능 모니터링 설정

## 일일 작업 체크리스트

### Day 1: Supabase 설정
```bash
# 작업 시작 체크리스트
□ Supabase 프로젝트 생성
□ 패키지 설치: npm install @supabase/supabase-js
□ 환경변수 설정
□ 기본 연결 테스트
□ Git 커밋: "Supabase 프로젝트 설정 완료"

# 완료 기준
- Supabase 대시보드 접근 가능
- React 앱에서 Supabase 연결 확인
- 환경변수 정상 로드
```

### Day 2: 데이터베이스 스키마
```sql
-- 실행할 SQL 순서
1. questions 테이블 생성
2. responses 테이블 생성
3. daily_questions 테이블 생성
4. 인덱스 생성
5. 뷰 생성
6. 함수 및 트리거 생성
7. 초기 질문 데이터 입력

-- 검증 방법
SELECT COUNT(*) FROM questions; -- 365개 이상
SELECT * FROM daily_summary WHERE assigned_date = CURRENT_DATE;
```

### Day 3: 프로젝트 구조
```bash
# 폴더 생성
mkdir -p src/{components/{common,question,response},pages,hooks,services,types,utils,styles}

# 라우터 설정
npm install react-router-dom @types/react-router-dom

# 기본 타입 정의 파일 생성
touch src/types/{question.ts,response.ts,common.ts}

# 커밋 메시지
git commit -m "프로젝트 기본 구조 및 라우팅 설정"
```

### Day 4-5: 질문 시스템
**우선순위 작업**:
1. Question 타입 정의
2. Supabase 클라이언트 래퍼 구현
3. getTodayQuestion API 구현
4. QuestionCard 컴포넌트 기본 구현
5. 홈 페이지에서 오늘의 질문 표시

**테스트 방법**:
```typescript
// 수동 테스트 시나리오
1. 브라우저에서 홈페이지 접근
2. 오늘의 질문이 표시되는지 확인
3. 새로고침 시 같은 질문 표시되는지 확인
4. 콘솔에 에러 없는지 확인
```

### Day 6-8: 답변 시스템
**구현 순서**:
1. Response 타입 정의
2. AnswerForm 컴포넌트 구현 (기본 textarea)
3. 답변 저장 API 연동
4. MoodRating 컴포넌트 구현
5. 단어 수 카운터 추가
6. 성공/실패 피드백 구현

**테스트 시나리오**:
```
1. 질문 페이지에서 답변 작성
2. 답변 저장 확인 (DB 확인)
3. 기분 점수 선택 기능 확인
4. 단어 수 실시간 업데이트 확인
5. 저장 완료 후 피드백 메시지 확인
```

### Day 9-10: 답변 히스토리
**구현 체크리스트**:
- [ ] 답변 목록 조회 API
- [ ] ResponseCard 컴포넌트
- [ ] 날짜별 정렬
- [ ] 기본 페이지네이션
- [ ] 답변 수정 기능

## 품질 기준

### 코드 품질 체크리스트
- [ ] TypeScript 타입 오류 0개
- [ ] ESLint 경고 0개
- [ ] 모든 컴포넌트에 PropTypes 또는 TypeScript 타입
- [ ] 중복 코드 최소화
- [ ] 적절한 주석 작성

### 기능 품질 체크리스트
- [ ] 모든 주요 기능 정상 동작
- [ ] 에러 상황 적절히 처리
- [ ] 로딩 상태 표시
- [ ] 모바일에서 정상 동작
- [ ] 키보드 네비게이션 가능

### 성능 체크리스트
- [ ] 첫 페이지 로딩 3초 이내
- [ ] 불필요한 리렌더링 최소화
- [ ] 이미지 최적화 적용
- [ ] 번들 크기 적정 수준

## 트러블슈팅 가이드

### 자주 발생하는 문제들

#### 1. Supabase 연결 문제
**증상**: API 호출 시 CORS 에러 또는 연결 실패
**해결책**:
```typescript
// 환경변수 확인
console.log(process.env.REACT_APP_SUPABASE_URL);

// 클라이언트 초기화 확인
const supabase = createClient(url, key);
console.log(await supabase.from('questions').select('count'));
```

#### 2. 날짜 관련 문제
**증상**: 시간대 차이로 질문이 잘못 표시
**해결책**:
```typescript
// 로컬 날짜 사용
const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
const { data } = await supabase
  .from('daily_summary')
  .select('*')
  .eq('assigned_date', today);
```

#### 3. React 렌더링 문제
**증상**: 무한 리렌더링 또는 상태 업데이트 이슈
**해결책**:
```typescript
// useEffect 의존성 배열 확인
useEffect(() => {
  fetchTodayQuestion();
}, []); // 빈 배열로 한 번만 실행

// 콜백 함수 메모이제이션
const handleSave = useCallback((response: Response) => {
  // 저장 로직
}, []);
```

## 완료 기준 및 검증

### Phase 1 완료 기준
- [ ] Supabase 연결 및 기본 쿼리 실행 가능
- [ ] 모든 테이블 정상 생성 및 초기 데이터 입력
- [ ] 기본 프로젝트 구조 완성
- [ ] 라우팅 정상 동작

### Phase 2 완료 기준
- [ ] 오늘의 질문 표시 및 새로고침 시 동일 질문 표시
- [ ] 답변 작성 및 저장 정상 동작
- [ ] 기분 점수 및 단어 수 기능 정상 동작
- [ ] 답변 히스토리 조회 가능

### Phase 3 완료 기준
- [ ] 모든 화면 반응형 대응
- [ ] 로딩/에러 상태 적절히 표시
- [ ] 사용자 피드백 시스템 구현
- [ ] 키보드 네비게이션 지원

### Phase 4 완료 기준
- [ ] 주요 기능 테스트 커버리지 80% 이상
- [ ] 프로덕션 배포 완료
- [ ] 성능 지표 달성
- [ ] 모니터링 시스템 가동

## 다음 단계 준비

### Phase 1 완료 후 즉시 시작할 작업들
1. **타입 정의 완성**: 모든 데이터 타입 명확히 정의
2. **API 서비스 구조화**: 일관된 API 호출 패턴 구축
3. **에러 처리 전략**: 공통 에러 처리 시스템 설계

### 백로그 아이템들
- 다크 모드 지원
- 오프라인 모드 (PWA)
- 답변 검색 기능
- 데이터 내보내기
- 사용자 통계 대시보드

이 작업 계획서를 참고하여 체계적으로 개발을 진행하면 됩니다. 각 단계별로 명확한 완료 기준과 검증 방법이 있어 진행 상황을 정확히 파악할 수 있습니다.