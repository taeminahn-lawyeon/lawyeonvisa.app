# PO/서비스 아키텍처 종합 점검 보고서 (2026-02-06)

## 법무법인 로연 출입국이민지원센터 (lawyeonvisa.app)

**검토일**: 2026-02-06
**검토 범위**: 전체 코드베이스 (31 HTML, 11 JS, 5 CSS, 2 Edge Functions, DB 스키마)
**이전 검토일**: 2025-12-29 (PO 77/100, QA 70/100)

---

## Executive Summary

### 종합 평가: 55/100 (이전 대비 하락 조정)

이전 보고서(2025-12-29)에서 산출한 70~77점은 UI 완성도 중심 평가였습니다.
이번 심층 코드 레벨 QA를 통해 **보안 취약점, 아키텍처 결함, 미구현 기능**을 정밀 분석한 결과,
실서비스 운영 관점에서는 55/100으로 재평가합니다.

| 영역 | 점수 | 이전 | 변화 | 핵심 사유 |
|------|------|------|------|-----------|
| **보안** | 30/100 | 45 | ↓ | XSS 6건, 인증 우회 2건, 암호화 결함 발견 |
| **결제 시스템** | 40/100 | - | NEW | 서버 검증 미흡, PayPal 미구현, 금액 조작 가능 |
| **프론트엔드 품질** | 60/100 | 70 | ↓ | 경쟁하는 2개 i18n 시스템, 60+ console.log |
| **백엔드 연동** | 45/100 | - | NEW | RLS 불확실, Realtime 미완성 |
| **고객 여정 완성도** | 65/100 | 75 | ↓ | 결제~쓰레드 E2E 검증 불가 |
| **다국어 지원** | 35/100 | - | NEW | 7개 언어 중 56%만 번역, 셀렉터 1페이지만 존재 |
| **코드 아키텍처** | 50/100 | 75 | ↓ | 모듈 시스템 불일치, 변수명 불일치, 데드코드 |

---

## PART 1: 보안 취약점 (CRITICAL)

### 1.1 즉시 조치 필요 (Severity: CRITICAL)

#### BUG-SEC-01: Admin 모드 URL 파라미터 우회
- **파일**: `service-apply-general.html:1673`
- **내용**: `?admin=true` URL 파라미터만으로 인증 없이 서비스 신청 페이지 전체 접근 가능
- **코드**:
  ```javascript
  const isAdminMode = urlParams.get('admin') === 'true' || window.isAdminLoggedIn();
  // isAdminMode일 때 session check 완전 스킵
  ```
- **위험도**: 누구나 URL에 `?admin=true` 추가하여 인증 우회
- **조치**: URL 파라미터 기반 admin 체크 제거, 서버 측 role 검증으로 대체

#### BUG-SEC-02: Admin 대시보드 접근 제어 부재
- **파일**: `admin-dashboard.html:1085-1103`
- **내용**: `checkAdminAccess()` 함수가 role 검증 없이 모든 Supabase 세션을 허용
- **코드**:
  ```javascript
  const session = await checkSession();
  if (session && session.user) return true;  // role 검사 없음!
  if (sessionStorage.getItem('adminLoggedIn') === 'true') return true; // 스푸핑 가능!
  ```
- **위험도**: 일반 고객 Google 로그인으로 관리자 대시보드 전체 접근 가능
- **조치**: `profiles` 테이블에서 `role === 'super_admin' || role === 'admin'` 서버 측 검증 필수

#### BUG-SEC-03: 쓰레드 메시지 XSS (Stored XSS)
- **파일**: `visa-thread-general.html:1170`, `admin-thread.html:2075`, `thread-general-v2.html:2516`
- **내용**: DB에서 읽어온 메시지 content를 `innerHTML`로 직접 렌더링
- **코드**:
  ```javascript
  messageDiv.innerHTML = `<div class="message-bubble">${msg.content}</div>`;
  ```
- **위험도**: 악의적 메시지로 관리자/사용자 브라우저에서 임의 JS 실행 가능
- **조치**: DOMPurify 도입 또는 `textContent` 사용

#### BUG-SEC-04: 파일명/URL 인젝션
- **파일**: `visa-thread-general.html:1156-1163`
- **내용**: 파일명과 URL이 onclick 핸들러에 이스케이프 없이 삽입
- **코드**:
  ```javascript
  onclick="downloadFile('${msg.file_url}', '${msg.file_name}')"
  ```
