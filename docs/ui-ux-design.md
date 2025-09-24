# UI/UX 설계 문서

## 개요

Question Diary 애플리케이션의 사용자 인터페이스 설계 문서입니다.
심플하고 직관적인 디자인으로 일기 작성에 집중할 수 있는 환경을 제공합니다.

## 디자인 원칙

### 1. 미니멀리즘
- 불필요한 요소 제거
- 핵심 기능에 집중
- 시각적 노이즈 최소화

### 2. 접근성 우선
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 최적화
- 색상 대비비 4.5:1 이상

### 3. 반응형 디자인
- Mobile First 접근법
- 데스크톱, 태블릿, 모바일 최적화
- 터치 친화적 인터페이스

### 4. 감정적 연결
- 따뜻하고 친근한 색상 팔레트
- 부드러운 곡선과 라운드 모서리
- 적절한 여백과 타이포그래피

## 색상 팔레트

### Primary Colors
```css
:root {
  /* 메인 브랜드 색상 */
  --color-primary-50: #fef7ee;
  --color-primary-100: #fdedd3;
  --color-primary-200: #fbd9a5;
  --color-primary-300: #f8c06d;
  --color-primary-400: #f5a233;
  --color-primary-500: #f2870a;
  --color-primary-600: #e36e00;
  --color-primary-700: #bc5502;
  --color-primary-800: #964308;
  --color-primary-900: #7a380b;
}
```

### Neutral Colors
```css
:root {
  /* 중성 색상 */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
}
```

### Semantic Colors
```css
:root {
  /* 의미적 색상 */
  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  --color-info-500: #3b82f6;
}
```

## 타이포그래피

### 폰트 스택
```css
:root {
  /* 한국어 최적화 폰트 스택 */
  --font-family-korean: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  --font-family-english: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}
```

