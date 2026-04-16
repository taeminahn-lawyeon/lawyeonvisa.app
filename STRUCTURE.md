# 법연비자 웹사이트 구조

정적 HTML 기반 프런트엔드 + Supabase 백엔드(Edge Functions, Postgres) 구조.

## 📁 디렉터리 개요

```
lawyeonvisa.app/
├── *.html                  # 공개/관리자 페이지 (루트 배포)
├── blog/                   # 개별 블로그 포스트 HTML
├── css/                    # 스타일시트
├── js/                     # 클라이언트 스크립트
├── images/                 # 이미지 자산 (변호사, OG, 뱃지)
├── data/                   # 정적 JSON 데이터
├── sql/                    # 운영 DB 설정 스크립트
├── migrations/             # DB 마이그레이션
├── scripts/                # 빌드/운영 스크립트
├── supabase/functions/     # Supabase Edge Functions
└── .github/workflows/      # CI
```

## 🏠 공개 페이지 (HTML)

| 분류 | 파일 |
|---|---|
| **메인** | `index.html`, `404.html` |
| **블로그** | `blog.html`, `blog-post.html`, `blog/` (D-10, F-2-R 포스트) |
| **서비스** | `service-navigator.html`, `service-apply-general.html`, `service-demo.html`, `service-chosun.html`, `service-kdu.html` |
| **스레드** | `thread-general-v2.html`, `visa-thread-general.html` |
| **상담/신청** | `consultation-request.html`, `profile-submit.html`, `profile-edit.html` |
| **결제** | `payment-success.html`, `payment-fail.html`, `payment-wise.html` |
| **제휴** | `partnership-apply.html`, `partnership-apply-success.html` |
| **기관별 로그인** | `login-demo.html`, `login-chosun.html`, `login-kdu.html` |
| **정책/가격** | `price-list.html`, `privacy-policy.html`, `terms-of-service.html`, `refund-policy.html` |

## 🔐 관리자 페이지

- `admin-login.html`
- `admin-dashboard.html`
- `admin-blog.html`, `admin-blog-edit.html`, `admin-insert-blog.html`
- `admin-thread.html`

## 🎨 프런트엔드 에셋

### `css/`
- `style.css` — 전역 스타일
- `toss-style.css` — 결제(Toss) UI
- `ui-components.css` — 공통 컴포넌트
- `service-cards-simple.css` — 서비스 카드
- `chat-widget.css` — 챗 위젯

### `js/`
- `main.js` — 공통 엔트리
- `alpha-auth.js` — 인증
- `supabase-client.js` — Supabase 클라이언트
- `payment-integration.js` — 결제 연동
- `notification-service.js` — 알림
- `secure-file-handler.js` — 파일 업로드
- `service-pricing.js` — 서비스 가격
- `chat-widget.js`, `ui-components.js` — UI
- `i18n.js`, `translations.js` — 다국어
- `supabase-diagnostic.html` — ⚠️ JS 폴더에 HTML 혼입

### `images/`
- `attorneys/` — 변호사 사진 12장
- `og-image.png`, `thread-preview.png`, `moj-badge.jpg`

### `data/`
- `services.json` — 서비스 메타데이터

## 🗄️ 백엔드 / DB

### `supabase/functions/`
- `confirm-payment` — 결제 확인 Edge Function
- `send-notification` — 알림 발송 Edge Function

### `sql/`
- `PRODUCTION_SETUP_COMPLETE.sql`
- `SECURITY_ENHANCEMENT.sql`

### `migrations/`
- `add_thread_stages.sql`
- `fix_admin_rls_policies.sql`

## 🛠️ 스크립트 / 인프라

### `scripts/`
- `build-blog.js` — 블로그 빌드
- `validate-syntax.js` — 구문 검증
- `insert-d10-1-blog-post.js`, `insert-f2r-blog-post.js` — 블로그 삽입
- `update-d10-1-blog-post.js`, `update-d10-blog-browser.html`, `update-d10-blog.sql`, `d10-update.sql` — D-10 포스트 업데이트

### 루트 설정
- `package.json`, `package-lock.json`
- `CNAME`, `sitemap.xml`, `robots.txt`
- `favicon.png`, `favicon.svg`
- `.github/workflows/` — CI

## 📄 문서

- `README.md`
- `BACKEND_HANDOFF.md`
- `PO_SERVICE_REVIEW.md`
- `QA_REPORT.md`
- `UPLOAD_CHECKLIST.md`

---

## ⚠️ 정리가 필요한 항목

1. **루트의 미정리 이미지** — `images/`로 이동 권장
   - `TOSS.png`, `WISE.png`, `Toss_Logo_Button_Type.png`, `wise_logo.png`, `KDU_LOGO_blue.png`
   - `로고.png`, `로고2.png`, `파비콘.png`, `법무부_영_상하.jpg`, `조선대로고.jpg`
   - `스크린샷 2026-01-26 170122.png`

2. **한글/공백 파일명** — URL 인코딩 이슈 방지 위해 영문 kebab-case 권장

3. **중복/구버전 페이지**
   - `visa-thread-general.html` vs `thread-general-v2.html`
   - `service-demo.html` vs `service-apply-general.html`
   - v1 폐기 여부 결정 필요

4. **`js/supabase-diagnostic.html`** — JS 폴더에 HTML 파일 혼입

5. **SQL 이원화** — `sql/`와 `migrations/` 통합 검토

6. **`scripts/` 일회성 파일** — D-10 업데이트 관련 스크립트 archive 이동 검토
