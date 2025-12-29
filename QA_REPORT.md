# 🔍 법무법인 로연 출입국이민지원센터 전체 QA 리포트

**검토일**: 2025-12-29  
**대상 사이트**: https://lawyeonvisa.app  
**검토 범위**: SQL 스키마, 프론트엔드 코드, 보안, 실시간 사이트

---

## 📋 Executive Summary

### 전체 평가: ⚠️ 보통 (70/100)

| 영역 | 상태 | 점수 |
|------|------|------|
| **SQL 스키마** | 🟢 양호 | 85/100 |
| **프론트엔드** | 🟡 개선필요 | 70/100 |
| **보안** | 🔴 위험 | 45/100 |
| **기능 동작** | 🟡 개선필요 | 75/100 |
| **사이트 접근성** | 🟢 양호 | 90/100 |

---

## 1. 📊 SQL 스키마 분석

### 1.1 업로드된 SQL 파일 목록 (11개)

| 파일명 | 용도 | 상태 |
|--------|------|------|
| `supabase-setup.sql` | 메인 DB 스키마 | ✅ 완전 |
| `supabase-security-tables.sql` | 보안 감사 테이블 | ✅ 완전 |
| `COMPLETE_SUPABASE_SETUP_V2.sql` | 통합 설정 v2 | ⚠️ RLS 비활성화됨 |
| `CREATE_STORAGE_BUCKETS.sql` | Storage 설정 | ✅ 완전 |
| `setup-admins-table.sql` | 관리자 테이블 | ✅ 완전 |
| `setup-korea-university.sql` | 한국대 학생 테이블 | ✅ 완전 |
| `korea-students-extended.sql` | 한국대 데이터 확장 | ✅ 완전 |
| `MESSAGES_TABLE_FIX.sql` | messages 컬럼 추가 | ✅ 완전 |
| `supabase-admin-account.sql` | 관리자 계정 설정 | ⚠️ 플레이스홀더 남음 |
| `fix-security-issues.sql` | 보안 이슈 수정 | ✅ 완전 |
| `.gitkeep` | Git 폴더 유지 | - |

### 1.2 데이터베이스 테이블 구조

#### 핵심 테이블 (10개)
```
profiles          - 사용자 프로필
threads           - 서비스 쓰레드
messages          - 쓰레드 메시지
payments          - 결제 기록
applications      - 신청 내역
admins            - 관리자/담당자
jnu_students      - 전남대 학생
korea_students    - 한국대 학생
file_metadata     - 파일 메타데이터
file_access_logs  - 파일 접근 로그
```

#### 보안 관련 테이블 (3개)
```
file_shares             - 파일 공유 설정
data_retention_policies - 데이터 보관 정책
(views) partner_visa_status - 담당자용 뷰
```

### 1.3 스키마 문제점