### 폰트 크기 시스템
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### 줄 간격
```css
:root {
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

## 페이지 구조

### 1. 메인 페이지 (홈)
```
┌─────────────────────────────────┐
│           Header                │
├─────────────────────────────────┤
│                                 │
│         Today's Question        │
│                                 │
├─────────────────────────────────┤
│                                 │
│        Answer Section           │
│                                 │
├─────────────────────────────────┤
│        Action Buttons           │
└─────────────────────────────────┘
```

### 2. 답변 히스토리 페이지
```
┌─────────────────────────────────┐
│       Header + Navigation       │
├─────────────────────────────────┤
│          Filter Bar             │
├─────────────────────────────────┤
│                                 │
│        Response Cards           │
│        (Paginated List)         │
│                                 │
└─────────────────────────────────┘
```

## 컴포넌트 설계

### 1. Header Component
```typescript
interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}
```

**시각적 구성:**
- 좌측: 로고 또는 뒤로가기 버튼
- 중앙: 페이지 제목
- 우측: 네비게이션 메뉴 또는 액션 버튼

### 2. Question Card Component
```typescript
interface QuestionCardProps {
  question: string;
  category: string;
  date: string;
  isToday?: boolean;
}
```

**시각적 구성:**
- 카드 형태 (rounded-xl, shadow-soft)
- 카테고리 배지 (상단 우측)
- 질문 텍스트 (중앙 정렬)
- 날짜 정보 (하단)

### 3. Answer Form Component
```typescript
interface AnswerFormProps {
  questionId: number;
  existingAnswer?: string;
  onSubmit: (answer: string, mood?: number) => void;
  isLoading?: boolean;
}
```

**시각적 구성:**
- 텍스트 에어리어 (auto-resize)
- 기분 점수 선택기 (1-10)
- 단어 수 카운터
- 저장/수정 버튼

### 4. Response History Card
```typescript
interface ResponseHistoryCardProps {
  response: {
    id: number;
    date: string;
    question: string;
    answer: string;
    wordCount: number;
    moodRating?: number;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}
```

**시각적 구성:**
- 날짜 헤더
- 질문 (축약 표시)
- 답변 미리보기
- 통계 정보 (단어 수, 기분 점수)
- 액션 버튼들

### 5. Mood Rating Component
```typescript
interface MoodRatingProps {
  value?: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**시각적 구성:**
- 1-10 숫자 버튼 그리드
- 선택된 값 하이라이트
- 호버 효과 및 애니메이션

## 반응형 브레이크포인트

```css
/* Tailwind CSS 브레이크포인트 활용 */
:root {
  --breakpoint-sm: 640px;   /* 모바일 */
  --breakpoint-md: 768px;   /* 태블릿 */
  --breakpoint-lg: 1024px;  /* 데스크톱 */
  --breakpoint-xl: 1280px;  /* 대형 데스크톱 */
}
```

### 모바일 (< 640px)
- 단일 컬럼 레이아웃
- 풀스크린 모달 형태
- 터치 친화적 버튼 크기 (최소 44px)
- 하단 네비게이션

### 태블릿 (640px - 1024px)
- 최적화된 패딩과 여백
- 모달 크기 조정
- 사이드바 네비게이션

### 데스크톱 (> 1024px)
- 최대 너비 제한 (max-w-4xl)
- 사이드바 네비게이션
- 키보드 단축키 지원

## 상호작용 디자인

### 1. 애니메이션
```css
/* 부드러운 전환 효과 */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 페이드 인/아웃 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 2. 마이크로 인터랙션
- 버튼 호버 시 색상 변화
- 입력 필드 포커스 시 보더 하이라이트
- 저장 완료 시 체크마크 애니메이션
- 로딩 시 스켈레톤 UI

### 3. 피드백 메커니즘
- 성공: 녹색 토스트 메시지
- 오류: 빨간색 알림 + 상세 설명
- 로딩: 스피너 + 진행률 표시
- 확인: 모달 다이얼로그

## 접근성 고려사항

### 1. 키보드 네비게이션
```typescript
// 키보드 단축키 매핑
const shortcuts = {
  'Escape': '모달 닫기',
  'Tab': '다음 요소로 이동',
  'Shift+Tab': '이전 요소로 이동',
  'Enter': '버튼 활성화',
  'Ctrl+S': '답변 저장'
};
```

### 2. 스크린 리더 최적화
```html
<!-- ARIA 레이블 활용 -->
<textarea
  aria-label="오늘의 질문에 대한 답변을 작성해주세요"
  aria-describedby="character-count"
  role="textbox"
  aria-multiline="true"
/>

<div id="character-count" aria-live="polite">
  현재 {wordCount}자 작성됨
</div>
```

### 3. 색상 대비 검증
- 최소 4.5:1 대비비 준수
- 색상에만 의존하지 않는 정보 전달
- 다크 모드 지원 (향후)

## 컴포넌트 상태 관리

### 1. 로딩 상태
```typescript
interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  showSkeleton?: boolean;
}
```

### 2. 에러 상태
```typescript
interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorType?: 'network' | 'validation' | 'server';
  canRetry?: boolean;
}
```

### 3. 빈 상태
```typescript
interface EmptyState {
  isEmpty: boolean;
  emptyMessage?: string;
  emptyAction?: {
    text: string;
    onClick: () => void;
  };
}
```

## 사용자 플로우

### 1. 첫 방문 사용자
```
1. 랜딩 페이지 접근
2. 앱 소개 및 설명
3. 첫 번째 질문 제시
4. 답변 작성 유도
5. 성공 피드백
```

### 2. 기존 사용자
```
1. 홈페이지 접근
2. 오늘 답변 여부 확인
   - 미완료: 질문 + 답변 폼 표시
   - 완료: 기존 답변 + 편집 옵션
3. 과거 답변 히스토리 접근 가능
```

### 3. 답변 작성 플로우
```
1. 질문 읽기
2. 답변 작성 시작
3. 자동 저장 (선택적)
4. 기분 점수 선택
5. 최종 제출
6. 성공 피드백
```

## 성능 최적화

### 1. 지연 로딩
- 이미지 lazy loading
- 컴포넌트 code splitting
- 무한 스크롤 페이지네이션

### 2. 캐싱 전략
- 정적 자산 브라우저 캐싱
- API 응답 메모리 캐싱
- 로컬 스토리지 활용

### 3. 번들 최적화
- 트리 쉐이킹
- 중요하지 않은 CSS 지연 로딩
- 폰트 최적화 (font-display: swap)

## 테스트 전략

### 1. 시각적 테스트
- Storybook을 활용한 컴포넌트 테스트
- 크로스 브라우저 테스트
- 반응형 디자인 테스트

### 2. 접근성 테스트
- axe-core를 활용한 자동 검사
- 스크린 리더 테스트
- 키보드 네비게이션 테스트

### 3. 사용성 테스트
- 사용자 태스크 완료율 측정
- 인터페이스 직관성 평가
- 모바일 사용성 검증

## 향후 개선 계획

### Phase 2
- 다크 모드 지원
- 개인화된 테마 설정
- 더 풍부한 애니메이션

### Phase 3
- PWA 기능 (오프라인 지원)
- 음성 입력 지원
- 텍스트 크기 조절 기능