- **위험도**: 악의적 파일명으로 XSS 실행 가능
- **조치**: `encodeURIComponent()` 및 HTML 이스케이프 적용

#### BUG-SEC-05: 블로그 콘텐츠 Raw HTML 렌더링
- **파일**: `blog-post.html:821`
- **내용**: `post.content`를 그대로 HTML로 렌더링
- **위험도**: 관리자 계정 탈취 시 모든 방문자에 악성코드 배포 가능
- **조치**: DOMPurify로 콘텐츠 새니타이징

### 1.2 높음 (Severity: HIGH)

#### BUG-SEC-06: AES-GCM IV 재사용
- **파일**: `js/secure-file-handler.js:78, 96`
- **내용**: 파일 본문과 파일명 암호화에 동일 IV 사용
- **위험도**: GCM 인증 보장이 깨지고, 두 암호문 XOR로 평문 정보 누출 가능
- **조치**: 파일명 암호화에 별도 IV 생성

#### BUG-SEC-07: secure-file-handler.js 변수명 오류
- **파일**: `js/secure-file-handler.js:205, 215, 252, 263, 275, 402`
- **내용**: `supabaseClient` 대신 `supabase`라는 미정의 변수 참조
- **위험도**: **파일 업로드/다운로드 전체 기능이 ReferenceError로 동작 불가**
- **조치**: 모든 `supabase` 참조를 `supabaseClient`로 수정

#### BUG-SEC-08: 암호화 키 IndexedDB 평문 저장
- **파일**: `js/secure-file-handler.js:22, 374-380`
- **내용**: `extractable: true`로 생성된 키가 IndexedDB에 JWK로 저장
- **위험도**: XSS 1건으로 모든 암호화 파일 복호화 가능
- **조치**: CSP 헤더 적용 + XSS 전량 수정 후, 키 wrapping 검토

---

## PART 2: 결제 시스템 결함

### 2.1 결제 금액 서버 측 미검증
- **파일**: `supabase/functions/confirm-payment/index.ts:107-113`
- **내용**: Edge Function이 금액의 형식만 검증 (양수, 1억 이하)하고, 해당 서비스의 정가와 대조하지 않음
- **위험도**: 클라이언트에서 `servicePricing` 객체를 수정하면 할인된 금액으로 결제 가능
- **조치**: DB에 주문 생성 시 예상 금액 저장 → Edge Function에서 대조

### 2.2 PayPal 결제 클라이언트 측 캡처
- **파일**: `js/payment-integration.js:159-184`
- **내용**: `actions.order.capture()`를 클라이언트에서 직접 호출, 서버 측 검증 없음
- **조치**: 서버 측 PayPal Order API 검증 Edge Function 구현

### 2.3 Idempotency 보호가 메모리 기반
- **파일**: `supabase/functions/confirm-payment/index.ts:26`
- **내용**: `new Set<string>()`으로 중복 결제 방지 → Cold start 시 초기화됨
- **조치**: `processed_payments` DB 테이블로 교체

### 2.4 Toss 클라이언트 키 2개 공존
- **파일**: `js/payment-integration.js:9` (`live_gck_...`) vs `service-apply-general.html:1921` (`live_ck_...`)
- **내용**: 서로 다른 두 라이브 키가 공존하며, 어떤 것이 실제 사용 키인지 혼란
- **조치**: 미사용 키 제거, 단일 키로 통일

---

## PART 3: 아키텍처 결함

### 3.1 경쟁하는 2개의 i18n 시스템

| 구분 | System A (i18n.js) | System B (main.js) |
|------|--------------------|--------------------|
| localStorage 키 | `i18n_language` | `language` |
| 기본 언어 | English | Korean |
| DOM 업데이트 | `textContent` | `innerHTML` |
| 지원 언어 | 7개 (ko/en/zh/vi/ja/mn/th) | 4개 (ko/en/zh/vi) |
| 셀렉터 UI | `#language-selector-btn` | `.lang-btn` |
| 현재 상태 | 활성 (10개 페이지) | **고아 (0개 페이지에서 로드)** |

**조치**: main.js의 i18n 로직 완전 제거, System A로 통일

