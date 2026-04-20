<!--
  BUSINESS_IMMIGRATION_SPEC.md — 섹션 14 초안
  생성자: Claude Code (개발자 세션)
  생성일: 2026-04-20
  상태: 초안 · 커밋되지 않음

  주의:
  - 본 파일은 기획자(PM) 로컬본의 섹션 0~13 이후에 병합될 "섹션 14" 단독 초안입니다.
  - 섹션 0~13은 PM 로컬본을 그대로 사용하며, 본 파일의 섹션 0~13 영역은 병합 지시 주석만 남겨둡니다.
  - 본 파일은 센터장님·PM 확인 후 확정본 커밋 단계에서 하나의 파일로 합치시면 됩니다.
  - 섹션 14 내부에 "[콘솔 확인 후 확정]" 표식이 있는 항목은 후속 콘솔 쿼리 결과로 확정이 필요합니다.
-->

<!-- ============================================================ -->
<!-- 섹션 0 ~ 13                                                    -->
<!-- ============================================================ -->
<!--
  [PM 로컬본과 병합 예정]
  섹션 0 전제 및 원칙
  섹션 1 신규 파일 목록
  섹션 2 URL 라우팅
  섹션 3 랜딩 페이지 구조
  섹션 4 상담 신청 페이지
  섹션 5 블로그 처리
  섹션 6 쓰레드 상태머신
  섹션 7 대시보드 UI 조정
  섹션 8 i18n 번역 키 추가
  섹션 9 데이터 모델 변경
  섹션 10 변경되지 않는 것
  섹션 11 테스트·검증 체크리스트
  섹션 12 전달 방식
  섹션 13 확정되지 않은 항목
-->

---

# 14. 사업이민 전용 데이터 스키마 및 Storage 분리

## 14-0. 진단 결과 요약 (PROJECT_KNOWLEDGE.md 섹션 7 인용 + 콘솔 확인 업데이트)

### 14-0-1. PROJECT_KNOWLEDGE.md 섹션 7 원문 (5가지 발견사항)

**발견 1 — `on_auth_user_created` 트리거 저장소에 존재하지 않음**
저장소 SQL 파일(`sql/*`·`migrations/*`) 어디에도 정의가 없음. 프로필 레코드는 클라이언트 측 `createUserProfile()` upsert로만 생성됨(`js/supabase-client.js:171-192`).

**발견 2 — 프로필 완성도 판정이 `passport_number` 단일 필드**
`hasProfile` 판정이 `passport_number` 한 필드의 NULL 여부로 결정됨(`js/supabase-client.js:972-974`). `profile-submit.html` 폼에 `passportNumber` 입력 필드가 보이지 않아 구조적 버그 가능성.

**발견 3 — Storage RLS가 SQL 저장소에 없음**
`storage.objects` 대상 `CREATE POLICY`가 저장소 전체에 없음. 형상관리 밖에 있는 상태.

**발견 4 — 쓰레드 생성 실패 조용한 무시**
Edge Function `confirm-payment`은 결제 승인 성공 후 `threads` INSERT 실패 시 결제를 성공 처리(`confirm-payment/index.ts:263-271`). 사업이민 쓰레드는 반드시 실패 시 사용자 피드백 + 관리자 알림 구현 필요.

**발견 5 — i18n 7개 언어 수동 동기화 필요**
`js/translations.js`는 7개 언어 각자 독립 객체(총 8,385줄). 새 네임스페이스 도입 시 7개 언어 × 키 개수 수동 편집 필요. 미추가 키는 `ko` 폴백 동작.

### 14-0-2. 콘솔 확인 결과 업데이트 (2026-04-20)

| # | 진단 결과 | 콘솔 확인 결과 | 상태 |
|---|---|---|---|
| 발견 1 | 저장소에 트리거 없음 → 콘솔 수동 설정 "가능성" | `on_auth_user_created` 트리거 **실존 확정**. `handle_new_user()` 함수가 `profiles`에 `id`/`email`/`name`/`role='customer'`/`created_at`/`updated_at` 삽입, `ON CONFLICT (id) DO NOTHING` | 형상관리 밖 지속 |
| 발견 3 | SQL 저장소에 Storage RLS 없음 → "가능성" | `storage.objects` 테이블에 **12개 정책 실존 확정** (4개 버킷에 걸쳐) | 형상관리 밖 지속 |
| 추가 발견 A | — | `documents`·`passports` 버킷 **존재하지만 파일 0개** (RLS 정책은 각 3개씩 잔존) | 정리 대상 후보 |
| 추가 발견 B | — | 진단에서 "미사용"으로 지목된 6개 중 `avatars`·`blog`·`thread_files`·`user_avatars` 4개는 **애초에 존재하지 않음** | 문서 보정 완료 |
| 추가 발견 C | — | `profile-documents` admin SELECT 정책의 `EXISTS` 서브쿼리가 `objects.id = auth.uid()` 조건을 사용. 일반적 admin 검증 패턴(`admins.id = auth.uid()`)과 구조가 다름 | 관찰 사실 기록 |
| 추가 발견 D | — | `thread_documents`의 SELECT/INSERT 정책은 `bucket_id` 매칭만 검사하고 경로 소유권 검증 없음. 인증된 사용자는 어느 경로 파일에도 접근 가능 | 관찰 사실 기록 |

### 14-0-3. 본 섹션 14가 해결하는 범위

- 사업이민 전용 **데이터 스키마 신설** (기존 `profiles`·`threads` 구조에 최소 영향)
- 사업이민 전용 **Storage 버킷 신설** (RLS 정책을 SQL 마이그레이션 형태로 형상관리)
- **쓰레드 생성 실패 처리** (발견 4) 개선 — 단, `confirm-payment` Edge Function 수정은 결제 연동 작업에 포함되므로 범위 밖. 본 섹션은 **사업이민 상담 신청 경로의 실패 처리**만 정의
- **프로필 완성도 판정**을 사업이민 한정 `profile_completed` 불리언 컬럼 도입으로 해결 (발견 2의 구조적 모호성 우회)
- **i18n 7개 언어 스텁 운용 방침** 확정 (발견 5 대응)

### 14-0-4. 본 섹션 14가 해결하지 않는 범위 (명시)

- 기존 `handle_new_user()` 트리거 수정 (저장소 편입 여부는 별도 결정)
- 기존 Storage RLS 정책 정리 (`documents`·`passports` 버킷 삭제 등)
- `profile-documents` admin 정책의 `objects.id = auth.uid()` 구조 보정
- `thread_documents` SELECT/INSERT 정책에 경로 제약 추가
- `confirm-payment` Edge Function의 L263-271 수정 (결제 연동 작업 범위)

위 5개 항목은 **후속 별도 작업**으로 분리. 본 섹션 14 구현 시 기존 코드·정책은 그대로 유지.

## 14-1. 신규 테이블 DDL

### 14-1-1. `business_immigration_profiles` (신규 테이블)

사업이민 지원자의 사전 상담용 프로필. 기존 `profiles` 테이블은 수정하지 않고, 사업이민 전용 정보를 별도 테이블로 분리합니다.

**설계 원칙**
- `user_id`를 기본키(PK) 겸 `auth.users(id)` 외래키로 사용 → 사용자 1인당 사업이민 프로필 1건.
- `profile_completed`는 BEFORE 트리거로 자동 계산(섹션 14-6 참조).
- `updated_at`은 UPDATE 트리거로 자동 갱신.

```sql
-- migrations/20260420_create_business_immigration_profiles.sql

CREATE TABLE public.business_immigration_profiles (
  -- 메타
  user_id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed            boolean     NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),

  -- 기본 정보 (8)
  last_name_en                 text        NOT NULL,
  first_name_en                text        NOT NULL,
  full_name_native             text,
  nationality                  text        NOT NULL,
  passport_number              text        NOT NULL,
  passport_expiry              date        NOT NULL,
  birth_date                   date        NOT NULL,
  gender                       text        NOT NULL
                                 CHECK (gender IN ('male','female','other')),

  -- 거주·연락 (6)
  residence_country            text        NOT NULL,
  home_address                 text,
  home_phone                   text,
  email                        text        NOT NULL,
  native_language              text        NOT NULL,
  preferred_contact_method     text        NOT NULL
                                 CHECK (preferred_contact_method IN ('email','thread','phone')),

  -- 가족 구성 (1)
  family_composition           jsonb,

  -- 이민 의도 (5)
  visa_type_interest           text        NOT NULL
                                 CHECK (visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  timeline                     text
                                 CHECK (timeline IS NULL
                                        OR timeline IN ('3months','6months','1year','over1year','undecided')),
  preferred_industry           text,
  preferred_location           text,
  funding_source               text,

  -- 배경 (5)
  education_background         text,
  work_experience              text,
  korea_visit_history          text,
  korean_language_proficiency  text,
  criminal_record              boolean
);

-- 인덱스
CREATE INDEX idx_biz_profiles_nationality
  ON public.business_immigration_profiles(nationality);
CREATE INDEX idx_biz_profiles_visa_type_interest
  ON public.business_immigration_profiles(visa_type_interest);
CREATE INDEX idx_biz_profiles_profile_completed
  ON public.business_immigration_profiles(profile_completed)
  WHERE profile_completed = false;  -- 미완 프로필 대시보드 조회용 부분 인덱스

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_biz_profiles_set_updated_at
  BEFORE UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS 활성화
ALTER TABLE public.business_immigration_profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 고객은 자기 레코드만 SELECT/INSERT/UPDATE
CREATE POLICY biz_profiles_owner_select
  ON public.business_immigration_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY biz_profiles_owner_insert
  ON public.business_immigration_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY biz_profiles_owner_update
  ON public.business_immigration_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 정책: super_admin은 모두 SELECT/UPDATE
CREATE POLICY biz_profiles_super_admin_all
  ON public.business_immigration_profiles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ));
```

