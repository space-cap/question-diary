# API 설계 문서

## 개요

Question Diary 애플리케이션의 API 설계 문서입니다.
Supabase의 자동 생성 REST API와 실시간 구독을 활용하여 효율적인 데이터 통신을 구현합니다.

## API 엔드포인트 설계

### Base URL
```
Production: https://your-project.supabase.co/rest/v1
Development: http://localhost:54321/rest/v1
```

### 인증 헤더
```
Authorization: Bearer [anon-key]
apikey: [anon-key]
Content-Type: application/json
```

## 1. 질문 관리 API

### 1.1 오늘의 질문 조회
```http
GET /daily_summary?assigned_date=eq.2024-01-15
```

**응답 예시:**
```json
{
  "assigned_date": "2024-01-15",
  "question_content": "오늘 하루 중 가장 기뻤던 순간은 언제였나요?",
  "category": "감정",
  "response_content": null,
  "word_count": null,
  "mood_rating": null,
  "response_time": null,
  "is_completed": false
}
```

### 1.2 모든 질문 목록 조회
```http
GET /questions?is_active=eq.true&order=id
```

**쿼리 매개변수:**
- `category`: 특정 카테고리 필터링
- `limit`: 결과 수 제한
- `offset`: 페이지네이션용

### 1.3 특정 질문 조회
```http
GET /questions?id=eq.123
```

## 2. 답변 관리 API

### 2.1 답변 생성
```http
POST /responses
```

**요청 본문:**
```json
{
  "question_id": 123,
  "content": "오늘 친구와 함께한 점심시간이 가장 즐거웠습니다.",
  "mood_rating": 8,
  "response_date": "2024-01-15"
}
```

**응답:**
```json
{
  "id": 456,
  "question_id": 123,
  "content": "오늘 친구와 함께한 점심시간이 가장 즐거웠습니다.",
  "mood_rating": 8,
  "response_date": "2024-01-15",
  "word_count": 12,
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

### 2.2 답변 수정
```http
PATCH /responses?id=eq.456
```

**요청 본문:**
```json
{
  "content": "수정된 답변 내용",
  "mood_rating": 9
}
```

### 2.3 과거 답변 조회
```http
GET /daily_summary?order=assigned_date.desc&limit=30
```

**쿼리 매개변수:**
- `assigned_date`: 특정 날짜 범위 필터
- `is_completed`: 답변 완료 여부 필터
- `limit`: 결과 수 제한

### 2.4 답변 삭제
```http
DELETE /responses?id=eq.456
```

## 3. 통계 및 분석 API

### 3.1 답변 통계 조회
```http
GET /response_stats
```

**응답:**
```json
{
  "total_responses": 45,
  "avg_word_count": 87.5,
  "avg_mood_rating": 7.2,
  "last_response_date": "2024-01-15",
  "responses_last_30_days": 28
}
```

### 3.2 카테고리별 답변 분포
```http
GET /rpc/get_category_stats
```

## 4. 실시간 구독 (Supabase Realtime)

### 4.1 새로운 질문 할당 구독
```javascript
const subscription = supabase
  .channel('daily_questions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'daily_questions'
    },
    (payload) => {
      console.log('새로운 질문이 할당되었습니다:', payload);
    }
  )
  .subscribe();
```

### 4.2 답변 작성 실시간 업데이트
```javascript
const subscription = supabase
  .channel('responses')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'responses'
    },
    (payload) => {
      console.log('답변 업데이트:', payload);
    }
  )
  .subscribe();
```

## 5. 클라이언트 SDK 사용 예시

### 5.1 Supabase 클라이언트 설정
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
```

### 5.2 오늘의 질문 및 답변 조회
```javascript
const getTodayQuestion = async () => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('assigned_date', today)
    .single();

  if (error) {
    console.error('질문 조회 오류:', error);
    return null;
  }

  return data;
};
```

### 5.3 답변 저장
```javascript
const saveResponse = async (questionId, content, moodRating = null) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('responses')
    .insert({
      question_id: questionId,
      content: content,
      mood_rating: moodRating,
      response_date: today
    })
    .select()
    .single();

  if (error) {
    console.error('답변 저장 오류:', error);
    return { success: false, error };
  }

  return { success: true, data };
};
```