### 3.2 다국어 번역 완성도: 56%
- 전체 778개 키 중 7개 언어 모두에 존재하는 키: **439개 (56%)**
- `ko`에 있지만 `en`에 없는 키: 119개
- `en`에 있지만 `ko`에 없는 키: 181개
- `zh/vi/ja/mn/th` 각각 ~155개 키 누락
- **언어 셀렉터가 index.html 1개 페이지에만 존재** → 다른 페이지에서 언어 변경 불가

### 3.3 모듈 시스템 불일치
- `secure-file-handler.js`: ES Modules (`export {}`)
- `payment-integration.js`: CommonJS (`module.exports`)
- 나머지: 전역 스코프 (no module system)
- 결과: `secure-file-handler.js`의 `export`가 일반 `<script>` 태그에서 작동하지 않음

### 3.4 supabaseClient 초기화 경쟁 조건
- **파일**: `js/supabase-client.js:19-35`
- **내용**: `window.supabase`가 로드 전이면 `DOMContentLoaded` 이벤트 리스너에서 생성하지만, 다른 함수들이 그 전에 `supabaseClient`를 호출할 수 있음
- **조치**: Promise 기반 초기화 패턴 도입

### 3.5 60+ console.log 문
- `supabase-client.js`: 36건 (세션, 프로필, 키 프리뷰 등 PII 포함)
- `main.js`: 5건
- `i18n.js`: 10건
- `chat-widget.js`: 5건
- `notification-service.js`: 1건
- 기타: 5건
- **조치**: 프로덕션 빌드 시 console.log 제거 또는 로깅 프레임워크 도입

---

## PART 4: 기능 완성도 매핑

### 4.1 고객 여정별 완성도

#### 일반 외국인 고객 여정

| # | 단계 | 페이지 | UI | 백엔드 | E2E |
|---|------|--------|-----|--------|-----|
| 1 | 메인 진입 | index.html | OK | - | OK |
| 2 | Google 로그인 | index.html | OK | Supabase Auth | OK |
| 3 | 프로필 작성 | profile-setup.html | OK | profiles 테이블 | OK |
| 4 | 서비스 탐색 | index.html, service-navigator.html | OK | - | OK |
| 5 | 서비스 신청 | service-apply-general.html | OK | 부분 | **위험** |
| 6 | 결제 (Toss) | Toss SDK → payment-success.html | OK | confirm-payment Edge Fn | **검증 미흡** |
| 7 | 결제 (PayPal) | payment-integration.js | 미완 | **미구현** | NG |
| 8 | 결제 (Wise) | payment-wise.html | OK | 수동 확인 | 부분 |
| 9 | 쓰레드 소통 | thread-general-v2.html | OK | Supabase Realtime | **INSERT만** |
| 10 | 파일 업로드 | secure-file-handler.js | OK | **ReferenceError** | NG |
| 11 | 서비스 완료 | thread archive | OK | DB 상태 변경 | OK |

**일반 고객 여정 완성도: 55%**

#### 협약 기관 학생 여정

| # | 단계 | 상태 | 비고 |
|---|------|------|------|
| 1 | 전용 로그인 (JNU) | OK | visa-login-jnu.html |
| 2 | 전용 로그인 (DHU) | OK | login-dhu.html |
| 3 | 30% 할인 적용 | OK | service-pricing.js에 로직 존재 |
| 4 | 브랜드 차별화 | OK | JNU: Green, DHU: 별도 |
| 5 | 학번 인증 | **프론트만** | 서버 측 인증 없음 |
| 6 | SNU 페이지 | **미구현** | README에 예정으로 기재 |

**협약 기관 여정 완성도: 60%**

#### 관리자 여정

| # | 기능 | 상태 | 비고 |
|---|------|------|------|
| 1 | 로그인 | **보안 결함** | role 미검증, sessionStorage 우회 가능 |
| 2 | 대시보드 통계 | OK | 쓰레드 카운트, 필터 |
| 3 | 쓰레드 상태 변경 | OK | payment→document→processing→completed |
| 4 | 메시지 전송 | OK | Quill 에디터 |
| 5 | 환불 처리 | **미구현** | |
| 6 | 블로그 관리 | OK | admin-blog.html |

**관리자 여정 완성도: 50%**

