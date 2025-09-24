# 데이터베이스 스키마 설계

## 개요

Question Diary 애플리케이션을 위한 PostgreSQL (Supabase) 데이터베이스 설계입니다.
현재는 MVP 기능에 집중하되, 향후 확장을 고려한 구조로 설계했습니다.

## 테이블 구조

### 1. questions (질문 테이블)

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    tags TEXT[], -- PostgreSQL 배열 타입
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**필드 설명:**
- `id`: 질문 고유 식별자
- `content`: 질문 내용 (필수)
- `category`: 질문 카테고리 (일반, 개인성찰, 목표 등)
- `difficulty_level`: 질문 난이도 (1-5)
- `tags`: 질문 태그 배열 (검색 및 분류용)
- `is_active`: 질문 활성화 상태
- `created_at/updated_at`: 생성/수정 시간

### 2. responses (답변 테이블)

```sql
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    response_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
    word_count INTEGER GENERATED ALWAYS AS (
        array_length(string_to_array(trim(content), ' '), 1)
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 하루에 하나의 답변만 허용
    UNIQUE(response_date)
);
```

**필드 설명:**
- `id`: 답변 고유 식별자
- `question_id`: 참조된 질문 ID (외래키)
- `content`: 답변 내용 (필수)
- `response_date`: 답변 날짜 (기본값: 현재 날짜)
- `mood_rating`: 기분 점수 (1-10, 선택사항)
- `word_count`: 단어 수 (자동 계산)
- `created_at/updated_at`: 생성/수정 시간
- **제약조건**: 하루에 하나의 답변만 허용 (UNIQUE)

### 3. daily_questions (일일 질문 할당 테이블)

```sql
CREATE TABLE daily_questions (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 하루에 하나의 질문만 할당
    UNIQUE(assigned_date)
);
```

**필드 설명:**
- `id`: 할당 고유 식별자
- `question_id`: 할당된 질문 ID
- `assigned_date`: 질문이 할당된 날짜
- `is_completed`: 답변 완료 여부
- **제약조건**: 하루에 하나의 질문만 할당

## 인덱스 설계

```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_responses_date ON responses(response_date DESC);
CREATE INDEX idx_responses_question ON responses(question_id);
CREATE INDEX idx_daily_questions_date ON daily_questions(assigned_date DESC);
CREATE INDEX idx_daily_questions_completed ON daily_questions(is_completed);

-- 전문 검색을 위한 GIN 인덱스 (향후 검색 기능용)
CREATE INDEX idx_questions_content_search ON questions USING GIN(to_tsvector('korean', content));
CREATE INDEX idx_responses_content_search ON responses USING GIN(to_tsvector('korean', content));
```

## 뷰 (View) 정의

### 1. daily_summary (일일 요약 뷰)

```sql
CREATE VIEW daily_summary AS
SELECT
    dq.assigned_date,
    q.content AS question_content,
    q.category,
    r.content AS response_content,
    r.word_count,
    r.mood_rating,
    r.created_at AS response_time,
    dq.is_completed
FROM daily_questions dq
LEFT JOIN questions q ON dq.question_id = q.id
LEFT JOIN responses r ON r.response_date = dq.assigned_date
ORDER BY dq.assigned_date DESC;
```

### 2. response_stats (답변 통계 뷰)

```sql
CREATE VIEW response_stats AS
SELECT
    COUNT(*) AS total_responses,
    AVG(word_count) AS avg_word_count,
    AVG(mood_rating) AS avg_mood_rating,
    MAX(response_date) AS last_response_date,
    COUNT(*) FILTER (WHERE response_date >= CURRENT_DATE - INTERVAL '30 days') AS responses_last_30_days
FROM responses;
```

## 함수 및 트리거

### 1. 일일 질문 자동 할당 함수

