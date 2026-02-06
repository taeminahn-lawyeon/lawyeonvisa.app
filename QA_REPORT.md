# QA 심층 분석 보고서 (2026-02-06)

## 법무법인 로연 출입국이민지원센터

**검토일**: 2026-02-06
**대상 사이트**: https://lawyeonvisa.app
**검토 범위**: 전체 코드베이스 심층 분석 (31 HTML, 11 JS, 5 CSS, 2 Edge Functions, DB 스키마)
**이전 보고서**: 2025-12-29 (QA 70/100)

---

## Executive Summary

### 전체 평가: 55/100 (이전 70 → 55 재조정)

이전 보고서는 페이지 접속 및 기능 UI 중심 평가였습니다. 이번에는 **코드 레벨 심층 분석**을 통해
보안 취약점, 아키텍처 결함, 미완성 기능을 정밀히 식별했습니다.

| 영역 | 점수 | 이전 | 주요 발견 |
|------|------|------|-----------|
| **보안** | 30/100 | 45 | XSS 6건, 인증 우회 2건, 암호화 결함 3건 |
| **결제** | 40/100 | - | 금액 서버 미검증, PayPal 미구현, Idempotency 무효 |
| **코드 품질** | 60/100 | 70 | 60+ console.log, 중복 함수, 모듈 불일치 |
| **기능 동작** | 55/100 | 75 | 파일 핸들러 전체 불가, Realtime 불완전 |
| **다국어** | 35/100 | - | 56% 번역률, 셀렉터 1페이지만 존재 |
| **접근성** | 20/100 | 90 | ARIA 0개 (이전 점수는 사이트 접근 가능성 기준이었음) |

---

## 1. 보안 분석 (30/100)

### 1.1 CRITICAL 취약점 (7건)

| # | 취약점 | 파일:라인 | OWASP | 재현 방법 |
|---|--------|-----------|-------|-----------|
| 1 | Admin 모드 URL 우회 | service-apply-general.html:1673 | A01:Broken Access Control | URL에 `?admin=true` 추가 |
| 2 | Admin 대시보드 role 미검증 | admin-dashboard.html:1085 | A01:Broken Access Control | Google 로그인 후 URL 직접 접근 |
| 3 | Stored XSS (메시지) | thread-*.html 다수 | A03:Injection | 메시지에 `<script>` 태그 전송 |
| 4 | 파일명 XSS 인젝션 | visa-thread-general.html:1156 | A03:Injection | 악의적 파일명으로 업로드 |
| 5 | 블로그 콘텐츠 XSS | blog-post.html:821 | A03:Injection | 블로그 DB에 악성 HTML 삽입 |
| 6 | 결제 금액 서버 미검증 | confirm-payment/index.ts:107 | A04:Insecure Design | DevTools로 금액 변경 |
| 7 | secure-file-handler 전체 불가 | secure-file-handler.js:205 | A06:Vulnerable Components | ReferenceError (`supabase` 미정의) |

### 1.2 HIGH 취약점 (6건)

| # | 취약점 | 파일:라인 | 설명 |
|---|--------|-----------|------|
| 1 | AES-GCM IV 재사용 | secure-file-handler.js:78,96 | 파일+파일명에 동일 IV → 암호화 무력화 |
| 2 | 암호화 키 평문 저장 | secure-file-handler.js:22,374 | extractable + IndexedDB |
| 3 | PayPal 서버 검증 없음 | payment-integration.js:159 | 클라이언트만 캡처 |
| 4 | 라이브 키 2개 공존 | payment-integration.js:9 | 어떤 키가 유효한지 불명확 |
| 5 | sender.name XSS | chat-widget.js:242,245 | escapeHTML 미적용 |
| 6 | Welcome 메시지 HTML 인젝션 | supabase-client.js:921 | serviceName 미이스케이프 |

### 1.3 RLS (Row Level Security) 상태

