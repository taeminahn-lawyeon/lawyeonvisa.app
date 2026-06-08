# Renewal go-live — build plan

새 디자인(main 톤)으로 전 사이트를 공개하기 위한 작업 계획. 백엔드(Supabase·Edge·Toss)는 그대로 두고 **프론트엔드 재디자인 + 진입점 전환 + 언어 분리**만 진행한다.

## 확정된 결정
- **전체 기능 패리티 후 공개** (마케팅·상담·결제·블로그·예약·어드민까지 새 톤으로).
- **언어별 페이지** 방식(런타임 i18n 키 제거). **EN/KO 2개 언어**. EN=루트, KO=`/ko/`.
- **빌드 스텝 도입**: 공유 `css/site.css` + 파셜(header/footer/head) + 언어별 본문 → 정적 HTML 생성(SEO 안전).
- URL은 확장자 없이(`/main`, `/ko/main` …). GitHub Pages가 `.html` 서빙.

## 빌드 시스템
```
css/site.css                 공유 디자인 시스템(토큰+컴포넌트)
partials/head.html           <head>+<body> 시작 (메타·canonical·hreflang·OG·폰트·CSS)
partials/header.html         공통 헤더(토큰: 브랜드/내비/언어토글/로그인)
partials/footer.en.html      영문 푸터
partials/footer.ko.html      국문 푸터
content/<id>.en.html         페이지별 본문(EN)  ← 같은언어 링크는 bare, 자산은 __BASE__
content/<id>.ko.html         페이지별 본문(KO)
scripts/build-site.js        조립기 (PAGES 레지스트리)
```
빌드: `node scripts/build-site.js` → EN은 `/<id>.html`, KO는 `/ko/<id>.html` 생성.

**규칙**
- 같은 언어 페이지 링크: 확장자/경로 없이 bare (`consultation-request`, `article-preview`, `main#consult`). 각 언어 디렉터리에서 형제로 해석됨.
- 자산(이미지/CSS): `__BASE__` 접두( EN=`""`, KO=`"../"` ).
- 언어 토글·canonical·hreflang: 빌드가 자동 생성.
- ⚠️ `main.html`, `ko/main.html` 등은 **생성물** — 직접 수정 금지, `content/`·`partials/` 수정 후 재빌드.

## 페이지 라우트맵 (EN 루트 / KO `/ko`)
| id | 페이지 | 상태 |
|---|---|---|
| main | 홈(인트로·인사이트·사례·상담) | ✅ 빌드 전환 완료(파일럿) |
| insights | 블로그/인사이트 목록 | 디자인 완료(blog-preview) → 빌드화 + Supabase 동적 |
| article | 아티클 상세 | 디자인 완료(article-preview) → 빌드화 + slug 동적 |
| consultation-request | 상담 신청(쓰레드 생성) | 리톤+언어분리+백엔드 연결 |
| thread | 온라인 상담 쓰레드 | 색치환본(thread-preview) → 실제 thread 반영 |
| booking | 방문 예약 | 디자인 완료(booking-preview) → 예약 백엔드 신규 |
| payment(quote/success/fail) | 결제 | 리톤(Toss 유지) |
| profile(edit/submit) | 프로필·서류 | 리톤 |
| pricing | 가격표 | 리톤 |
| partnership(+success) | 제휴 | 리톤 |
| login(google/admin) | 로그인 | 리톤 |
| legal(privacy/terms/refund) | 약관 | 리톤(공유 가능) |
| account(dashboard) | 로그인 후 내 쓰레드/신청 | 신규(기존 index 대시보드 대체) |
| 404 | 오류 | 리톤 |
| admin-* | 어드민 | 내부 도구, 톤 통일 후순위 |

## 추가 개발(백엔드 연결·신규)
1. **헤더 인증 연동**: 비로그인=Login(Google), 로그인=내 계정/로그아웃 (`checkSession`). 현재 정적.
2. **상담 흐름 연결**: Request Consultation → consultation-request → Google 로그인 → `createThread` → thread.
3. **블로그 동적**: insights 목록=`blog_posts`(언어 필터), article=slug 렌더.
4. **예약 백엔드**: 예약 테이블 + 알림(Edge) + 어드민 뷰 (또는 카카오 링크 임시).
5. **로그인 후 대시보드** 신규.
6. **진입점 전환**: `index.html` → main 리다이렉트(또는 교체), 사이트 전역 확장자 없는 링크, `sitemap.xml`, robots, JSON-LD(LegalService).
7. **결제/프로필/서비스** 페이지 리톤 + 기존 JS(supabase-client, payment-integration) 연결.

## 단계
- **P1 기반(진행 중)**: 빌드시스템 ✅ → 공통 헤더 인증연동 + index→main 전환 + SEO/sitemap.
- **P2 전환 핵심**: consultation-request → thread → payment → profile (EN/KO, 백엔드 연결).
- **P3 콘텐츠**: insights/article 동적, pricing/partnership/legal/404.
- **P4 예약 백엔드 + 대시보드.**
- **P5 어드민 톤 통일 + QA.**
