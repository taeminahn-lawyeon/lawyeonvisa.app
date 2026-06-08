# HANDOFF — Lawyeon 사이트 리뉴얼 (다른 에이전트용 인수인계)

법무법인 로연 출입국이민지원센터 사이트(GitHub Pages 정적 + Supabase 백엔드)를 **새 디자인 톤 + 언어별 페이지(EN/KO) + 빌드 시스템**으로 전환하는 작업의 현재 상태와 남은 일. 함께 볼 문서: `docs/RENEWAL_BUILD_PLAN.md`(아키텍처/라우트맵), `docs/TESTING.md`(로그인·결제 포함 테스트).

작업 브랜치: `claude/keen-pasteur-pV9X9`.

---

## 1. 목표 · 확정된 결정 (변경 금지 전제)
- 새 디자인 **톤**: 베이지/브라운, 액센트 `#887668`, 폰트 **Manrope(라틴) + IBM Plex Sans KR(한글)**, 각진 도형(라운드 작게), **명조 사용 안 함**, 띠지/박스형 콜아웃·의미없는 장식·전형적 AI 패턴 금지.
- **전체 기능 패리티 후 공개** (마케팅+상담+결제+프로필+블로그+예약+어드민 모두 새 톤).
- **언어별 페이지**: 런타임 i18n 키 방식 대신 **EN=루트, KO=`/ko/`**. 현재는 **EN/KO 2개 언어만**.
- **빌드 스텝 도입**(공유 CSS + 파셜 → 정적 HTML, SEO 안전).
- URL은 **확장자 없이**(`/main`, `/ko/main`, `/consultation`). GitHub Pages가 `.html`을 서빙.
- 진입점 전환(`index.html` → `main`)은 **패리티 완료 후 맨 마지막**. 그 전까지 라이브 `index`는 유지.
- 백엔드(Supabase/Edge/Toss)는 **재구축 금지**, 그대로 재사용.

---

## 2. 백엔드 (그대로 사용, 손대지 말 것)
- Supabase 프로젝트: `https://gqistzsergddnpcvuzba.supabase.co` (URL/anon key는 `js/supabase-client.js`에 하드코딩).
- 인증: **Google OAuth만**. 전역 함수: `signInWithGoogle()`, `checkSession()`, `signOut()`, `getCurrentUser()` (supabase-client.js, classic script라 전역).
- 핵심 테이블: `profiles, threads, messages, payments, applications, admins, quotes, notification_logs, payment_logs`.
- 핵심 함수(supabase-client.js, 42개): `createThread`, `getThreadMessages`, `createMessage`, `createWelcomeMessage`, `getUserProfile`, `createOrUpdateProfile`, `createQuote/markQuotePaid`, `uploadThreadDocument` 등.
- Edge Functions(`supabase/functions/`): `confirm-payment`(Toss 확정·서버측 thread 생성), `send-email`(고객 알림 Resend), `send-admin-email`(관리자 알림), `send-notification`(WhatsApp/Telegram/LINE/Zalo/WeChat). 이메일/SNS는 Edge 시크릿 필요(없어도 thread 생성은 성공).
- 결제: Toss(`js/payment-integration.js` `requestTossPayment` → success/fail → `confirm-payment`). Wise는 수동 안내.
- 서비스 카탈로그 데이터: `data/services.json`.

---

## 3. 프런트엔드 아키텍처 (빌드 시스템)
```
css/site.css            공유 디자인 시스템(토큰+컴포넌트). 모든 새 페이지가 링크.
js/site.js              인증 인식 헤더(Login↔내계정/로그아웃, Google 로그인). 안전 degrade.
partials/head.html      <head>+<body>시작 (메타·canonical·hreflang·OG·폰트·CSS). 토큰 사용.
partials/header.html    공통 헤더(토큰: 브랜드/내비/언어토글/로그인).
partials/footer.en.html / footer.ko.html   언어별 푸터(법적 정보).
content/<id>.en.html, content/<id>.ko.html  페이지별 본문(언어별).
scripts/build-site.js   조립기 — PAGES 레지스트리 순회 → 정적 HTML 생성.
```
- 빌드: **`node scripts/build-site.js`** → EN은 `/<id>.html`, KO는 `/ko/<id>.html`, 그리고 `sitemap.xml`+`robots.txt` 생성.
- 페이지 추가법: `scripts/build-site.js`의 `PAGES` 배열에 `{id, content, title{en,ko}, desc{en,ko}}` 추가 + `content/<content>.en.html`, `content/<content>.ko.html` 작성 → 빌드.
- 토큰: `__TITLE__ __DESC__ __LANG__ __BASE__ __CANONICAL__ __ALT_EN__ __ALT_KO__ __BRAND_NAME__ __BRAND_SUB__ __NAV_* __LOGIN__ __LANGTOGGLE__`. 빌드가 치환.
- **링크 규칙(중요)**: 같은 언어 페이지 링크는 **확장자 없이 bare**(`consultation`, `article`, `main#consult`) — 각 언어 디렉터리에서 형제로 해석. 자산(이미지/CSS/JS)·루트 공유 페이지(약관 등)는 **`__BASE__` 접두**(EN=`""`, KO=`"../"`). 언어 토글/canonical/hreflang은 빌드 자동.
- 빌드가 주입하는 스크립트: `@supabase/supabase-js`, `js/supabase-client.js`, `js/site.js`.