**[콘솔 확인 후 확정]** — `user_role` ENUM 타입의 실제 정의·허용값. 콘솔 확인 시 다음 쿼리 실행 권장:
```sql
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;
```

### 14-1-2. `consultation_requests` (확장 또는 신규)

사업이민 상담 신청 시점의 **스냅샷**을 저장합니다. SOT 원칙(확정사항 2번)에 따라 `nationality`는 여기에 제출 시점 값이 고정되고, 이후 변경되지 않습니다.

**[콘솔 확인 후 확정]** — `consultation_requests` 테이블 실존 여부. 저장소 코드·SQL에는 해당 테이블 생성·참조 없음. 콘솔에 존재하면 아래는 `ALTER TABLE`로 변환 후 적용. 존재하지 않으면 `CREATE TABLE` 그대로.

**콘솔 확인 쿼리**:
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'consultation_requests'
) AS exists_flag;
```

#### (A) 테이블이 없는 경우 — `CREATE TABLE`

```sql
-- migrations/20260420_create_consultation_requests.sql

CREATE TABLE public.consultation_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type             text NOT NULL DEFAULT 'general'
                              CHECK (request_type IN ('general','business_immigration')),
  thread_id                uuid,  -- threads(id) 참조(순환 외래키 회피 위해 FK 없이 인덱스만)

  -- 사업이민 전용 스냅샷 필드 (9개)
  nationality              text,
  residence_country        text,
  visa_type_interest       text
                              CHECK (visa_type_interest IS NULL
                                     OR visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  family_composition       jsonb,
  children_count           integer,
  timeline                 text
                              CHECK (timeline IS NULL
                                     OR timeline IN ('3months','6months','1year','over1year','undecided')),
  message                  text,
  contact_method           text
                              CHECK (contact_method IS NULL
                                     OR contact_method IN ('email','thread','phone')),
  email                    text,

  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_consult_requests_user_id      ON public.consultation_requests(user_id);
CREATE INDEX idx_consult_requests_thread_id    ON public.consultation_requests(thread_id);
CREATE INDEX idx_consult_requests_request_type ON public.consultation_requests(request_type);

ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY consult_requests_owner_select
  ON public.consultation_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY consult_requests_owner_insert
  ON public.consultation_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY consult_requests_super_admin_all
  ON public.consultation_requests
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));
```

#### (B) 테이블이 이미 존재하는 경우 — `ALTER TABLE`

```sql
-- migrations/20260420_alter_consultation_requests_for_business_immigration.sql

ALTER TABLE public.consultation_requests
  ADD COLUMN IF NOT EXISTS request_type       text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS nationality        text,
  ADD COLUMN IF NOT EXISTS residence_country  text,
  ADD COLUMN IF NOT EXISTS visa_type_interest text,
  ADD COLUMN IF NOT EXISTS family_composition jsonb,
  ADD COLUMN IF NOT EXISTS children_count     integer,
  ADD COLUMN IF NOT EXISTS timeline           text,
  ADD COLUMN IF NOT EXISTS message            text,
  ADD COLUMN IF NOT EXISTS contact_method     text;