#### 🔴 심각 (Critical)
1. **RLS 비활성화** (`COMPLETE_SUPABASE_SETUP_V2.sql:173-177`)
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
   ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
   ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
   ```
   - **위험**: 인증된 모든 사용자가 전체 데이터 접근 가능
   - **권장**: `fix-security-issues.sql` 실행으로 RLS 재활성화

#### 🟡 주의 (Warning)
2. **스키마 불일치**: `supabase-setup.sql`과 `COMPLETE_SUPABASE_SETUP_V2.sql` 간 차이
   - `supabase-setup.sql`: `profiles.id = UUID (auth.users 참조)`
   - `COMPLETE_SUPABASE_SETUP_V2.sql`: `profiles.user_id = UUID` (별도 컬럼)

3. **관리자 계정 미설정** (`supabase-admin-account.sql`)
   ```sql
   'YOUR-USER-UID-HERE'  -- ⚠️ 플레이스홀더 교체 필요
   ```

---

## 2. 🖥️ 프론트엔드 코드 분석

### 2.1 Supabase 테이블 사용 현황

| 테이블 | 참조 횟수 | 사용 파일 |
|--------|----------|-----------|
| threads | 23회 | admin-dashboard, admin-thread, supabase-client 등 |
| profiles | 19회 | login 페이지, supabase-client 등 |
| payments | 10회 | supabase-client, payment 관련 |
| admins | 8회 | index, login 페이지 등 |
| jnu_students | 6회 | login-jnu, partner-dashboard-jnu |
| korea_students | 3회 | login-korea, partner-dashboard-korea |
| applications | 3회 | supabase-client |
| messages | 2회 | supabase-client |
| file_metadata | 2회 | secure-file-handler |
| documents | 3회 | secure-file-handler (스토리지) |

### 2.2 프론트엔드 문제점

#### 🔴 심각
1. **JavaScript 에러** (`partner-dashboard-korea.html:577`)
   ```
   Cannot set properties of null (setting 'innerHTML')
   ```
   - **원인**: `document.getElementById('content')` 요소가 없음
   - **해결**: HTML에 `id="content"` 요소 추가 필요

#### 🟡 주의
2. **404 에러 발생** (모든 페이지)
   - 특정 리소스 로드 실패 (favicon 또는 기타 파일)

3. **다국어 초기화 중복**
   ```
   [i18n] Language selector already initialized - skipping
   ```
   - `i18n.js`가 두 번 호출되고 있음

4. **autocomplete 속성 누락** (login-korea.html)
   ```
   Input elements should have autocomplete attributes
   ```

---

## 3. 🔐 보안 분석

### 3.1 보안 점수: 45/100 🔴

#### 🔴 심각 (Critical) - 즉시 조치 필요

| # | 이슈 | 위험도 | 상태 |
|---|------|--------|------|
| 1 | **RLS 비활성화됨** | 🔴 심각 | 미해결 |
| 2 | **API Key 노출** (anon key) | 🟡 보통 | 정상* |

> *Supabase anon key는 public이므로 노출 자체는 문제없으나, RLS가 비활성화된 상태에서는 위험

#### 🟡 주의 (Warning)

| # | 이슈 | 위험도 |
|---|------|--------|
| 3 | Function search_path 미설정 | 보통 |
| 4 | Leaked password protection 미활성화 | 보통 |

### 3.2 RLS 정책 현황

| 테이블 | RLS 상태 | 정책 수 |
|--------|----------|---------|
| profiles | ⚠️ 불확실 | 3개 정의됨 |
| threads | ⚠️ 불확실 | 4개 정의됨 |
| payments | ⚠️ 불확실 | 2개 정의됨 |
| messages | ⚠️ 불확실 | 3개 정의됨 |
| admins | ✅ 활성화 | 4개 정의됨 |
| jnu_students | ✅ 활성화 | 4개 정의됨 |
| korea_students | ✅ 활성화 | 4개 정의됨 |

### 3.3 권장 보안 조치

1. **즉시 실행**: `fix-security-issues.sql` 실행
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ```

2. **Supabase Dashboard 설정**
   - Authentication → Policies → "Leaked password protection" 활성화

3. **Environment Variables 사용**
   - API Key를 환경변수로 이동 (현재는 하드코딩됨)

---

## 4. 🌐 실시간 사이트 점검

### 4.1 페이지 접속 테스트

| 페이지 | 상태 | 로드 시간 | 에러 |
|--------|------|-----------|------|
| index.html | ✅ 정상 | 8.01s | 404 (1건) |
| login-korea.html | ✅ 정상 | 7.72s | 404 (1건) |
| admin-login.html | ✅ 정상 | 8.07s | 404 (1건) |
| dashboard-korea.html | ✅ 정상 | 7.99s | 404 (1건) |
| partner-dashboard-korea.html | ⚠️ 에러 | 7.88s | JS 에러 |

### 4.2 Supabase 연결 상태

```
✅ Supabase URL: https://gqistzsergddnpcvuzba.supabase.co
✅ Supabase 클라이언트 즉시 초기화
✅ 인증 상태 모니터링 활성화
```

### 4.3 발견된 실시간 에러