```sql
CREATE OR REPLACE FUNCTION assign_daily_question()
RETURNS TRIGGER AS $$
DECLARE
    random_question_id INTEGER;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- 오늘 날짜에 이미 할당된 질문이 있는지 확인
    IF EXISTS (SELECT 1 FROM daily_questions WHERE assigned_date = today_date) THEN
        RETURN NULL;
    END IF;

    -- 활성화된 질문 중에서 최근 30일간 사용되지 않은 질문을 랜덤 선택
    SELECT q.id INTO random_question_id
    FROM questions q
    WHERE q.is_active = true
    AND q.id NOT IN (
        SELECT dq.question_id
        FROM daily_questions dq
        WHERE dq.assigned_date >= today_date - INTERVAL '30 days'
    )
    ORDER BY RANDOM()
    LIMIT 1;

    -- 만약 30일간 사용되지 않은 질문이 없다면, 모든 활성 질문에서 선택
    IF random_question_id IS NULL THEN
        SELECT q.id INTO random_question_id
        FROM questions q
        WHERE q.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- 일일 질문 할당
    INSERT INTO daily_questions (question_id, assigned_date)
    VALUES (random_question_id, today_date);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 2. 답변 완료 시 상태 업데이트 트리거

```sql
CREATE OR REPLACE FUNCTION update_daily_question_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- 답변이 생성되면 해당 날짜의 daily_question을 완료로 표시
    UPDATE daily_questions
    SET is_completed = true
    WHERE assigned_date = NEW.response_date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_response_completion
    AFTER INSERT ON responses
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_question_completion();
```

### 3. 업데이트 시간 자동 갱신 트리거

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
    BEFORE UPDATE ON responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Supabase RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (현재 단계에서는 모든 사용자가 접근 가능)
-- 향후 사용자 인증 시 사용자별로 제한 가능

-- 질문은 모든 사용자가 읽기 가능
CREATE POLICY "질문 읽기 허용" ON questions
    FOR SELECT USING (true);

-- 답변은 모든 사용자가 읽기/쓰기 가능 (MVP 단계)
CREATE POLICY "답변 읽기 허용" ON responses
    FOR SELECT USING (true);

CREATE POLICY "답변 쓰기 허용" ON responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "답변 수정 허용" ON responses
    FOR UPDATE USING (true);

-- 일일 질문 할당은 읽기만 허용
CREATE POLICY "일일 질문 읽기 허용" ON daily_questions
    FOR SELECT USING (true);
```

## 초기 데이터 마이그레이션

```sql
-- 질문 카테고리 기본값 설정
INSERT INTO questions (content, category) VALUES
('오늘 하루 중 가장 기뻤던 순간은 언제였나요?', '감정'),
('최근에 배운 것 중 가장 인상 깊었던 것은 무엇인가요?', '학습'),
('내가 가장 소중하게 생각하는 가치는 무엇인가요?', '가치관'),
('오늘 누군가에게 감사함을 느꼈다면, 그 이유는 무엇인가요?', '감사'),
('최근에 도전해보고 싶은 새로운 일이 있나요?', '목표');

-- 오늘 날짜에 질문 할당
SELECT assign_daily_question();
```

## 백업 및 유지보수

### 정기 백업 전략
- Supabase 자동 백업 활용
- 주요 데이터 별도 백업 (질문 데이터)
- 답변 데이터 정기 아카이빙

### 성능 모니터링
- 쿼리 실행 계획 정기 점검
- 인덱스 사용률 모니터링
- 테이블 크기 증가 추세 관찰

## 향후 확장 계획

### Phase 2: 사용자 시스템
```sql
-- 사용자 테이블 추가 (Supabase Auth와 연동)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- responses 테이블에 user_id 컬럼 추가
ALTER TABLE responses ADD COLUMN user_id UUID REFERENCES user_profiles(id);
```

### Phase 3: 고급 기능
```sql
-- 질문 난이도 및 개인화
CREATE TABLE user_question_preferences (
    user_id UUID REFERENCES user_profiles(id),
    preferred_categories TEXT[],
    difficulty_preference INTEGER DEFAULT 3
);

-- 답변 태그 및 감정 분석
ALTER TABLE responses ADD COLUMN tags TEXT[];
ALTER TABLE responses ADD COLUMN sentiment_score DECIMAL(3,2);
```