#### 담당자 (Partner) 여정

| # | 기능 | 상태 | 비고 |
|---|------|------|------|
| 1 | 학생 현황 조회 | OK (UI) | RLS 의존 |
| 2 | 비자 만료 알림 | OK (UI) | |
| 3 | 일괄 알림 발송 | **미구현** | |
| 4 | CSV 내보내기 | **미구현** | |

**담당자 여정 완성도: 40%**

### 4.2 데드 링크 및 고아 파일

#### 데드 링크 (존재하지 않는 페이지 참조)
| 참조 위치 | 참조 대상 | 상태 |
|-----------|-----------|------|
| `js/notification-service.js:122` | `my-threads.html` | 파일 없음 (404) |

#### 고아 파일 (어디서도 참조되지 않음)
| 파일 | 성격 |
|------|------|
| `visa-thread-general.html` | 레거시 쓰레드 (orphan) |
| `admin-insert-blog.html` | 블로그 삽입 도구 |
| `admin-test-login.html` | 테스트 전용 |
| `supabase-diagnostic.html` | 디버그 도구 |
| `profile-edit.html` | 프로필 수정 (미연결) |

---

## PART 5: 개선 로드맵 (PO 관점)

### Phase 0: 긴급 보안 패치 (즉시)

| # | 작업 | 위험도 | 파일 |
|---|------|--------|------|
| 1 | `?admin=true` URL 우회 제거 | CRITICAL | service-apply-general.html |
| 2 | admin-dashboard.html role 검증 추가 | CRITICAL | admin-dashboard.html |
| 3 | 쓰레드 메시지 XSS 방지 (DOMPurify) | CRITICAL | thread-*.html, admin-thread.html |
| 4 | 파일명/URL HTML 이스케이프 | CRITICAL | visa-thread-general.html |
| 5 | 블로그 콘텐츠 새니타이징 | HIGH | blog-post.html |
| 6 | RLS 활성화 SQL 실행 확인 | CRITICAL | Supabase Dashboard |

### Phase 1: 결제 시스템 안정화 (1주)

| # | 작업 | 파일 |
|---|------|------|
| 1 | 서버 측 금액 검증 (주문 테이블에 예상 금액 저장) | confirm-payment/index.ts |
| 2 | Idempotency를 DB 테이블로 교체 | confirm-payment/index.ts |
| 3 | 미사용 Toss 클라이언트 키 제거 | payment-integration.js |
| 4 | PayPal 서버 측 검증 또는 비활성화 | payment-integration.js |

### Phase 2: 코드 품질 개선 (2주)

| # | 작업 | 영향 범위 |
|---|------|-----------|
| 1 | secure-file-handler.js `supabase` → `supabaseClient` 수정 | 파일 암호화 전체 |
| 2 | AES-GCM IV 재사용 수정 (파일명에 별도 IV) | secure-file-handler.js |
| 3 | 60+ console.log 제거 | 전체 JS |
| 4 | main.js 레거시 i18n 로직 제거 | main.js |
| 5 | `createUserProfile` / `createOrUpdateProfile` 중복 함수 통합 | supabase-client.js |
| 6 | supabaseClient 초기화를 Promise 기반으로 개선 | supabase-client.js |
| 7 | `createPayment`에 `.select()` 추가 | supabase-client.js |
| 8 | 고아 파일 정리 (visa-thread-general.html 등) | 프로젝트 루트 |

### Phase 3: 다국어 완성 (3주)

| # | 작업 | 상세 |
|---|------|------|
| 1 | 언어 셀렉터를 모든 페이지 헤더에 추가 | 현재 index.html에만 존재 |
| 2 | thread-general-v2.html 77개 하드코딩 한국어 문자열 i18n화 | 가장 큰 갭 |
| 3 | translations.js 키 동기화 (ko ↔ en 119/181개 불일치 해소) | translations.js |
| 4 | zh/vi/ja/mn/th 각 ~155개 누락 키 번역 | translations.js |
| 5 | payment-success.html, profile-edit.html, blog.html i18n 적용 | 현재 0% |
| 6 | 삭제된 언어(ru/id/my) 잔여 코드 제거 | i18n.js |

### Phase 4: 기능 완성 (1개월)