### OAuth 리다이렉트 패치(필수, 적용됨)
`js/supabase-client.js`의 `signInWithGoogle()`은 화이트리스트 외 페이지를 `/index.html`로 보냈음 → **확장자 없는(클린 URL) 페이지는 현재 페이지로 복귀**하도록 패치함. 기존 `.html` 페이지 동작은 불변.

---

## 4. 컨벤션 · 주의점 (gotchas)
- ⚠️ **`main.html`, `ko/main.html`, `consultation.html`, `ko/consultation.html`, `sitemap.xml`, `robots.txt`는 빌드 생성물**. 직접 수정 금지 — `content/`·`partials/`·`css/site.css` 수정 후 재빌드.
- ⚠️ **`sitemap.xml`은 PR 충돌 단골**(생성물). 충돌 시 `node scripts/build-site.js` 재생성 후 커밋.
- **기능 앱 페이지 리톤 방식**: 구/신 흐름이 공유하므로 **중복 없이 in-place로 색·폰트·도형만 sed 치환**(로직 무변경). 빨강/초록 등 **의미색은 보존**.
  - 표준 리톤 치환: `#3182F6→#887668`, `#2563EB/#1B64DA→#6F6053`, `#1E40AF→#4A3C2B`, 라이트블루 틴트(`#EBF4FF`,`#EFF6FF`,`#DBEAFE`,`#BFDBFE`)→베이지(`#F4F2EE`/`#F0EBE1`/`#E3DBCC`), 페이지배경(`#f5f7fa/#F8F9FA/#F8FAFC`)→`#F7F6F3`, 다크네이비 헤더그라데이션(`#000000 0%,#1a1a2e 100%`)→`#241F18 0%,#332920 100%`, 퍼플(`#667EEA→#887668`,`#764BA2→#6F6053`), rgba `49,130,246→136,118,104`, 폰트 `'Noto Sans KR'/'Inter'→'Manrope','IBM Plex Sans KR'`(구글폰트 link도 교체), `border-radius:16/12/10px→4/4/3px`.
- 헤드리스 렌더 검증: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox --disable-gpu --force-device-scale-factor=1 --user-data-dir=/tmp/uXXX --window-size=W,H --virtual-time-budget=5000 --screenshot=/tmp/x.png "file://$PWD/<page>"` (★ `pkill -f chrome`는 자기 셸을 죽이니 쓰지 말 것. 매번 다른 `--user-data-dir`).
- 로그인/결제/쓰레드 실동작은 헤드리스로 불가(Supabase 세션 필요) → `docs/TESTING.md` 절차로 실계정/스테이징 점검.

---

## 5. 현재 상태 (페이지별)
| 영역 | 페이지 | 상태 |
|---|---|---|
| 홈 | `main` / `ko/main` | ✅ 빌드(새 디자인, EN/KO) |
| 상담 신청 | `consultation` / `ko/consultation` | ✅ 빌드 + 백엔드 연결(로그인→createThread→thread 이동) |
| 온라인 쓰레드 | `thread-general-v2.html` | ✅ in-place 리톤(구/신 공용) |
| 결제 | `payment-quote/success/fail/wise.html` | ✅ in-place 리톤(Toss 유지) |
| 프로필 | `profile-edit/submit.html` | ✅ in-place 리톤 |
| 블로그 목록 | `blog-preview.html` | 🎨 새 디자인 완료(시안) — 빌드 편입 + Supabase 동적 필요 |
| 아티클 | `article-preview.html` | 🎨 새 디자인 완료(ep1 정적) — 빌드 편입 + slug 동적 필요 |
| 예약 | `booking-preview.html` | 🎨 새 디자인 완료 — **백엔드(저장/알림/어드민) 신규** 또는 카카오 링크 |
| 서비스 신청 | `service-apply-general.html` | ⬜ 레거시(blue 33) — 리톤 필요 |
| 사업이민 신청 | `business-immigration-request.html` | ⬜ 레거시 — 리톤 필요 |
| 긴급상담 | `urgent-consultation-request.html` | ⬜ 레거시 팔레트 확인 후 리톤 |
| 제휴 | `partnership-apply(.html)/-success` | ⬜ 리톤 필요 |
| 로그인 | `login-chosun/feu/demo.html`, `admin-login.html` | ⬜ 리톤 필요(대학 OAuth 흐름 유지) |
| 가격표 | `price-list.html` | ⬜ 리톤(또는 빌드 편입) |
| 블로그(동적) | `blog.html`, `blog-post.html` | ⬜ 디자인은 preview로 완료 → 동적 데이터 연결 |
| 약관 | `privacy-policy/terms-of-service/refund-policy.html` | ⬜ 리톤 또는 빌드 편입(언어 공유 가능) |
| 대학 서비스 | `service-chosun/feu/demo.html` | ⬜ 리톤 필요 |
| 어드민 | `admin-dashboard/thread/blog/blog-edit/insert-blog.html` | ⬜ 내부 도구, **후순위** |
| 오류 | `404.html` | ⬜ 리톤 필요 |
| 구 진입점 | `index.html` | ⬜ 패리티 후 `main`으로 전환(리다이렉트/교체) |
| 정리 대상 | `test_hook_*.html`, `preview_ep1_en.html`, `visa-thread-general.html`, `consultation-request.html`(구) | 🗑 마이그레이션 후 제거 검토 |

(※ `#3182F6` 카운트 0이어도 레거시 디자인일 수 있음 — 위 표는 실제 작업 이력 기준.)