| 테이블 | RLS 상태 | 비고 |
|--------|----------|------|
| profiles | **불확실** | `COMPLETE_SUPABASE_SETUP_V2.sql`에서 DISABLE됨, `fix-security-issues.sql` 실행 여부 미확인 |
| threads | **불확실** | 동일 |
| payments | **불확실** | 동일 |
| messages | **불확실** | 동일 |
| applications | **불확실** | 동일 |
| admins | 활성화 | 정책 4개 |
| jnu_students | 활성화 | 정책 4개 |
| korea_students | 활성화 | 정책 4개 |

**조치**: Supabase Dashboard에서 5개 핵심 테이블 RLS 상태 즉시 확인

---

## 2. 결제 시스템 분석 (40/100)

### 2.1 Toss Payments

| 항목 | 상태 | 비고 |
|------|------|------|
| SDK 초기화 | OK | `live_ck_` 키 사용 |
| 결제 요청 | OK | `requestPayment()` 정상 |
| 서버 확인 | **미흡** | 금액을 서비스 정가와 대조하지 않음 |
| Idempotency | **무효** | in-memory Set (serverless cold start 시 초기화) |
| Secret Key | **안전** | Deno.env 사용 (서버 측) |
| Client Key | **2개 공존** | `payment-integration.js:9` vs `service-apply-general.html:1921` |

### 2.2 PayPal

| 항목 | 상태 | 비고 |
|------|------|------|
| SDK 로드 | OK | Client ID 노출 (정상) |
| 결제 캡처 | **위험** | `actions.order.capture()` 클라이언트 전용 |
| 서버 검증 | **미구현** | Edge Function 없음 |
| 데이터 저장 | **localStorage만** | Supabase 미연동 |

### 2.3 Wise

| 항목 | 상태 | 비고 |
|------|------|------|
| 안내 페이지 | OK | payment-wise.html |
| 결제 확인 | 수동 | 관리자가 수동으로 확인 |

---

## 3. 코드 품질 분석 (60/100)

### 3.1 파일별 주요 이슈

#### supabase-client.js (34.2 KB, ~1000줄)
- console.log 36건 (PII 포함: 프로필, 세션, 키 프리뷰)
- `supabaseClient` 초기화 경쟁 조건 (line 19-35)
- `createUserProfile` / `createOrUpdateProfile` 중복 (line 178, 260)
- `createOrUpdateProfile`이 `created_at`을 매번 덮어씀 (line 271)
- `createPayment`에 `.select()` 누락 → DB ID 미반환 (line 517-519)
- `localStorage.clear()`로 로그아웃 시 전체 스토리지 삭제 (line 137)
- 입력값 검증/새니타이징 전무

#### payment-integration.js (12.5 KB)
- 라이브 Toss/PayPal 키 하드코딩 (line 9, 90)
- `saveApplication()`이 localStorage만 사용 (line 291-312)
- `createChatRoom()`이 데드코드 (localStorage 기반, Supabase 미연동)
- PayPal 금액 검증 없음

#### secure-file-handler.js (12.7 KB)
- **전체 Supabase 연동 불가** (`supabase` 변수 미정의, line 205+)
- AES-GCM IV 재사용 (line 78, 96)
- `extractable: true` 키 생성 (line 22)
- IndexedDB `store.put()` Promise 미래핑 (line 374)
- ES Modules `export`가 일반 `<script>` 태그와 호환 불가 (line 428)
- 외부 IP 조회 서비스 의존 (ipify.org, line 414)

#### main.js (13.2 KB)
- **현재 어떤 페이지에서도 로드되지 않는 고아 파일**
- 레거시 i18n 시스템 포함 (i18n.js와 충돌)
- `submitConsultation()` 실제 API 호출 없이 성공 표시 (line 246)
- 스크롤 핸들러 throttle 없음 (line 316)
- IntersectionObserver unobserve 미호출 → 메모리 릭 (line 297)
- 브랜딩 console.log "KoreaLanding Partners" (line 373)