| # | 작업 | 우선순위 |
|---|------|----------|
| 1 | Supabase Realtime UPDATE/DELETE 이벤트 구독 | P1 |
| 2 | 메시지 페이지네이션 구현 | P1 |
| 3 | 파일 업로드 타입 제한 (PDF, 이미지만 허용) | P1 |
| 4 | 환불 처리 API + Admin UI | P2 |
| 5 | Partner CSV 내보내기 | P2 |
| 6 | 이메일 알림 시스템 (Resend) | P2 |
| 7 | SNU 전용 페이지 | P3 |
| 8 | WCAG 2.1 접근성 (ARIA 속성 추가) | P3 |

### Phase 5: 인프라 및 모니터링 (1개월)

| # | 작업 | 상세 |
|---|------|------|
| 1 | Content Security Policy (CSP) 헤더 적용 | XSS 방어 강화 |
| 2 | 에러 트래킹 도입 (Sentry) | 런타임 에러 모니터링 |
| 3 | 페이지 로딩 속도 최적화 (현재 7-8초 → 목표 3초) | CDN, 이미지 압축 |
| 4 | 자동화 테스트 도입 (E2E: Playwright) | 테스트 커버리지 0% → 목표 60% |
| 5 | Schema.org 전화번호 플레이스홀더 교체 | index.html:40 (`+82-2-XXX-XXXX`) |

---

## PART 6: QA 발견 사항 전체 목록

### CRITICAL (즉시 조치)

| ID | 영역 | 내용 | 파일:라인 |
|----|------|------|-----------|
| C-01 | 보안 | Admin 모드 URL 우회 (`?admin=true`) | service-apply-general.html:1673 |
| C-02 | 보안 | Admin 대시보드 role 미검증 | admin-dashboard.html:1085 |
| C-03 | 보안 | Stored XSS (메시지 innerHTML) | thread-*.html 다수 |
| C-04 | 보안 | 파일명/URL 인젝션 XSS | visa-thread-general.html:1156 |
| C-05 | 보안 | 블로그 Raw HTML 렌더링 | blog-post.html:821 |
| C-06 | 결제 | 결제 금액 서버 미검증 | confirm-payment/index.ts:107 |
| C-07 | 기능 | secure-file-handler `supabase` 미정의 → 전체 불가 | secure-file-handler.js:205+ |

### HIGH (1주 내 조치)

| ID | 영역 | 내용 | 파일:라인 |
|----|------|------|-----------|
| H-01 | 암호화 | AES-GCM IV 재사용 (파일+파일명) | secure-file-handler.js:78,96 |
| H-02 | 암호화 | 키 extractable + IndexedDB 평문 저장 | secure-file-handler.js:22,374 |
| H-03 | 결제 | PayPal 클라이언트 측만 캡처, 서버 검증 없음 | payment-integration.js:159 |
| H-04 | 결제 | Toss 라이브 키 2개 공존 (어떤 것이 유효한지 불명확) | payment-integration.js:9, service-apply-general.html:1921 |
| H-05 | 인증 | chat-widget.js sender.name XSS (미이스케이프) | chat-widget.js:242,245 |
| H-06 | 데이터 | Welcome 메시지에 serviceName HTML 인젝션 가능 | supabase-client.js:921 |

### MEDIUM (2주 내 조치)