---

## 6. 사용자 전환 흐름 (목표)
```
방문 → / (main, EN) ⇄ /ko/main (KO)        ← 헤더 언어 토글
  ├ Insights(블로그) → article(글)
  ├ Cases & News
  └ Request Consultation → consultation
        ├ 온라인: Google 로그인 → createThread → thread-general-v2.html?id=…
        └ 방문: booking (예약)
  로그인 사용자 → (대시보드) → 결제 quote→Toss→success → 진행
  관리자 → admin-* (내부)
```

---

## 7. 남은 작업 (단계별, 파일 포인터)
**P2 잔여 — 기능 페이지 in-place 리톤** (4장 "표준 리톤 치환" 그대로 적용 후 blue=0 확인, 의미색 보존):
- `service-apply-general.html`, `business-immigration-request.html`, `urgent-consultation-request.html`, `partnership-apply.html`(+success), `login-chosun/feu/demo.html`, `admin-login.html`, `price-list.html`, `404.html`, `service-chosun/feu/demo.html`.
- 리톤 후 각 페이지의 **다음 단계 링크**가 새 흐름과 맞는지 확인(예: 결제/쓰레드 이동 대상).

**P3 — 마케팅 콘텐츠 빌드 편입(EN/KO)**:
- `insights`(목록), `article`(상세)를 `content/` + `PAGES`로 편입. 그 후 **Supabase `blog_posts` 동적 바인딩**(목록=언어 필터, 글=slug). 디자인은 `blog-preview.html`/`article-preview.html` 참고.
- `privacy/terms/refund/pricing`도 빌드 편입(또는 in-place 리톤). 약관은 언어 공유 가능.
- main/consultation의 `article-preview`/`blog-preview` 링크를 `article`/`insights`로 교체.

**P4 — 신규 개발**:
- **예약 백엔드**: `reservations` 테이블 + 알림 Edge + 어드민 뷰. 또는 임시로 카카오 예약 링크. (`booking-preview.html` 폼/캘린더 재사용)
- **로그인 후 대시보드**: 기존 `index.html`의 내 쓰레드/신청/체류현황을 새 톤 페이지로(예: `account`). 빌드 편입.
- 헤더의 로그인 상태(`js/site.js`)에서 계정 메뉴 목적지 연결.

**P5 — 마무리/공개**:
- 어드민 톤 통일(내부), `index.html → main` 전환(리다이렉트 또는 교체), `sitemap.xml` 전 페이지 확장, JSON-LD(LegalService), 실계정·결제 QA(`docs/TESTING.md`), 모바일/접근성 점검.
- 정리: test/구 파일 제거.

---

## 8. 빌드 · 테스트
- 빌드: `node scripts/build-site.js`
- 로컬(클린 URL 필수): `npx serve -l 3000 .` → `http://localhost:3000/main` 등 (Python http.server는 클린 URL 미지원, 금지).
- Supabase Auth → URL Configuration → Redirect URLs에 `http://localhost:3000/**`, `https://www.lawyeonvisa.app/**`(+스테이징) 등록.
- 상세 시나리오/DB 확인/알림: `docs/TESTING.md`.

## 9. 핵심 참조
- 디자인 토큰/컴포넌트: `css/site.css`
- 빌드 레지스트리/로직: `scripts/build-site.js`
- 백엔드 API: `js/supabase-client.js` (전역 함수), `supabase/functions/*`
- 결제: `js/payment-integration.js`
- 계획/라우트맵: `docs/RENEWAL_BUILD_PLAN.md`
- 테스트: `docs/TESTING.md`