1. **partner-dashboard-korea.html**
   ```
   ❌ [DASHBOARD] 로그인 세션 없음
   ❌ Cannot set properties of null (setting 'innerHTML')
   ```

2. **404 리소스 에러** (모든 페이지)
   - 누락된 파일 확인 필요

---

## 5. 📝 스키마-코드 정합성

### 5.1 테이블 매핑 검증

| SQL 테이블 | 프론트엔드 사용 | 정합성 |
|------------|----------------|--------|
| profiles | ✅ 사용됨 | ⚠️ 컬럼명 차이 |
| threads | ✅ 사용됨 | ✅ 일치 |
| payments | ✅ 사용됨 | ✅ 일치 |
| messages | ✅ 사용됨 | ✅ 일치 |
| applications | ✅ 사용됨 | ✅ 일치 |
| admins | ✅ 사용됨 | ✅ 일치 |
| jnu_students | ✅ 사용됨 | ✅ 일치 |
| korea_students | ✅ 사용됨 | ⚠️ 컬럼 확장됨 |
| file_metadata | ✅ 사용됨 | ✅ 일치 |
| file_access_logs | ✅ 사용됨 | ✅ 일치 |

### 5.2 profiles 테이블 스키마 차이

**supabase-setup.sql (원본)**:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    ...
);
```

**COMPLETE_SUPABASE_SETUP_V2.sql (v2)**:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    ...
);
```

- **문제**: 프론트엔드 코드가 `id = auth.uid()` 패턴을 사용하지만, v2 스키마는 `user_id` 컬럼 사용
- **권장**: 하나의 스키마로 통일 필요

---

## 6. ✅ 권장 조치 사항

### 🔴 긴급 (24시간 내)

1. **RLS 재활성화**
   ```sql
   -- Supabase SQL Editor에서 실행
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
   ```

2. **partner-dashboard-korea.html 수정**
   - `id="content"` 요소 추가 또는 에러 핸들링 개선

### 🟡 중요 (1주일 내)

3. **스키마 통일**
   - `supabase-setup.sql`과 `COMPLETE_SUPABASE_SETUP_V2.sql` 중 하나 선택
   - 프론트엔드 코드와 일치하도록 수정

4. **관리자 계정 설정**
   ```sql
   -- supabase-admin-account.sql에서 실제 UID로 교체
   UPDATE profiles SET role = 'super_admin' 
   WHERE email = 'taemin.ahn@lawyeon.com';
   ```

5. **Supabase Dashboard 설정**
   - Leaked password protection 활성화

### 🟢 개선 (1개월 내)

6. **404 에러 해결**
   - 누락된 리소스 파일 확인 및 추가

7. **i18n 초기화 중복 제거**
   - `initLanguageSelector()` 호출 위치 정리

8. **autocomplete 속성 추가**
   - 로그인 폼에 `autocomplete="current-password"` 등 추가

---

## 7. 📎 참고 자료

### SQL 파일 실행 순서 (권장)

1. `supabase-setup.sql` - 기본 테이블 생성
2. `supabase-security-tables.sql` - 보안 테이블
3. `CREATE_STORAGE_BUCKETS.sql` - Storage 설정
4. `setup-admins-table.sql` - 관리자 테이블
5. `setup-korea-university.sql` - 한국대 설정
6. `korea-students-extended.sql` - 한국대 데이터
7. `MESSAGES_TABLE_FIX.sql` - messages 수정
8. `fix-security-issues.sql` - RLS 활성화

### 테스트 계정 (admins 테이블)

| 이메일 | 역할 | 용도 |
|--------|------|------|
| taemin.ahn@lawyeon.com | super_admin | 최고 관리자 |
| admin@lawyeon.com | admin | 법무법인 직원 |
| admin@jnu.ac.kr | partner_jnu | 전남대 담당자 |
| admin@korea.ac.kr | partner_korea | 한국대 담당자 |

---

**리포트 작성**: Claude AI  
**검토 완료일**: 2025-12-29