| ID | 영역 | 내용 | 파일:라인 |
|----|------|------|-----------|
| M-01 | 결제 | Idempotency in-memory Set (serverless에서 무효) | confirm-payment/index.ts:26 |
| M-02 | 인증 | `localStorage.clear()` 로그아웃 시 전체 삭제 (과도함) | supabase-client.js:137 |
| M-03 | 코드 | `createUserProfile` / `createOrUpdateProfile` 중복 | supabase-client.js:178,260 |
| M-04 | 코드 | `createOrUpdateProfile` created_at 매번 덮어쓰기 | supabase-client.js:271 |
| M-05 | 코드 | `createPayment` .select() 누락 → DB ID 반환 불가 | supabase-client.js:517 |
| M-06 | i18n | 2개 시스템 충돌 (main.js vs i18n.js) | main.js, i18n.js |
| M-07 | i18n | 언어 셀렉터 index.html에만 존재 | index.html |
| M-08 | i18n | 번역 키 44% 불일치 (778개 중 339개 누락) | translations.js |
| M-09 | UX | 상담 폼 submit이 실제로 아무것도 전송하지 않음 | main.js:246 |
| M-10 | 코드 | 60+ console.log (PII 포함) 프로덕션 잔존 | 전체 JS |
| M-11 | 성능 | 스크롤 이벤트 핸들러 throttle 없음 | main.js:316 |
| M-12 | 성능 | IntersectionObserver unobserve 미호출 (메모리 릭) | main.js:297 |
| M-13 | Realtime | INSERT 이벤트만 구독 (UPDATE/DELETE 미처리) | thread-general-v2.html:2862 |
| M-14 | Realtime | 새 메시지마다 전체 메시지 리로드 (비효율) | thread-general-v2.html:2868 |
| M-15 | 파일 | 업로드 파일 타입 제한 없음 (모든 타입 허용) | thread-general-v2.html |
| M-16 | 알림 | 알림 언어 하드코딩 `'en'` (사용자 설정 무시) | notification-service.js:203 |
| M-17 | 링크 | `my-threads.html` 데드 링크 | notification-service.js:122 |
| M-18 | SEO | Schema.org 전화번호 플레이스홀더 (`+82-2-XXX-XXXX`) | index.html:40 |
| M-19 | 접근성 | 전체 사이트 ARIA 속성 0개 | 전체 HTML |
| M-20 | 모듈 | ES Modules / CommonJS / Global 혼재 | secure-file-handler.js, payment-integration.js |

### LOW (1개월 내 조치)

| ID | 영역 | 내용 | 파일:라인 |
|----|------|------|-----------|
| L-01 | 코드 | `getUserType()` 항상 'general' 반환 | service-pricing.js:295 |
| L-02 | 코드 | 삭제된 언어(ru/id/my) 잔여 코드 | i18n.js:323-354 |
| L-03 | 코드 | `detectBrowserLanguage()` 미호출 데드코드 | i18n.js:72 |
| L-04 | 코드 | i18n 파라미터 치환 첫 번째만 교체 | i18n.js:125 |
| L-05 | 코드 | 브랜딩 console.log (KoreaLanding Partners) | main.js:373 |
| L-06 | 코드 | 데모/개발 코드 프로덕션 노출 | chat-widget.js:313-380 |
| L-07 | 코드 | 메시지 길이 제한 없음 | chat-widget.js:145 |
| L-08 | 코드 | localStorage JSON.parse 에러 핸들링 없음 | service-pricing.js:296 |
| L-09 | 코드 | 보안 파일 핸들러 IP 조회가 외부 서비스 의존 (ipify.org) | secure-file-handler.js:414 |
| L-10 | 코드 | IndexedDB store.put() Promise 미래핑 | secure-file-handler.js:374 |
| L-11 | UI | 결제 에러 시 버튼 텍스트 하드코딩 영어 | service-apply-general.html:2057 |
| L-12 | 고아 | visa-thread-general.html 어디서도 미참조 | 루트 |

---

## PART 7: 점수 산정 근거

### 보안 (30/100)
- CRITICAL XSS 5건 (메시지, 파일명, 블로그, welcome 메시지, sender name)
- CRITICAL 인증 우회 2건 (admin URL, admin dashboard)
- 암호화 구현 결함 3건 (IV 재사용, extractable 키, 변수 미정의)
- RLS 활성화 상태 불확실

### 결제 시스템 (40/100)
- Toss 기본 플로우는 작동하나 서버 측 금액 검증 부재
- PayPal 서버 측 미구현
- Idempotency 사실상 무효 (serverless 환경)
- 라이브 키 2개 공존

### 프론트엔드 품질 (60/100)
- UI 디자인 자체는 Toss 스타일로 세련됨
- 코드 품질: 60+ console.log, 중복 함수, 데드코드
- 2개 i18n 시스템 충돌
- 모듈 시스템 3종 혼재

### 다국어 지원 (35/100)
- 7개 언어 선언했으나 번역 키 56%만 완성
- 언어 셀렉터 1페이지만 존재
- 6+개 페이지에 i18n 미적용

---

**작성자**: Claude Opus 4.6 (PO + QA 심층 분석)
**검토 완료일**: 2026-02-06
**이전 보고서**: 2025-12-29 (PO 77/100, QA 70/100)