### 5.4 과거 답변 목록 조회
```javascript
const getResponseHistory = async (limit = 30, offset = 0) => {
  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .not('response_content', 'is', null)
    .order('assigned_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('답변 히스토리 조회 오류:', error);
    return [];
  }

  return data;
};
```

### 5.5 답변 업데이트
```javascript
const updateResponse = async (responseId, content, moodRating = null) => {
  const { data, error } = await supabase
    .from('responses')
    .update({
      content: content,
      mood_rating: moodRating
    })
    .eq('id', responseId)
    .select()
    .single();

  if (error) {
    console.error('답변 업데이트 오류:', error);
    return { success: false, error };
  }

  return { success: true, data };
};
```

## 6. 에러 처리

### 6.1 공통 에러 응답 형식
```json
{
  "error": {
    "message": "에러 메시지",
    "details": "상세 에러 정보",
    "hint": "해결 방법 힌트",
    "code": "42501"
  }
}
```

### 6.2 주요 에러 코드
- `23505`: 중복 키 오류 (하루에 답변 중복 작성)
- `23503`: 외래 키 제약 위반
- `42501`: 권한 부족
- `22001`: 문자열 길이 초과

### 6.3 클라이언트 에러 처리 예시
```javascript
const handleApiError = (error) => {
  switch (error.code) {
    case '23505':
      return '이미 오늘 답변을 작성했습니다.';
    case '23503':
      return '존재하지 않는 질문입니다.';
    case '42501':
      return '접근 권한이 없습니다.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
};
```

## 7. 성능 최적화

### 7.1 쿼리 최적화
```javascript
// 필요한 컬럼만 선택
const { data } = await supabase
  .from('responses')
  .select('id, content, response_date, mood_rating')
  .order('response_date', { ascending: false })
  .limit(10);

// 인덱스를 활용한 필터링
const { data } = await supabase
  .from('questions')
  .select('*')
  .eq('category', 'emotion')
  .eq('is_active', true);
```

### 7.2 캐싱 전략
```javascript
// React Query를 활용한 캐싱
import { useQuery } from '@tanstack/react-query';

const useTodayQuestion = () => {
  return useQuery({
    queryKey: ['today-question'],
    queryFn: getTodayQuestion,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    cacheTime: 1000 * 60 * 30, // 30분간 백그라운드 캐시
  });
};
```

## 8. 보안 고려사항

### 8.1 입력 데이터 검증
```javascript
const validateResponse = (content) => {
  if (!content || content.trim().length === 0) {
    throw new Error('답변 내용을 입력해주세요.');
  }

  if (content.length > 5000) {
    throw new Error('답변은 5000자를 초과할 수 없습니다.');
  }

  return content.trim();
};
```

### 8.2 Rate Limiting
- Supabase의 기본 Rate Limiting 활용
- 클라이언트 사이드 debouncing 구현

### 8.3 데이터 검증
```javascript
// Zod를 활용한 타입 검증
import { z } from 'zod';

const ResponseSchema = z.object({
  question_id: z.number().positive(),
  content: z.string().min(1).max(5000),
  mood_rating: z.number().min(1).max(10).optional(),
  response_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
```

## 9. 테스트 전략

### 9.1 API 테스트
```javascript
// Jest를 활용한 API 테스트
describe('Response API', () => {
  test('답변 생성이 정상 동작해야 한다', async () => {
    const response = await saveResponse(1, '테스트 답변', 8);

    expect(response.success).toBe(true);
    expect(response.data.content).toBe('테스트 답변');
    expect(response.data.mood_rating).toBe(8);
  });

  test('중복 답변 생성 시 에러가 발생해야 한다', async () => {
    // 첫 번째 답변 생성
    await saveResponse(1, '첫 번째 답변');

    // 중복 답변 시도
    const response = await saveResponse(1, '중복 답변');

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('23505');
  });
});
```

## 10. 향후 확장 계획

### 10.1 사용자 인증 API (Phase 2)
```http
POST /auth/v1/signup
POST /auth/v1/token?grant_type=password
GET /auth/v1/user
```

### 10.2 고급 검색 API (Phase 3)
```http
GET /rpc/search_responses?query=happiness&limit=10
GET /rpc/get_mood_trends?start_date=2024-01-01&end_date=2024-01-31
```

### 10.3 데이터 내보내기 API (Phase 3)
```http
GET /rpc/export_responses?format=json&start_date=2024-01-01
GET /rpc/generate_pdf_export?year=2024
```