# 📋 GitHub & Supabase 업로드 체크리스트

## 생성일: 2025-12-29
## QA 점검 완료 후 권장 조치 적용 완료

---

## 🔵 GitHub 업로드 항목 (총 10개 파일)

### 📁 HTML 파일 (8개) - 수정됨

| 파일명 | 수정 내용 | 우선순위 |
|--------|----------|---------|
| `partner-dashboard-korea.html` | JS 오류 수정 (id='content' 요소 추가), favicon 추가 | 🔴 긴급 |
| `partner-dashboard-jnu.html` | JS 오류 수정 (id='content' 요소 추가), favicon 추가 | 🔴 긴급 |
| `login-korea.html` | autocomplete 속성 추가, favicon 추가 | 🟡 중요 |
| `login-jnu.html` | autocomplete 속성 추가, favicon 추가 | 🟡 중요 |
| `admin-login.html` | favicon 추가 | 🟢 개선 |
| `dashboard-korea.html` | favicon 추가 | 🟢 개선 |
| `dashboard-jnu.html` | favicon 추가 | 🟢 개선 |
| `index.html` | favicon 추가 | 🟢 개선 |

### 📁 신규 파일 (2개)

| 파일명 | 설명 | 우선순위 |
|--------|------|---------|
| `favicon.svg` | 사이트 파비콘 (404 에러 해결) | 🟡 중요 |
| `sql/PRODUCTION_SETUP_COMPLETE.sql` | RLS 활성화 통합 SQL | 🔴 긴급 |

### 📁 문서 파일 (선택)

| 파일명 | 설명 | 우선순위 |
|--------|------|---------|
| `QA_REPORT.md` | QA 점검 전체 보고서 | 🟢 선택 |

---

## 🟠 Supabase SQL Editor 실행 항목 (1개)

### ⚠️ 반드시 실행해야 할 SQL

| 파일명 | 설명 | 실행 순서 |
|--------|------|----------|
| `sql/PRODUCTION_SETUP_COMPLETE.sql` | RLS 활성화 및 정책 설정 | **1번 (최우선)** |

### SQL 실행 방법
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `gqistzsergddnpcvuzba`
3. **SQL Editor** 메뉴 클릭
4. `PRODUCTION_SETUP_COMPLETE.sql` 내용 복사 & 붙여넣기
5. **Run** 버튼 클릭
6. 결과 확인: 모든 테이블의 `rls_enabled`가 `true`인지 확인

---

## ✅ 수정 내용 상세

### 1. partner-dashboard-korea.html / partner-dashboard-jnu.html
- **문제**: `document.getElementById('content').innerHTML` 호출 시 null 참조 오류
- **해결**: `<div id="content">` 요소 추가로 DOM 요소 보장
- **추가**: favicon 링크 태그 삽입

### 2. login-korea.html / login-jnu.html
- **문제**: 비밀번호 입력 필드에 autocomplete 속성 누락
- **해결**: `autocomplete="current-password"` 속성 추가
- **추가**: favicon 링크 태그 삽입

### 3. favicon.svg (신규)
- **문제**: 사이트 전체에서 favicon 404 에러 발생
- **해결**: SVG 형식의 파비콘 파일 생성 및 HTML에 링크

### 4. PRODUCTION_SETUP_COMPLETE.sql (신규)
- **목적**: 프로덕션 보안 설정 통합
- **내용**:
  - RLS 활성화 (profiles, threads, payments, messages, applications)
  - Function search_path 보안 설정
  - 테이블별 RLS 정책 생성

---

## 📌 GitHub 업로드 명령어

```bash
# 1. 모든 변경사항 스테이징
git add .

# 2. 커밋
git commit -m "fix: QA 점검 후 권장 조치 적용

- partner-dashboard-korea/jnu.html JS 오류 수정
- 로그인 폼 autocomplete 속성 추가  
- favicon 추가 (404 에러 해결)
- RLS 활성화 SQL 스크립트 추가"

# 3. 푸시
git push origin main
```

---

## ⚠️ 주의사항

### Supabase SQL 실행 전 확인
1. **백업**: 기존 데이터 백업 권장
2. **테스트**: 개발 환경에서 먼저 테스트
3. **RLS 상태**: 실행 후 반드시 RLS 활성화 상태 확인

### 추가 수동 작업 (Supabase Dashboard)
1. **Authentication → Policies → Leaked password protection 활성화**
2. 관리자 계정 생성 후 `admins` 테이블에 role 설정

---

## 📊 최종 점검 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| JS 오류 수정 | ✅ 완료 | partner-dashboard 2개 파일 |
| RLS 보안 | ✅ SQL 준비됨 | 실행 필요 |
| autocomplete | ✅ 완료 | 로그인 폼 2개 |
| favicon 404 | ✅ 완료 | 전체 적용 |
| i18n 중복 | ✅ 확인됨 | 이미 보호 로직 존재 |

---

**작성자**: AI QA Assistant  
**최종 업데이트**: 2025-12-29