ALTER TABLE public.consultation_requests
  ADD CONSTRAINT consult_requests_request_type_check
    CHECK (request_type IN ('general','business_immigration')),
  ADD CONSTRAINT consult_requests_visa_type_check
    CHECK (visa_type_interest IS NULL
           OR visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  ADD CONSTRAINT consult_requests_timeline_check
    CHECK (timeline IS NULL
           OR timeline IN ('3months','6months','1year','over1year','undecided')),
  ADD CONSTRAINT consult_requests_contact_method_check
    CHECK (contact_method IS NULL
           OR contact_method IN ('email','thread','phone'));

-- 기존 RLS 정책에 사업이민 케이스 별도 추가 필요 여부는 콘솔 확인 후 결정.
-- request_type 구분 없이 `user_id = auth.uid()`로만 제어되면 신규 정책 불필요.
```

## 14-2. 기존 `threads` 테이블 컬럼 추가 DDL

확정사항 4번(별도 컬럼 `business_immigration_status` 신설)에 따라 `threads` 테이블에 **2개 컬럼**을 추가합니다. 기존 `status` 컬럼의 기존 값·의미는 보존되며, 사업이민 쓰레드는 `status='active'`로 고정되고 실제 진행 단계는 `business_immigration_status`에서 추적됩니다.

**[콘솔 확인 후 확정]** — `threads.status` 컬럼이 `text`인지 ENUM 타입인지 확인 필요. ENUM이면 `ALTER TYPE ... ADD VALUE 'active'`가 선행되어야 함.

**콘솔 확인 쿼리**:
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'threads'
  AND column_name  = 'status';
```
- `data_type = 'text'`이면 아래 DDL 그대로 실행.
- `data_type = 'USER-DEFINED'`이고 `udt_name`이 ENUM(예: `thread_status`)이면 `ALTER TYPE` 선행 + `status` 신규 추가 값이 `'active'`인지 확정.

### 14-2-1. DDL (text 컬럼 가정)

```sql
-- migrations/20260420_alter_threads_add_business_immigration.sql

-- (text 컬럼 케이스)
ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS request_type                text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS business_immigration_status text;

ALTER TABLE public.threads
  ADD CONSTRAINT threads_request_type_check
    CHECK (request_type IN ('general','business_immigration')),
  ADD CONSTRAINT threads_biz_status_check
    CHECK (
      business_immigration_status IS NULL
      OR business_immigration_status IN (
           'pre_consultation',
           'detailed_consultation',
           'stage1_engaged',
           'stage1_completed',
           'stage2_engaged',
           'visa_issued',
           'aftercare',
           'archived'
         )
    );

-- 사업이민 쓰레드는 status='active' 고정 → 기존 status 값과 공존을 위해 별도 CHECK 불필요
-- (기존 status 허용값 집합에 'active' 추가가 이미 되어 있는지만 확인 필요)

-- 인덱스
CREATE INDEX idx_threads_request_type
  ON public.threads(request_type);
CREATE INDEX idx_threads_biz_status
  ON public.threads(business_immigration_status)
  WHERE business_immigration_status IS NOT NULL;
```

### 14-2-2. ENUM 컬럼인 경우 대안 DDL

`threads.status`가 ENUM 타입으로 판명되면(예: `thread_status`), 위 DDL 대신 아래로 교체:

```sql
-- ENUM 타입에 'active' 값 추가
ALTER TYPE public.thread_status ADD VALUE IF NOT EXISTS 'active';

-- 그 외 DDL은 위와 동일
ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS request_type                text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS business_immigration_status text;
-- (CHECK·인덱스는 위와 동일)
```

### 14-2-3. 컬럼 의미 정의

| 컬럼 | 의미 | 허용값 | 기본값 | NULL 허용 |
|---|---|---|---|---|
| `request_type` | 쓰레드 타입 구분자 | `general` \| `business_immigration` | `general` | No |
| `business_immigration_status` | 사업이민 프로젝트 단계 | (위 8개 값) | — | Yes (일반 쓰레드일 때 NULL) |
| `status` (기존) | 처리 단계 | 기존 값들 + `active` | 기존 유지 | 기존 유지 |

### 14-2-4. 데이터 정합성 규칙

애플리케이션 레벨에서 보장해야 할 규칙(DB 제약으로는 표현 복잡, 코드·코드 리뷰로 강제):

- `request_type = 'business_immigration'` → `status = 'active'`로 고정, `business_immigration_status`는 NOT NULL.
- `request_type = 'general'` → `business_immigration_status`는 NULL, `status`는 기존 값(`payment`/`document`/`processing`/`completed`/`archived` 등).

필요 시 BEFORE INSERT/UPDATE 트리거로 보강 가능. 초기에는 코드 리뷰로 보장하고, 정합성 문제가 관찰되면 트리거 도입.

### 14-2-5. 기존 관리자 쿼리 호환성

`admin-dashboard.html`·`admin-thread.html` 등의 기존 SQL/필터 중 `status` 기준 조회는 모두 `request_type='general'` 조건을 **추가**하여 동작 보존. 본 스펙 구현 시 관리자 쿼리 수정 항목은 14-7·14-10에서 상세.

## 14-3. 신규 Storage 버킷 구조 및 RLS 정책

### 14-3-1. 신규 버킷 개요

| 항목 | 값 |
|---|---|
| 버킷 이름 | `business-immigration-documents` |
| `public` | `false` |
| 경로 컨벤션 | `{user_id}/{document_type}/{timestamp}_{sanitizedFileName}` |
| `document_type` 허용값 | `passport` \| `criminal_record` \| `education` \| `family` \| `funding` \| `contracts` |
| file_size_limit | 50 MB (50 × 1048576 bytes) |
| allowed_mime_types | `application/pdf`, `image/jpeg`, `image/png`, `image/heic` |

**설계 근거(콘솔 관찰 반영)**:
- 기존 `thread_documents` 버킷의 SELECT/INSERT 정책은 `bucket_id` 매칭만 하고 경로 소유권 검증이 없음(진단 발견 D). 본 신규 버킷은 **모든 작업(SELECT/INSERT/UPDATE/DELETE)에 `{user_id}/...` 경로 소유권 검증 적용**으로 이 패턴을 따르지 않음.
- 기존 `profile-documents` 버킷의 admin 정책은 `objects.id = auth.uid()` 구조(진단 발견 C)를 사용. 본 신규 버킷은 `profiles.id = auth.uid() AND profiles.role = 'super_admin'` 표준 패턴 사용.

### 14-3-2. 마이그레이션 SQL (전문)

```sql
-- migrations/20260420_create_business_immigration_storage.sql

-- 1) 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-immigration-documents',
  'business-immigration-documents',
  false,
  52428800,  -- 50 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/heic']
)
ON CONFLICT (id) DO NOTHING;


-- 2) RLS 정책 — 고객: 자기 파일만 전체 작업
--    경로 첫 세그먼트(storage.foldername(name)[1])가 auth.uid()와 일치해야 허용

CREATE POLICY biz_docs_owner_select
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY biz_docs_owner_insert
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] IN
        ('passport','criminal_record','education','family','funding','contracts')
  );

CREATE POLICY biz_docs_owner_update
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY biz_docs_owner_delete
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );


-- 3) RLS 정책 — super_admin: 전체 작업 허용

CREATE POLICY biz_docs_super_admin_all
  ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  );

-- 그 외 역할(anon·partner_admin·customer 타인)은 정책 미매칭 → 자연 deny
```

### 14-3-3. 경로 컨벤션 강제 로직

INSERT 정책의 `WITH CHECK`에서 경로 2번째 세그먼트(`document_type`)를 허용 목록으로 제한합니다. 이는 **클라이언트가 임의 폴더에 업로드하는 것을 방지**합니다.

**허용되는 경로 예**:
- `{user_id}/passport/1713568800_passport.pdf` ✅
- `{user_id}/criminal_record/1713568800_fbi_cert.pdf` ✅

**차단되는 경로 예**:
- `{user_id}/unknown_type/file.pdf` ❌ (2번째 세그먼트가 허용 목록 밖)
- `other_user_id/passport/file.pdf` ❌ (1번째 세그먼트가 auth.uid()와 불일치)
- `{user_id}/passport/subfolder/file.pdf` ❌ (3번째 세그먼트는 파일명이어야 함, `storage.foldername`의 배열 구조상 오히려 2번째가 `subfolder`로 잡히지 않도록 클라이언트 경로 생성 시 `/`개수 제한 필요)

### 14-3-4. 클라이언트 업로드 함수 시그니처 (참고)

`js/supabase-client.js`에 신규 함수 추가(구현 작업 시):

```javascript
async function uploadBusinessImmigrationDocument(documentType, file) {
    const session = await supabaseClient.auth.getSession();
    if (!session.data.session) throw new Error('Not authenticated');

    const userId = session.data.session.user.id;
    const allowedTypes = ['passport','criminal_record','education','family','funding','contracts'];
    if (!allowedTypes.includes(documentType)) {
        throw new Error('Invalid document_type: ' + documentType);
    }

    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${documentType}/${timestamp}_${sanitized}`;

    return supabaseClient.storage
      .from('business-immigration-documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
}
```

### 14-3-5. 다운로드 URL

기존 `thread_documents` 패턴 참고:
- 고객 다운로드: 1시간 유효 서명 URL (`createSignedUrl(path, 3600)`)
- 관리자 장기 보관: 1년 유효(`createSignedUrl(path, 31536000)`)

### 14-3-6. 관찰 기반 주의사항 (본 버킷에는 적용하지 않음)

본 신규 버킷 설계는 기존 버킷들의 관찰된 특이사항을 **의도적으로 회피**합니다. 기존 버킷 정책의 보정 여부는 후속 작업으로 분리.

| 기존 관찰 | 본 버킷 적용 | 비고 |
|---|---|---|
| `profile-documents` admin 정책 `objects.id = auth.uid()` | 미채택 | 표준 `profiles.role` 패턴 사용 |
| `thread_documents` SELECT/INSERT 경로 제약 없음 | 미채택 | 모든 작업 경로 소유권 검증 |
| `documents`·`passports` 버킷 `roles=public` | 미채택 | `authenticated` 사용 |
| 정책명 한글/영문 혼용 | 영문으로 통일 | `biz_docs_*` 접두 |

## 14-4. 사업이민 전용 프로필 필드 상세 (29개 + 메타)

PROJECT_KNOWLEDGE.md 섹션 7 확정 목록. 정본은 **나열된 29개 필드 전부**(옵션 A 확정, 헤딩 "7개·5개"는 오기 정정).

### 14-4-1. 카테고리별 필드 요약

| 카테고리 | 필드 수 |
|---|---|
| 기본 정보 | 8 |
| 거주·연락 | 6 |
| 가족 구성 | 1 |
| 이민 의도 | 5 |
| 배경 | 5 |
| 메타 | 4 |
| **합계** | **29** |

### 14-4-2. 기본 정보 (8개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 1 | `last_name_en` | text | ✅ | 영문 성 | 폼 |
| 2 | `first_name_en` | text | ✅ | 영문 이름 | 폼 |
| 3 | `full_name_native` | text | — | 본국어 성명 | 폼 |
| 4 | `nationality` | text | ✅ | ISO 국가 코드 또는 국가명 문자열 | 폼 |
| 5 | `passport_number` | text | ✅ | 여권번호 | 폼 (신규) |
| 6 | `passport_expiry` | date | ✅ | 여권 유효기간 | 폼 (신규) |
| 7 | `birth_date` | date | ✅ | 생년월일 | 폼 (신규) |
| 8 | `gender` | text | ✅ | `male` \| `female` \| `other` | 폼 (신규) |

### 14-4-3. 거주·연락 (6개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 9 | `residence_country` | text | ✅ | 현재 거주국 | 폼 |
| 10 | `home_address` | text | — | 본국 주소 | 폼 (신규) |
| 11 | `home_phone` | text | — | 본국 연락처 | 폼 (신규) |
| 12 | `email` | text | ✅ | Google OAuth 이메일 자동 채움, 변경 가능 | 폼 |
| 13 | `native_language` | text | ✅ | 모국어 | 폼 (신규) |
| 14 | `preferred_contact_method` | text | ✅ | `email` \| `thread` \| `phone` | 폼 |

### 14-4-4. 가족 구성 (1개)

| # | 컬럼명 | 타입 | 필수 | 구조 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 15 | `family_composition` | jsonb | — | `{ spouse: bool, children: int, parents: bool, spouse_info?: {...}, children_info?: [...] }` | 폼(부분) |

**`family_composition` 스키마(JSON)**:
```json
{
  "spouse": true,
  "children": 2,
  "parents": false,
  "spouse_info": {
    "name": "...",
    "birth_date": "YYYY-MM-DD",
    "nationality": "..."
  },
  "children_info": [
    { "name": "...", "birth_date": "YYYY-MM-DD", "nationality": "..." },
    { "name": "...", "birth_date": "YYYY-MM-DD", "nationality": "..." }
  ]
}
```

`spouse_info`·`children_info`는 선택. 폼에서는 `spouse`·`children`(수)·`parents` 3개 체크/숫자만 수집, 세부 정보는 본 상담에서 관리자가 채움.

### 14-4-5. 이민 의도 (5개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 16 | `visa_type_interest` | text | ✅ | `D-9-4` \| `D-9-5` \| `undecided` | 폼 |
| 17 | `timeline` | text | — | `3months` \| `6months` \| `1year` \| `over1year` \| `undecided` | 폼 |
| 18 | `preferred_industry` | text | — | 희망 업종 | 폼 (신규) |
| 19 | `preferred_location` | text | — | 희망 지역 | 폼 (신규) |
| 20 | `funding_source` | text | — | 자유 서술 (자금 규모 언급 금지 원칙 유지: 서술은 본인 의사) | 폼 (신규) |

**주의 — `funding_source` 원칙**: 확정사항 섹션 4와 원 명세 섹션 4-3에 따라 **폼 단계에서 자금 규모·금액을 질문하지 않습니다**. 본 필드는 "본인이 밝히고자 하는 자금 조달 방식"(예: `개인 자산`, `투자자 유치 예정`, `가족 지원` 등 자유 서술)만 담는 선택 필드. 관리자는 본 상담에서 상세 확인.

### 14-4-6. 배경 (5개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 21 | `education_background` | text | — | 최종 학력·전공 등 자유 서술 | 폼 (신규) |
| 22 | `work_experience` | text | — | 주요 경력 자유 서술 | 폼 (신규) |
| 23 | `korea_visit_history` | text | — | 한국 방문 이력 자유 서술(사업이민 대상이지만 관광 방문 경험은 있을 수 있음) | 폼 (신규) |
| 24 | `korean_language_proficiency` | text | — | 자유 서술 또는 `none` \| `beginner` \| `intermediate` \| `advanced` | 폼 (신규) |
| 25 | `criminal_record` | boolean | — | 본인 신고 기준, 상세는 Stage 2 증빙 | 폼 (신규) |

### 14-4-7. 메타 (4개)

| # | 컬럼명 | 타입 | 필수 | 기본값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 26 | `profile_completed` | boolean | ✅ | `false`, BEFORE 트리거 자동 계산 (14-6 참조) | — |
| 27 | `user_id` | uuid | ✅ | `auth.users(id)` FK, PK | — |
| 28 | `created_at` | timestamptz | ✅ | `now()` | — |
| 29 | `updated_at` | timestamptz | ✅ | `now()`, UPDATE 트리거로 자동 갱신 | — |

### 14-4-8. 명시적 제외 필드

PROJECT_KNOWLEDGE.md 섹션 7 확정 — 한국 미방문 외국인 대상이므로 다음은 저장하지 않음:

- `alien_registration_number` (외국인등록번호)
- 현재 `visa_type` / `stay_expiry` (한국 내 체류자격·만료일)
- `korea_address` (한국 내 주소)

기존 `profiles` 테이블은 이 필드들을 가질 수 있으나, 사업이민 사용자는 해당 값을 `NULL`로 둡니다.

### 14-4-9. 언어 라벨 (i18n 키 매핑)

각 필드의 한국어·영어 라벨은 섹션 8(i18n)과 14-9 운용 규칙에 따라 `biz.form.*` 네임스페이스로 추가. 키 이름은 컬럼명과 동일한 snake_case 매핑(예: `biz.form.last_name_en`).

구체 번역 카피는 본 섹션 범위 밖(원 명세 섹션 13에서 "후속 전달"로 분리). 키 스텁은 런칭 전 반드시 7개 언어 전부 추가(섹션 14-9 참조).

## 14-5. 사업이민 전용 문서 업로드 항목 (Stage 1 이전 · Stage 2 구분)

PROJECT_KNOWLEDGE.md 섹션 7 확정. Storage 버킷은 `business-immigration-documents` 단일, 경로 컨벤션으로 문서 유형 구분.

### 14-5-1. Stage 1 이전 (사전 상담 ~ 본 상담 사이)

| 문서 | `document_type` | 필수 | 비고 |
|---|---|---|---|
| 여권 사본 | `passport` | ✅ | 본 상담 전 신원 확인용 |
| 본인 확인용 신분증 | `passport` 하위 | — | 여권 외 보조(예: 본국 ID 카드) |

**경로 예**: `{user_id}/passport/{timestamp}_passport.pdf`

### 14-5-2. Stage 2 단계 (계약 체결 후)

| 문서 | `document_type` | 필수 | 아포스티유/번역 |
|---|---|---|---|
| 본국 범죄 경력 증명서 | `criminal_record` | ✅ | 아포스티유 + 한국어 번역 |
| 학력 증명서 | `education` | ✅ | 아포스티유 + 한국어 번역 |
| 가족관계 증명서 | `family` | ✅ | 아포스티유 + 한국어 번역 |
| 투자금 증빙 | `funding` | ✅ | 아포스티유 + 한국어 번역 |
| 송출국 재직 증명 | `funding` | ✅ | 아포스티유 + 한국어 번역 |
| 가맹계약서 | `contracts` | 상황 | 한국 내 계약서, 번역 불필요 |
| 임대차계약서 | `contracts` | 상황 | 한국 내 계약서, 번역 불필요 |

**경로 예**:
- `{user_id}/criminal_record/{timestamp}_fbi_cert_original.pdf`
- `{user_id}/criminal_record/{timestamp}_fbi_cert_apostille_kr.pdf`
- `{user_id}/funding/{timestamp}_bank_statement.pdf`
- `{user_id}/contracts/{timestamp}_franchise_agreement.pdf`

**원본·번역본 구분**: 같은 `document_type` 내에서 파일명 suffix로 구분(`_original`, `_apostille`, `_kr`). 별도 컬럼·테이블 없이 파일명 컨벤션으로 해결.

### 14-5-3. `document_type` 선택 근거

PM 확정(블로커 3 답변) — stage별 분류를 **반려**하고 문서 유형별로 채택. 이유:

- 같은 문서 유형이 Stage 1/2에서 재업로드·보완될 수 있음
- 문서 유형별 폴더는 관리자 검토·장기 보관 시 탐색이 쉬움
- Stage 구분은 **업로드 시점의 쓰레드 상태**(`business_immigration_status`)로 사후 추적 가능(파일 `created_at` + 당시 쓰레드 상태 join)

### 14-5-4. 업로드 시점·주체 매트릭스

| 문서 | 주 업로드 주체 | 업로드 허용 시점(사업이민 상태) |
|---|---|---|
| `passport` | 고객 | `pre_consultation` 이상 |
| `criminal_record`, `education`, `family` | 고객 | `stage2_engaged` 이상 |
| `funding` | 고객 | `stage2_engaged` 이상 |
| `contracts` | 관리자(super_admin) | `stage2_engaged` 이상 |

허용 시점 제약은 애플리케이션 레벨(UI)로 구현. Storage RLS에서는 소유권·document_type만 검증(시점 제약을 DB로 표현하려면 custom SQL 함수가 필요하지만, 복잡도 대비 이득이 적음).

### 14-5-5. 파일 메타 추적 테이블 (선택적)

문서 메타데이터를 DB에 별도 인덱싱할지 여부:

- **옵션 1 (권장)**: 별도 테이블 없이 `storage.objects` 메타 + 경로 파싱으로 관리.
- **옵션 2**: `business_immigration_documents` 테이블 신설 (file_path, document_type, uploaded_by, uploaded_at, status, notes). 관리자 체크리스트·승인 상태 관리가 필요해지면 이때 도입.

본 섹션 14는 **옵션 1**로 시작. 옵션 2는 Stage 2 워크플로 명세가 확정될 때 후속 작업으로 추가.

## 14-6. 프로필 완성도 판정 기준 (필수 3개 필드, `request_type` 분기)

### 14-6-1. 확정 원칙

PROJECT_KNOWLEDGE.md 섹션 7 + 확정사항 4번:

- **사업이민 프로필 완성도**: `nationality`, `residence_country`, `visa_type_interest` **3개 필드가 모두 NOT NULL**일 때 `profile_completed = true`.
- 다른 NOT NULL 컬럼이 누락되면 **DB INSERT 자체가 실패**하므로 판정 대상이 아님. 위 3개는 특별히 강조된 "사업이민 핵심 의도 트리플".
- 기타 필드(가족 구성·이주 시점·자금 조달·배경 등)는 완성도 판정에 영향 없음. 보강은 UI 레벨 안내로 처리.
- 기존 일반 프로필(`profiles` 테이블) 판정 기준은 **기존 `passport_number` NULL 여부 방식 그대로 유지**. 본 섹션 14가 건드리지 않음.

### 14-6-2. DB 트리거로 자동 계산

`business_immigration_profiles` 테이블의 `profile_completed` 컬럼은 BEFORE INSERT/UPDATE 트리거로 자동 채웁니다. 애플리케이션은 이 컬럼에 직접 `true`/`false`를 쓰지 않습니다.

```sql
-- migrations/20260420_create_biz_profile_completed_trigger.sql

CREATE OR REPLACE FUNCTION public.compute_biz_profile_completed()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completed := (
    NEW.nationality        IS NOT NULL AND
    NEW.residence_country  IS NOT NULL AND
    NEW.visa_type_interest IS NOT NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_biz_profile_compute_completed
  BEFORE INSERT OR UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.compute_biz_profile_completed();
```

**장점**:
- 애플리케이션 버그·누락으로 불일치 상태가 생기지 않음.
- 관리자가 DB 직접 UPDATE로 3개 필드를 변경해도 `profile_completed`가 즉시 갱신됨.

### 14-6-3. 판정 함수 (애플리케이션 레벨)

`js/supabase-client.js`에 신규 함수 추가(구현 작업 시):

```javascript
async function isProfileCompleteForRequest(userId, requestType) {
    if (requestType === 'business_immigration') {
        const { data, error } = await supabaseClient
            .from('business_immigration_profiles')
            .select('profile_completed')
            .eq('user_id', userId)
            .maybeSingle();
        if (error || !data) return false;
        return data.profile_completed === true;
    }

    // 기존 일반 경로 (변경 없음) — passport_number 단일 필드 판정 유지
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('passport_number')
        .eq('id', userId)
        .maybeSingle();
    return !!(profile && profile.passport_number);
}
```

**호출 위치**:
- `thread-general-v2.html` 페이지 로드 시 배너 표시 판정(14-7)
- `createWelcomeMessage()`의 request_type 분기(14-7)
- 관리자 대시보드 고객 목록 렌더링 시 "프로필 완성 여부" 컬럼(14-8-5)

### 14-6-4. "핵심 트리플 미완"일 때 사업이민 경로 동작

| 상태 | UX 처리 |
|---|---|
| `business_immigration_profiles` 레코드 자체가 없음 | 쓰레드 페이지 진입 시 배너로 "프로필 작성" 유도, CTA 클릭 → `profile-submit.html?type=business&thread={id}` |
| 레코드는 있으나 `profile_completed = false` | 배너 표시, CTA는 "프로필 이어서 작성" |
| `profile_completed = true` | 배너 숨김 |

구체 배너 UI·텍스트는 14-7에서 기술.

### 14-6-5. 기존 `profiles` 테이블과의 관계

- `business_immigration_profiles.user_id` = `auth.users.id` = `profiles.id` → 1:1 연결.
- 사업이민 사용자도 `on_auth_user_created` 트리거로 `profiles` 기본 레코드는 자동 생성됨(콘솔 확인 결과). 이 기본 레코드의 `passport_number`·`nationality` 등은 `NULL` 상태 유지.
- 사업이민 전용 정보는 오직 `business_immigration_profiles`에서 관리.
- 관리자 대시보드에서 고객 정보를 보여줄 때:
  - 이름·이메일·역할: `profiles`에서 조회
  - 사업이민 상세: `business_immigration_profiles`에서 조회
  - SOT 원칙(확정사항 2번): 표시는 `profiles` 우선, 상담 이력 스냅샷은 `consultation_requests` 조회.

### 14-6-6. 판정 기준이 바뀔 때의 운영 절차

추후 "3개 핵심 필드" 외에 다른 필드를 완성도 조건에 추가하고 싶은 경우:

1. `compute_biz_profile_completed()` 함수 본문 수정 마이그레이션 작성.
2. 변경 직후 `UPDATE business_immigration_profiles SET updated_at = now()` 한 번 실행해 트리거 재평가로 기존 행의 `profile_completed` 값도 재계산.
3. 관련 i18n·UI 안내 문구 동시 배포.

3단계 운영 절차를 섹션 11 체크리스트에 연결.

## 14-7. welcome message 처리 정책 (동적 배너 적용 범위, 기존 경로 보존)

### 14-7-1. 적용 범위 확정

확정사항 3번:

- **이번 범위**: `request_type = 'business_immigration'` 쓰레드에서만 배너 활성화.
- **기존 경로 보존**: `D-10-1` 경로(service_name 문자열 매칭으로 분기)와 일반 상담 경로의 현재 welcome 메시지 구조는 **변경하지 않음**. 기존 "Enter Basic Info" 링크 로직(`js/supabase-client.js:913-1041`) 그대로 유지.
- 배너 컴포넌트는 **재사용 가능한 구조**로 구현하되, 활성화 조건만 사업이민 쓰레드로 제한.

### 14-7-2. 배너 표시 위치 및 DOM 구조

`thread-general-v2.html`과 `visa-thread-general.html` 상단 쓰레드 헤더 아래, 메시지 리스트 위에 배너 컨테이너 삽입:

```html
<!-- thread-general-v2.html 기존 헤더 블록 다음, 메시지 리스트 전에 배치 -->
<div id="thread-profile-banner"
     class="thread-banner thread-banner-hidden"
     role="region"
     aria-live="polite">
  <div class="thread-banner-body">
    <i class="fa-solid fa-circle-info thread-banner-icon"></i>
    <div class="thread-banner-text">
      <strong data-i18n="biz.banner.title">프로필 작성이 필요합니다</strong>
      <p data-i18n="biz.banner.description">원활한 상담을 위해 기본 정보를 입력해 주세요.</p>
    </div>
    <a id="thread-profile-banner-cta"
       class="thread-banner-cta"
       href="#"
       data-i18n="biz.banner.cta">프로필 작성하기</a>
  </div>
</div>
```

### 14-7-3. 배너 활성화 조건 (클라이언트 로직)

`js/business-immigration.js`(신규 파일, 원 명세 섹션 1 허용)에서 담당:

```javascript
async function evaluateThreadProfileBanner() {
    const threadId = new URLSearchParams(location.search).get('id');
    if (!threadId) return;

    // 1) 쓰레드 정보 조회
    const { data: thread } = await supabaseClient
        .from('threads')
        .select('id, user_id, request_type, business_immigration_status')
        .eq('id', threadId)
        .maybeSingle();
    if (!thread) return;

    // 2) 사업이민 쓰레드가 아니면 배너 비활성 (기존 경로 보존)
    if (thread.request_type !== 'business_immigration') return;

    // 3) 현재 사용자가 쓰레드 소유자인지 확인
    const session = await supabaseClient.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    if (!userId || userId !== thread.user_id) return;  // 관리자 뷰는 별도 처리

    // 4) 프로필 완성 여부 조회 (14-6 함수 재사용)
    const completed = await isProfileCompleteForRequest(userId, 'business_immigration');

    // 5) 미완이면 배너 표시, CTA 링크 설정
    const banner = document.getElementById('thread-profile-banner');
    const cta    = document.getElementById('thread-profile-banner-cta');
    if (!completed) {
        cta.href = `profile-submit.html?type=business&thread=${encodeURIComponent(threadId)}`;
        banner.classList.remove('thread-banner-hidden');
    } else {
        banner.classList.add('thread-banner-hidden');
    }
}

document.addEventListener('DOMContentLoaded', evaluateThreadProfileBanner);
```

**중요**: 본 함수는 **사업이민 쓰레드가 아니면 조기 반환**하여 기존 D-10-1·일반 경로에 영향을 주지 않습니다.

### 14-7-4. 재평가 트리거

배너는 다음 시점에 재평가되어 표시/숨김이 갱신됩니다:

| 이벤트 | 처리 |
|---|---|
| 쓰레드 페이지 최초 로드 | `DOMContentLoaded`에서 `evaluateThreadProfileBanner()` 호출 |
| 프로필 제출 후 쓰레드로 리다이렉트 | 쿼리 `?updated=1`이 있으면 1회 더 호출 |
| 브라우저 뒤로가기 → 쓰레드 복귀 | `pageshow` 이벤트에서 bfcache 복귀 시 재호출 |
| Realtime 구독(선택, 후속 작업) | 현재 코드에 Realtime 구독 없음 → 이번 작업에선 미도입 |

### 14-7-5. `createWelcomeMessage()` 수정 범위

확정사항 2번(SOT)·3번(기존 경로 보존)에 따라:

- **사업이민 쓰레드 전용 브랜치 추가**: `request_type === 'business_immigration'` 우선 체크.
  - 별도 welcome 메시지 템플릿 사용(환영 인사 + 3단계 안내, **"Enter Basic Info" 링크 포함하지 않음** — 배너가 담당).
- **D-10-1 브랜치**: 기존 `service_name` 문자열 매칭 그대로 유지, 변경 없음.
- **일반 브랜치**: 기존 `passport_number` 기반 `hasProfile` 판정 그대로 유지.

```javascript
async function createWelcomeMessage(threadId, serviceName, opts = {}) {
    const requestType = opts.requestType || 'general';

    // (신규) 사업이민 우선 분기
    if (requestType === 'business_immigration') {
        return insertWelcomeMessage(threadId, buildBusinessImmigrationWelcome());
    }

    // (기존 유지) D-10-1 경로
    if (serviceName && serviceName.toLowerCase().includes('d-10-1')) {
        return insertWelcomeMessage(threadId, buildD10Welcome(threadId));
    }

    // (기존 유지) 일반 경로
    const hasProfile = await checkHasProfileByPassportNumber();
    return insertWelcomeMessage(threadId, buildGeneralWelcome(threadId, hasProfile));
}
```

`buildBusinessImmigrationWelcome()`의 본문은 i18n 키 `biz.welcome.*`로 구성(섹션 14-9 스텁 처리 참조).

### 14-7-6. 스타일 가이드

배너 CSS는 기존 `css/ui-components.css`(토스트 스타일)에 이어 신규 클래스 추가:

```css
/* css/ui-components.css 말미에 추가 */

.thread-banner {
  background: #fff8e1;
  border-left: 4px solid #f5a623;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 12px 0;
}

.thread-banner-hidden { display: none; }

.thread-banner-body { display: flex; align-items: center; gap: 12px; }

.thread-banner-icon { color: #f5a623; font-size: 20px; }

.thread-banner-text { flex: 1; }
.thread-banner-text strong { display: block; margin-bottom: 2px; color: #5a3e00; }
.thread-banner-text p { margin: 0; color: #7a5800; font-size: 14px; }

.thread-banner-cta {
  background: #f5a623;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.thread-banner-cta:hover { background: #d98b0c; }
```

### 14-7-7. 관리자 뷰 고려

관리자(`admin-thread.html`)가 사업이민 쓰레드를 열 때 배너는 **숨김** 처리:
- 로직 14-7-3 step 3에서 `userId !== thread.user_id`로 조기 반환. 관리자는 본인 프로필이 쓰레드 소유자가 아니므로 자동 숨김.
- 관리자용 "고객 프로필 미완" 안내는 14-8-5의 대시보드 뱃지로 담당.

## 14-8. 쓰레드 생성 실패 처리 정책

### 14-8-1. 적용 범위 (확정)

확정사항 6번:

- **이번 작업 범위**: 사업이민 **상담 신청 폼**(`business-immigration-request.html`) 제출 시 쓰레드 생성 실패 처리.
- **범위 밖**: `confirm-payment` Edge Function의 L263-271 무시 로직 교체는 **결제 연동 작업에 포함**. 본 섹션은 테이블·UI·정책만 명시하고, Edge Function 수정은 후속 작업으로 분리.
- `send-notification` Edge Function 구현은 후속 작업(권고 수락). 본 섹션은 DB INSERT 경로와 대시보드 뱃지까지.

### 14-8-2. 재시도 정책 세분화 (확정사항 6번)

| 경로 | 결제 유무 | 재시도 버튼 | 실패 시 안내 메시지 |
|---|---|---|---|
| 사업이민 상담 신청 | 결제 없음 | ✅ 제공, `createThread()` 재호출 | "쓰레드 생성에 실패했습니다. 다시 시도해 주세요. 문제가 계속되면 지원팀에 문의해 주세요." |
| 일반 경로(Toss·Wise) 결제 후 | 결제 완료 | ❌ 제거 | "결제는 정상 승인되었습니다. 담당자가 직접 확인하여 쓰레드를 개설해 드립니다. 불편을 드려 죄송합니다." + `system_errors` INSERT + (send-notification 구현 후) 관리자 이메일 |

> 이번 작업에서는 **사업이민 상담 신청 경로**만 구현. 결제 후 실패 경로는 후속 작업.

### 14-8-3. `system_errors` 테이블 DDL

```sql
-- migrations/20260420_create_system_errors.sql

CREATE TABLE public.system_errors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type    text        NOT NULL,     -- 예: 'thread_creation','payment_confirm','document_upload'
  error_code    text,                     -- 내부 에러 코드(선택)
  request_id    text,                     -- orderId·threadId 등 상관 키
  context       jsonb,                    -- 요청 payload 스냅샷·스택 힌트
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   uuid        REFERENCES auth.users(id)
);

-- 인덱스
CREATE INDEX idx_system_errors_error_type ON public.system_errors(error_type);
CREATE INDEX idx_system_errors_unresolved
  ON public.system_errors(created_at DESC)
  WHERE resolved_at IS NULL;  -- 대시보드 뱃지용 부분 인덱스

-- RLS — super_admin만 SELECT/UPDATE, INSERT는 service_role 또는 authenticated 허용
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_errors_super_admin_select
  ON public.system_errors
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

CREATE POLICY system_errors_super_admin_update
  ON public.system_errors
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

-- INSERT는 인증된 모든 사용자에게 허용 (로그 기록 목적)
-- 단, user_id 위조 방지: user_id가 NULL이거나 auth.uid()와 동일한 경우만 허용
CREATE POLICY system_errors_insert
  ON public.system_errors
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
```

**주의**: `context` jsonb에 주문 정보·개인정보 스냅샷이 담길 수 있음. RLS로 **일반 사용자 SELECT 차단**은 필수. 위 DDL에서 super_admin 외 SELECT 정책이 없어 자연 deny.

### 14-8-4. 클라이언트 실패 처리 흐름

`business-immigration-request.html` 제출 버튼 핸들러 의사코드:

```javascript
async function submitBusinessImmigrationRequest() {
    // ... 폼 검증, 프로필 upsert 등 생략 ...

    try {
        // 1) consultation_requests 레코드 INSERT
        const { data: request, error: reqErr } = await supabaseClient
            .from('consultation_requests')
            .insert({
                user_id: userId,
                request_type: 'business_immigration',
                nationality: form.nationality,
                residence_country: form.residence_country,
                // ... 9개 필드
            })
            .select()
            .single();
        if (reqErr) throw { step: 'consultation_request', error: reqErr };

        // 2) threads 레코드 INSERT
        const { data: thread, error: threadErr } = await createThread({
            service_name: 'Business Immigration Consultation',
            status: 'active',
            amount: 0,
            request_type: 'business_immigration',
            business_immigration_status: 'pre_consultation',
            order_id: 'BIZ-' + Date.now(),
            is_consulting: true,
            organization: 'business_immigration'
        });
        if (threadErr) throw { step: 'thread_creation', error: threadErr };

        // 3) consultation_requests.thread_id 연결
        await supabaseClient
            .from('consultation_requests')
            .update({ thread_id: thread.id })
            .eq('id', request.id);

        // 4) 환영 메시지
        await createWelcomeMessage(thread.id, 'Business Immigration Consultation',
                                    { requestType: 'business_immigration' });

        // 5) 쓰레드 페이지로 리다이렉트
        location.href = `thread-general-v2.html?id=${thread.id}`;

    } catch (err) {
        // 실패 경로
        await logSystemError({
            error_type: 'thread_creation',
            error_code: err.step,
            request_id: null,
            context: {
                step: err.step,
                message: err.error?.message,
                form_summary: {
                    nationality: form.nationality,
                    visa_type_interest: form.visa_type_interest
                }
            }
        });

        // 토스트 + 재시도 버튼
        showToastWithRetry(
            i18n.translate('biz.error.thread_creation'),
            () => submitBusinessImmigrationRequest()  // 재시도 시 처음부터
        );
    }
}

async function logSystemError(payload) {
    try {
        await supabaseClient.from('system_errors').insert(payload);
    } catch (_) {
        // 로그 INSERT 실패는 무음 처리(이중 실패 방지)
    }
}
```

### 14-8-5. 토스트 + 재시도 버튼 UI

기존 `js/ui-components.js`의 토스트 유틸을 래핑합니다. **토스트 유틸이 번역 키를 직접 받지 않는 구조**(문자열만 받음)임이 확인되었으므로, 호출 전에 `i18n.translate()` 결과를 전달하는 래퍼를 추가합니다.

```javascript
// js/ui-components.js 또는 js/business-immigration.js

function showToastWithRetry(message, onRetry, durationMs = 8000) {
    // 기존 toast API를 확장: retry 버튼 포함 variant
    const container = ensureToastContainer();  // 기존 로직 재사용
    const toast = document.createElement('div');
    toast.className = 'toast toast-error toast-with-retry';
    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-retry">${escapeHtml(i18n.translate('common.retry'))}</button>
      <button class="toast-close" aria-label="close">×</button>
    `;
    toast.querySelector('.toast-retry').addEventListener('click', () => {
        onRetry();
        hide(toast);
    });
    toast.querySelector('.toast-close').addEventListener('click', () => hide(toast));
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    // 자동 숨김 없음 — 사용자 조치 전까지 유지
}
```

기존 `js/ui-components.js:13-58`의 `show/hide` 헬퍼를 그대로 재사용. 토스트 유틸의 i18n 지원 상태는 **런타임 문자열 인자만 받음**으로 확인되어, 위처럼 호출 전 `i18n.translate()`로 처리.

### 14-8-6. 관리자 대시보드 뱃지

`admin-dashboard.html` 상단 내비 또는 헤더 근처에 "미해결 시스템 오류" 뱃지 추가:

```html
<a href="#system-errors" id="nav-system-errors" class="admin-nav-item">
  <i class="fa-solid fa-triangle-exclamation"></i>
  <span data-i18n="admin.nav.system_errors">시스템 오류</span>
  <span id="system-errors-badge" class="nav-badge nav-badge-hidden">0</span>
</a>
```

페이지 로드 시 카운트 쿼리:

```javascript
async function refreshSystemErrorsBadge() {
    const { count } = await supabaseClient
        .from('system_errors')
        .select('id', { count: 'exact', head: true })
        .is('resolved_at', null);
    const badge = document.getElementById('system-errors-badge');
    if (count && count > 0) {
        badge.textContent = String(count);
        badge.classList.remove('nav-badge-hidden');
    } else {
        badge.classList.add('nav-badge-hidden');
    }
}
document.addEventListener('DOMContentLoaded', refreshSystemErrorsBadge);
```

- Realtime 구독은 현재 코드 전반에 미도입 상태이므로 이번 작업에서도 미채택. 페이지 로드 시 1회 조회가 기본. 관리자는 새로고침 또는 페이지 이동 시 최신화.
- 상세 목록 뷰·`resolved_at` 마킹 UI는 후속 작업(또는 본 작업 후반부 옵션).

### 14-8-7. i18n 키 추가

섹션 14-9 스텁 운용 규칙에 따라 다음 키를 7개 언어에 모두 추가:

- `common.retry` — "Retry" / "다시 시도"
- `biz.error.thread_creation` — 상담 실패 안내 (재시도 버튼 케이스)
- `biz.error.thread_creation_after_payment` — 결제 후 실패 안내 (재시도 없음) ※ 본 작업 범위 밖 키지만 사전 스텁 권장
- `admin.nav.system_errors` — "시스템 오류" 내비 라벨

### 14-8-8. `send-notification` 연동 (범위 밖, 후속 작업용 메모)

본 섹션 14 구현 시 `system_errors` INSERT만 수행하고 이메일 발송은 트리거하지 않습니다. Resend 계정·발신 도메인(DNS SPF/DKIM/DMARC) 인증·이메일 템플릿 4개 언어 준비가 선행되어야 하며, 준비 완료 후:

1. `send-notification` Edge Function 본체에 Resend API 호출 로직 구현
2. `system_errors` 테이블에 AFTER INSERT 트리거 추가 → `error_type='thread_creation'` 신규 insert 시 Edge Function 호출
3. 관리자 수신 이메일 주소 환경 변수(`NOTIFY_ADMIN_EMAIL`) 정의

이 후속 작업 명세는 별도 섹션(섹션 15 또는 별도 문서)으로 분리.

## 14-9. i18n 7개 언어 스텁 처리 정책

### 14-9-1. 확정 운용 규칙 (확정사항 5번)

| 언어 코드 | 런칭 여부 | 초기 스텁 값 | 최종 상태 |
|---|---|---|---|
| `ko` | ✅ | 마스터 카피 (원 명세 섹션 3·4의 확정 한국어 그대로) | 마스터 |
| `en` | ✅ | 번역 우선 삽입 | 실번역 확정 |
| `vi` | ✅ | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `zh` | ✅ | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `ja` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `mn` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `th` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |

**이유** (진단 발견 5 대응): 폴백 언어가 `ko`이므로 키를 7개 언어 중 일부에서 누락하면 해당 언어 사용자가 **한국어 값을 보게 됨**. 비런칭 언어 사용자가 한국어를 보는 것보다 **영어를 보는 편이 UX·번역 관리상 우월**하다는 판단. `en`이 실번역 품질을 갖춘 후에만 복제해야 하므로 `en` 번역 검수는 전체 품질의 1차 게이트.

### 14-9-2. 주석 표식 형식 (확정사항 5번)

`js/translations.js`에 복제본 스텁을 넣을 때 바로 위 줄에 **일관된 주석 포맷**을 삽입합니다:

```javascript
// ko 블록
ko: {
  // ... 기존 키들 ...
  'biz.hero.headline': '한국에서 사업을 시작하고 이주하기 위한 통합 법률서비스',
  // ...
},

// en 블록
en: {
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// vi 블록
vi: {
  // [TRANSLATION_PENDING: biz.hero.headline, vi, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// zh 블록
zh: {
  // [TRANSLATION_PENDING: biz.hero.headline, zh, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// ja 블록
ja: {
  // [TRANSLATION_PENDING: biz.hero.headline, ja, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// mn 블록
mn: {
  // [TRANSLATION_PENDING: biz.hero.headline, mn, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// th 블록
th: {
  // [TRANSLATION_PENDING: biz.hero.headline, th, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},
```

### 14-9-3. 주석 포맷 정규식 (집계용)

번역 교체 잔여분을 빠르게 파악하기 위한 regex 포맷:

```
// \[TRANSLATION_PENDING: (biz\.[a-z0-9_.]+), (ko|en|vi|zh|ja|mn|th), cloned from (ko|en) at (\d{4}-\d{2}-\d{2})\]
```

**잔여분 카운트 명령**:
```bash
grep -c "TRANSLATION_PENDING" js/translations.js
```

**언어별 잔여분 카운트**:
```bash
grep -oE "TRANSLATION_PENDING: biz\.[a-z0-9_.]+, [a-z]+, " js/translations.js | sort | uniq -c
```

### 14-9-4. 번역 교체 운영 절차

번역이 도착하면:

1. 해당 언어 블록에서 대응 키를 찾음
2. 바로 위 `TRANSLATION_PENDING` 주석 라인 **삭제**
3. 키 값(문자열)을 실번역으로 **교체**
4. `grep -c TRANSLATION_PENDING js/translations.js`로 잔여분 카운트 감소 확인
5. 섹션 14-9-6의 `validate-biz-i18n.js` 재실행해 누락 없는지 확인

### 14-9-5. `biz.*` 키 목록 (원 명세 섹션 8 + 본 섹션 14 추가분)

원 명세 섹션 8-2에 명시된 키 + 본 섹션에서 새로 도입된 키를 합산:

```
# 원 명세 섹션 8-2 (랜딩·폼·대시보드)
biz.hero.headline
biz.hero.subhead
biz.hero.cta
biz.badge.description
biz.step1.title, biz.step1.body
biz.step2.title, biz.step2.body
biz.step3.title, biz.step3.body
biz.step4.title, biz.step4.body
biz.step5.title, biz.step5.body
biz.news.heading
biz.dashboard.heading
biz.dashboard.guest
biz.dashboard.progress.stage1
biz.dashboard.progress.stage2
biz.dashboard.progress.stage3
biz.dashboard.progress.stage4
biz.dashboard.progress.stage5
biz.form.title
biz.form.nationality
biz.form.residence_country
biz.form.visa_type
biz.form.family
biz.form.children_count
biz.form.timeline
biz.form.message
biz.form.contact_method
biz.form.submit
biz.form.auto_reply

# 본 섹션 14 추가분
# 14-7 배너
biz.banner.title
biz.banner.description
biz.banner.cta

# 14-7 welcome 메시지 (사업이민 전용)
biz.welcome.greeting
biz.welcome.step1
biz.welcome.step2
biz.welcome.step3
biz.welcome.closing

# 14-8 에러·공통
biz.error.thread_creation
biz.error.thread_creation_after_payment
common.retry
admin.nav.system_errors

# 14-4 폼 필드 라벨 (29개 프로필 컬럼 매핑)
biz.form.last_name_en
biz.form.first_name_en
biz.form.full_name_native
biz.form.passport_number
biz.form.passport_expiry
biz.form.birth_date
biz.form.gender
biz.form.home_address
biz.form.home_phone
biz.form.email
biz.form.native_language
biz.form.preferred_contact_method
biz.form.preferred_industry
biz.form.preferred_location
biz.form.funding_source
biz.form.education_background
biz.form.work_experience
biz.form.korea_visit_history
biz.form.korean_language_proficiency
biz.form.criminal_record
```

구현 시점에 최종 키 목록을 섹션 14-10 체크리스트의 `i18n 키 매니페스트` 파일(`scripts/biz-i18n-manifest.json`)로 고정.

### 14-9-6. `scripts/validate-biz-i18n.js` 신규 스크립트

`biz.*` 키가 7개 언어 모두에 존재하는지 검증. 누락 시 빌드 실패.

```javascript
// scripts/validate-biz-i18n.js
// 실행: node scripts/validate-biz-i18n.js
// 성공: exit 0
// 누락 발견: exit 1, 누락 내역 stderr 출력

const fs = require('fs');
const path = require('path');

// translations.js는 브라우저 전역에 할당되는 스크립트이므로,
// Node에서 평가하기 위해 한 번 래핑해 로드.
const translationsSrc = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'translations.js'),
  'utf8'
);
// 전역 할당 패턴: `const translations = { ... };` 또는 `window.translations = { ... };`
// CommonJS 호환을 위해 eval 내부에서 module.exports에 바인딩.
let translations;
eval(translationsSrc.replace(
  /^\s*const\s+translations\s*=/m,
  'translations ='
));

const REQUIRED_LANGS = ['ko','en','vi','zh','ja','mn','th'];
const NAMESPACE_PREFIX = 'biz.';

// 매니페스트에 정의된 공식 키 목록을 단일 진실 공급원으로 사용
const manifestPath = path.join(__dirname, 'biz-i18n-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
// manifest = { keys: ['biz.hero.headline', ...] }

const missing = [];
for (const key of manifest.keys) {
  for (const lang of REQUIRED_LANGS) {
    const dict = translations[lang] || {};
    if (typeof dict[key] === 'undefined') {
      missing.push({ key, lang });
    }
  }
}

if (missing.length > 0) {
  console.error('[validate-biz-i18n] Missing keys:');
  for (const m of missing) console.error(`  - ${m.key} [${m.lang}]`);
  process.exit(1);
}

console.log(`[validate-biz-i18n] OK (${manifest.keys.length} keys × ${REQUIRED_LANGS.length} langs)`);
process.exit(0);
```

### 14-9-7. `scripts/biz-i18n-manifest.json` 포맷

```json
{
  "version": 1,
  "generatedAt": "2026-04-20",
  "namespace": "biz.*",
  "keys": [
    "biz.hero.headline",
    "biz.hero.subhead",
    "biz.hero.cta",
    "biz.badge.description",
    "biz.step1.title",
    "biz.step1.body",
    "biz.step2.title",
    "biz.step2.body",
    "biz.step3.title",
    "biz.step3.body",
    "biz.step4.title",
    "biz.step4.body",
    "biz.step5.title",
    "biz.step5.body",
    "biz.news.heading",
    "biz.dashboard.heading",
    "biz.dashboard.guest",
    "biz.dashboard.progress.stage1",
    "biz.dashboard.progress.stage2",
    "biz.dashboard.progress.stage3",
    "biz.dashboard.progress.stage4",
    "biz.dashboard.progress.stage5",
    "biz.form.title",
    "biz.form.nationality",
    "biz.form.residence_country",
    "biz.form.visa_type",
    "biz.form.family",
    "biz.form.children_count",
    "biz.form.timeline",
    "biz.form.message",
    "biz.form.contact_method",
    "biz.form.submit",
    "biz.form.auto_reply",
    "biz.banner.title",
    "biz.banner.description",
    "biz.banner.cta",
    "biz.welcome.greeting",
    "biz.welcome.step1",
    "biz.welcome.step2",
    "biz.welcome.step3",
    "biz.welcome.closing",
    "biz.error.thread_creation",
    "biz.error.thread_creation_after_payment",
    "biz.form.last_name_en",
    "biz.form.first_name_en",
    "biz.form.full_name_native",
    "biz.form.passport_number",
    "biz.form.passport_expiry",
    "biz.form.birth_date",
    "biz.form.gender",
    "biz.form.home_address",
    "biz.form.home_phone",
    "biz.form.email",
    "biz.form.native_language",
    "biz.form.preferred_contact_method",
    "biz.form.preferred_industry",
    "biz.form.preferred_location",
    "biz.form.funding_source",
    "biz.form.education_background",
    "biz.form.work_experience",
    "biz.form.korea_visit_history",
    "biz.form.korean_language_proficiency",
    "biz.form.criminal_record"
  ],
  "nonBizKeys": [
    "common.retry",
    "admin.nav.system_errors"
  ]
}
```

`nonBizKeys`는 `biz.*` 외지만 본 작업에서 신설되는 키. 검증 스크립트에서 `manifest.keys ∪ manifest.nonBizKeys`로 확장하면 둘 다 검증 가능.

### 14-9-8. CI 편입

`.github/workflows/validate.yml`에 단계 추가:

```yaml
# .github/workflows/validate.yml (기존 파일 편집)
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/validate-syntax.js
      # 신규
      - run: node scripts/validate-biz-i18n.js
```

누락 시 CI가 실패해 배포 전에 차단. `package.json`에는 스크립트 별칭을 추가해 로컬에서도 간편 실행:

```json
"scripts": {
  "test": "node scripts/validate-syntax.js",
  "validate": "node scripts/validate-syntax.js",
  "validate:biz-i18n": "node scripts/validate-biz-i18n.js",
  "build:blog": "node scripts/build-blog.js"
}
```

### 14-9-9. 복제 작업 자동화 보조 스크립트 (선택)

대량 키 복제 시 수작업 실수를 줄이기 위해 `scripts/clone-biz-i18n-to-en.js` 같은 보조 스크립트를 도입할 수 있음. 본 섹션 범위 밖(구현자 재량).

## 14-10. 연동 검증 체크리스트

구현 완료 후 개발자 자체 검증용. 원 명세 섹션 11(기본 기능 테스트)과 중복되는 항목은 참조 표기만 하고, 본 체크리스트는 **섹션 14에서 신설·변경된 부분**에 집중합니다.

### 14-10-1. DB 마이그레이션 적용 확인

- [ ] `migrations/20260420_create_business_immigration_profiles.sql` 실행 성공, 테이블·인덱스·RLS·트리거 생성 확인
- [ ] `migrations/20260420_create_consultation_requests.sql` 또는 `alter_*` 중 **콘솔 확인 결과에 맞는 버전** 실행 (14-1-2)
- [ ] `migrations/20260420_alter_threads_add_business_immigration.sql` 실행. `threads.status`가 ENUM이면 `ALTER TYPE` 선행 (14-2-2)
- [ ] `migrations/20260420_create_business_immigration_storage.sql` 실행. 버킷 생성 + 5개 정책 생성 확인
- [ ] `migrations/20260420_create_biz_profile_completed_trigger.sql` 실행. 트리거 동작 확인 (테스트 INSERT → `profile_completed` 자동 계산)
- [ ] `migrations/20260420_create_system_errors.sql` 실행. RLS 3개 정책 확인

검증 SQL:
```sql
-- 테이블 존재 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('business_immigration_profiles','consultation_requests','system_errors');

-- 신규 컬럼 확인
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'threads'
  AND column_name IN ('request_type','business_immigration_status');

-- 버킷 확인
SELECT name FROM storage.buckets WHERE name = 'business-immigration-documents';

-- Storage RLS 확인
SELECT policyname FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'biz_docs_%';

-- 트리거 확인
SELECT tgname FROM pg_trigger
WHERE tgname IN ('trg_biz_profiles_set_updated_at','trg_biz_profile_compute_completed');
```

### 14-10-2. 프로필 완성도 판정 동작

- [ ] 사업이민 프로필에 필수 3개 중 1~2개만 NULL로 INSERT 시 `profile_completed = false` 자동 계산 (NOT NULL 컬럼들은 테스트를 위해 임시로 NULL 허용 후 롤백)
- [ ] 필수 3개 전부 NOT NULL INSERT 시 `profile_completed = true` 자동 계산
- [ ] UPDATE로 3개 중 하나를 NULL로 바꾸면 `profile_completed`가 `false`로 재계산
- [ ] `isProfileCompleteForRequest(userId, 'business_immigration')`이 DB 값 그대로 반환
- [ ] `isProfileCompleteForRequest(userId, 'general')`은 기존 `passport_number` 로직 유지(회귀 테스트)

### 14-10-3. Storage 업로드 경로 강제

- [ ] 정상 경로 `{user_id}/passport/{ts}_file.pdf` 업로드 성공
- [ ] 타인 `user_id` 폴더 업로드 시도 → RLS로 차단 (INSERT 실패)
- [ ] 허용 밖 `document_type`(예: `{user_id}/unknown/file.pdf`) 업로드 시도 → RLS로 차단
- [ ] super_admin 계정으로 타인 폴더 SELECT 가능
- [ ] 일반 사용자로 타인 폴더 SELECT 시도 → 차단
- [ ] `allowed_mime_types` 밖(예: `application/zip`) 업로드 시도 → 거부

### 14-10-4. 쓰레드 생성 플로우

- [ ] `business-immigration-request.html` 폼 정상 제출 시:
  - [ ] `consultation_requests` 레코드 INSERT (`request_type='business_immigration'`)
  - [ ] `threads` 레코드 INSERT (`request_type='business_immigration'`, `status='active'`, `business_immigration_status='pre_consultation'`)
  - [ ] `consultation_requests.thread_id`가 신규 thread id로 UPDATE
  - [ ] welcome 메시지 INSERT (사업이민 전용 템플릿 사용, "Enter Basic Info" 링크 없음)
  - [ ] `thread-general-v2.html`로 리다이렉트
- [ ] `createThread()` 단계 실패 시:
  - [ ] `system_errors` 레코드 INSERT (`error_type='thread_creation'`)
  - [ ] 토스트 + 재시도 버튼 노출, i18n 번역 정상
  - [ ] 재시도 클릭 시 플로우 처음부터 재실행
- [ ] 로그인하지 않은 상태에서 제출 → Google 로그인 유도

### 14-10-5. welcome 배너 표시/숨김

- [ ] 사업이민 쓰레드 진입 시, `profile_completed=false`면 배너 표시
- [ ] 같은 쓰레드에서 `profile_completed=true`로 변경 후 재진입 시 배너 숨김
- [ ] 배너 CTA 링크가 `profile-submit.html?type=business&thread={id}`로 정확히 세팅
- [ ] **일반(general) 쓰레드 진입 시 배너 비활성** — 기존 경로 회귀 없음
- [ ] **D-10-1 쓰레드 진입 시 배너 비활성** — 기존 경로 회귀 없음
- [ ] 관리자 계정으로 사업이민 쓰레드 열 때 배너 숨김

### 14-10-6. 관리자 대시보드

- [ ] `admin-dashboard.html` 로드 시 `system-errors-badge` 카운트 정상
- [ ] 미해결 오류가 0건이면 뱃지 숨김
- [ ] 사업이민 쓰레드 목록 필터(일반/협약대학/사업이민) 정상 작동
- [ ] 사업이민 쓰레드 선택 시 `business_immigration_status` 컬럼 표시 및 수정 가능
- [ ] 일반 쓰레드 선택 시 `status` 컬럼 표시(기존), `business_immigration_status` 영역 비활성
- [ ] 기존 `status` 필터 쿼리에 `request_type='general'` 조건 추가 후 기존 결과와 동일함 확인

### 14-10-7. i18n 검증

- [ ] `scripts/biz-i18n-manifest.json` 작성, 전체 `biz.*` 키 + `common.retry` + `admin.nav.system_errors` 포함
- [ ] `scripts/validate-biz-i18n.js` 실행 시 누락 0건
- [ ] 7개 언어 모두 키 존재 확인 (각 언어 탭에서 무작위 3개 키 스팟 체크)
- [ ] `vi`·`zh`·`ja`·`mn`·`th` 블록에 `TRANSLATION_PENDING` 주석이 대응 키 바로 위에 위치
- [ ] `grep -c TRANSLATION_PENDING js/translations.js` 결과와 주석 매뉴얼 카운트 일치
- [ ] `ko` 블록에 마스터 카피가 원 명세 섹션 3·4와 정확히 일치
- [ ] `.github/workflows/validate.yml`에 `validate-biz-i18n` 스텝 추가, CI 통과
- [ ] `package.json`에 `validate:biz-i18n` 스크립트 별칭 추가

### 14-10-8. 변호사광고규칙·가격 언급 금지 (섹션 3-3 상시 체크)

- [ ] `business-immigration.html` 어디에도 가격·수임료·비용 언급 없음 (DOM 텍스트·data-i18n 값·주석 전체 검색)
- [ ] `business-immigration-request.html` 폼에 금액·자금 규모 입력 필드 없음
- [ ] 푸터에서 "서비스 가격표" 링크 제거 확인
- [ ] 변호사 캐러셀·신뢰 배지 기존 구조 그대로 유지

### 14-10-9. 회귀 테스트 (섹션 10 변경되지 않는 것)

- [ ] 기존 `index.html` 사용자 플로우 (로그인·프로필·신청·결제) 정상
- [ ] 기존 협약 대학 플로우(`login-chosun`·`login-kdu`·`service-*`) 정상, 30% 할인 유지
- [ ] 기존 `consultation-request.html` 제출 시 **일반(general)** 경로로 쓰레드 생성, `request_type` 기본값 `'general'` 확인
- [ ] 기존 D-10-1 쓰레드 welcome 메시지·"Enter Basic Info" 링크 그대로 노출
- [ ] 기존 관리자 대시보드 일반 쓰레드 관리 기능 정상
- [ ] `npm run validate` (HTML/JS 문법 검증) 통과
- [ ] `npm run validate:biz-i18n` 통과

### 14-10-10. 콘솔 확인 후 확정 항목 (본 섹션 14 내부 표식)

구현 전 다음 콘솔 확인을 수행하고, 결과에 따라 분기 적용:

- [ ] `user_role` ENUM 실제 허용값 조회 (14-1-1 말미 쿼리)
- [ ] `consultation_requests` 테이블 실존 여부 조회 (14-1-2 쿼리) → CREATE vs ALTER 분기
- [ ] `threads.status` 컬럼 타입 조회 (14-2) → text vs ENUM 분기

이 3건은 본 섹션 내부에 `[콘솔 확인 후 확정]` 표식으로 명시되어 있으며, 구현 착수 전에 최종 확정편집 필요.

### 14-10-11. 범위 밖 작업(참고)

본 섹션 14 검증 완료 후 착수해야 할 후속 작업 참고:

1. **기존 `handle_new_user()` 트리거 저장소 편입**: 콘솔 정의를 SQL 마이그레이션 파일로 이관, `sql/` 또는 `migrations/`에 반영.
2. **기존 Storage RLS 정리**: `documents`·`passports` 버킷의 미사용 상태 확정 시 삭제 + 관련 정책 삭제.
3. **`profile-documents` admin 정책 보정**: `objects.id = auth.uid()` → 표준 패턴 전환.
4. **`thread_documents` 정책에 경로 제약 추가**.
5. **`confirm-payment` Edge Function L263-271 무시 로직 교체**: 결제 후 쓰레드 생성 실패 시 `system_errors` INSERT.
6. **`send-notification` Edge Function 본체 구현**: Resend 연동.

위 6개는 이번 섹션 14 구현이 충분히 안정된 후 **별도 명세 + 별도 브랜치**로 진행 권장.

---

## 부록 — 본 섹션 14 구현 시 생성·수정 파일 목록 (요약)

### 신규 생성
- `migrations/20260420_create_business_immigration_profiles.sql`
- `migrations/20260420_create_biz_profile_completed_trigger.sql`
- `migrations/20260420_create_consultation_requests.sql` **또는** `migrations/20260420_alter_consultation_requests_for_business_immigration.sql`
- `migrations/20260420_alter_threads_add_business_immigration.sql`
- `migrations/20260420_create_business_immigration_storage.sql`
- `migrations/20260420_create_system_errors.sql`
- `scripts/validate-biz-i18n.js`
- `scripts/biz-i18n-manifest.json`
- `js/business-immigration.js`

### 수정
- `js/supabase-client.js` (함수 추가: `uploadBusinessImmigrationDocument`, `isProfileCompleteForRequest`, `logSystemError`, `createThread` 시그니처 확장)
- `js/ui-components.js` (`showToastWithRetry` 헬퍼 추가)
- `js/translations.js` (7개 언어에 `biz.*` + 공통 키 스텁 추가, `TRANSLATION_PENDING` 주석 포함)
- `css/ui-components.css` (배너·뱃지 스타일 추가)
- `admin-dashboard.html` (`system-errors-badge` DOM + 스크립트)
- `admin-thread.html` (사업이민 상태 선택 UI)
- `thread-general-v2.html` (배너 DOM + `js/business-immigration.js` 로드)
- `visa-thread-general.html` (동일)
- `package.json` (`validate:biz-i18n` 스크립트 별칭)
- `.github/workflows/validate.yml` (`validate-biz-i18n` 스텝)

### 변경 없음 (명시)
- 기존 `profiles` 테이블 스키마
- `on_auth_user_created` 트리거 / `handle_new_user()` 함수
- `profile-documents`·`thread_documents`·`documents`·`passports` 버킷 및 RLS
- `confirm-payment` / `send-notification` Edge Functions
- 기존 welcome 메시지 D-10-1·일반 경로 로직
- 협약 대학 관련 파일·할인 정책
- `data/services.json`, `price-list.html`
- GitHub Pages 호스팅·CNAME·`validate.yml`의 기존 스텝

---

_초안 작성 완료일: 2026-04-20 · 커밋 안 됨_