#### i18n.js (13.8 KB)
- 삭제된 언어(ru/id/my) 잔여 코드 (line 323-354)
- `detectBrowserLanguage()` 데드코드 (line 72)
- 파라미터 치환 첫 번째만 교체 (`replace` → `replaceAll` 필요, line 125)
- console.log 10건

#### chat-widget.js (12.8 KB)
- `sender.name`, `sender.avatar` XSS 미방어 (line 242, 245)
- 파일 업로드 stub only (line 127)
- 데모/개발 코드 프로덕션 노출 (line 313-380)
- 메시지 길이 제한 없음 (line 145)
- 이벤트 리스너 cleanup 메서드 없음

#### notification-service.js (10.8 KB)
- 알림 언어 하드코딩 `'en'` (line 203)
- `my-threads.html` 데드 링크 참조 (line 122)
- ko/en 템플릿만 존재 (7개 언어 중 2개)
- 전역 함수 의존 (getUserProfile 등) → 로드 순서 의존

### 3.2 크로스 커팅 이슈

| 이슈 | 영향 파일 |
|------|-----------|
| 하드코딩된 자격증명 | supabase-client.js, payment-integration.js |
| 2개 i18n 시스템 충돌 | main.js vs i18n.js |
| 60+ console.log | 전체 8개 JS |
| 에러 핸들링 패턴 불일치 | throw / return {success:false} / silent 혼재 |
| 변수명 불일치 | supabaseClient (supabase-client.js) vs supabase (secure-file-handler.js) |
| localStorage를 DB로 사용 | payment-integration.js, chat-widget.js |
| 입력 새니타이징 없음 | supabase-client.js, notification-service.js |
| 모듈 시스템 3종 혼재 | ES Modules / CommonJS / Global |

---

## 4. 다국어 시스템 분석 (35/100)

### 4.1 번역 커버리지

| 언어 | 번역된 키 | 전체 대비 | 누락 |
|------|----------|----------|------|
| ko (Korean) | 599/778 | 77% | 179 |
| en (English) | 679/778 | 87% | 99 |
| zh (Chinese) | 612/778 | 79% | 166 |
| vi (Vietnamese) | 612/778 | 79% | 166 |
| ja (Japanese) | 610/778 | 78% | 168 |
| mn (Mongolian) | 610/778 | 78% | 168 |
| th (Thai) | 610/778 | 78% | 168 |

**7개 언어 모두에 존재하는 키: 439/778 (56%)**

### 4.2 페이지별 i18n 적용 현황

| 페이지 | i18n 적용 | 하드코딩 문자열 | 커버리지 |
|--------|----------|---------------|----------|
| service-apply-general.html | 26 attrs | 1 | ~96% |
| consultation-request.html | 19 attrs | 5 | ~79% |
| payment-fail.html | 12 attrs | 5 | ~71% |
| index.html | 49 attrs | 53 | ~48% |
| thread-general-v2.html | 7 attrs | **77** | **~8%** |
| payment-success.html | 0 | - | **0%** |
| profile-edit.html | 0 | 16 | **0%** |
| blog.html | 0 | 19 | **0%** |
| blog-post.html | 0 | 4 | **0%** |

### 4.3 언어 셀렉터
- **index.html에만 존재** → 다른 페이지에서 언어 변경 불가
- 초기 표시 "한국어"이지만 i18n.js 기본값은 English → 불일치

---

## 5. HTML 구조 분석

### 5.1 접근성 (WCAG 2.1)

| 항목 | 상태 | 비고 |
|------|------|------|
| `aria-*` 속성 | **0개** | 전체 사이트에 ARIA 미적용 |
| `role` 속성 | **0개** | |
| Skip Navigation | 없음 | 키보드 네비게이션 불가 |
| `<button>` 사용 | 미흡 | 인터랙티브 요소가 `<div onclick>` |
| `<label for>` | 미흡 | 폼 필드 연결 불완전 |
| 이미지 alt | **양호** | 대부분 의미 있는 alt 텍스트 |

### 5.2 SEO

| 항목 | index.html | 기타 페이지 |
|------|------------|-------------|
| meta description | OK | 대부분 없음 |
| Open Graph | OK | 없음 |
| Schema.org | OK (단, 전화번호 플레이스홀더) | 없음 |
| canonical | OK | 없음 |

### 5.3 데드 링크 / 고아 파일

**데드 링크:**
- `js/notification-service.js:122` → `my-threads.html` (존재하지 않음)

**고아 파일 (미참조):**
- `visa-thread-general.html` (레거시)
- `admin-insert-blog.html`
- `admin-test-login.html`
- `supabase-diagnostic.html`
- `profile-edit.html`
- `main.js` (어떤 페이지에서도 로드되지 않음)

---

## 6. 기능 동작 테스트

### 6.1 End-to-End 플로우 검증

| 플로우 | 단계 | 결과 | 차단 요인 |
|--------|------|------|-----------|
| 일반 회원 가입~결제 | 로그인→프로필→신청→결제 | **부분** | 금액 서버 검증 미흡 |
| 쓰레드 소통 | 메시지 전송/수신 | **부분** | INSERT만 구독, UPDATE/DELETE 미처리 |
| 파일 업로드 | 암호화→업로드→다운로드 | **불가** | `supabase` 변수 미정의 |
| 관리자 접근 | 로그인→대시보드 | **보안 결함** | role 미검증 |
| 협약 기관 할인 | 로그인→30% 할인 적용 | **부분** | `getUserType()` 항상 'general' 반환 |
| PayPal 결제 | 결제→확인 | **불가** | 서버 검증 없음 |

### 6.2 엣지 케이스

| 시나리오 | 결과 | 비고 |
|----------|------|------|
| Supabase 다운 시 | 로딩 스피너 무한 | 타임아웃/에러 표시 없음 |
| 네트워크 끊김 중 메시지 전송 | 실패 시 알림 없음 | 재시도 메커니즘 없음 |
| 결제 중 페이지 이탈 | 보류 데이터 localStorage 잔존 | 만료/정리 로직 없음 |
| 동시 탭 접속 | localStorage 동기화 이슈 | 탭 간 상태 불일치 가능 |

---

## 7. 권장 조치 요약

### 즉시 (서비스 운영 전 필수)

1. `?admin=true` URL 우회 제거
2. admin-dashboard.html role 검증 추가
3. 메시지 XSS 방지 (DOMPurify 도입)
4. 파일명/URL 이스케이프
5. 블로그 콘텐츠 새니타이징
6. Supabase RLS 상태 확인 및 활성화
7. secure-file-handler.js `supabase` → `supabaseClient` 수정

### 1주 내

8. 결제 금액 서버 측 검증
9. Idempotency DB 테이블로 교체
10. 미사용 Toss 키 제거
11. AES-GCM IV 재사용 수정

### 2주 내

12. 60+ console.log 제거
13. main.js 레거시 정리
14. 중복 함수 통합
15. 언어 셀렉터 전 페이지 적용

### 1개월 내

16. Realtime UPDATE/DELETE 구독
17. 메시지 페이지네이션
18. 파일 업로드 타입 제한
19. WCAG 2.1 접근성 개선
20. CSP 헤더 적용

---

## 8. 발견 사항 통계

| 심각도 | 건수 | 이전(2025-12-29) |
|--------|------|------------------|
| CRITICAL | 7 | 1 |
| HIGH | 6 | 1 |
| MEDIUM | 20 | 4 |
| LOW | 12 | 3 |
| **총계** | **45** | **9** |

이전 보고서 대비 5배의 이슈가 식별된 것은, 이번에 코드 레벨까지 심층 분석을 수행했기 때문입니다.

---

**작성자**: Claude Opus 4.6 (QA 심층 분석)
**검토 완료일**: 2026-02-06
**상세 PO 분석**: `PO_SERVICE_REVIEW.md` 참조
