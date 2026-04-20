# 법무법인 로연 출입국이민지원센터

> Supabase 기반 정적 웹앱. 외국인 대상 **75개 출입국 민원 대행** + **협약 대학 30% 할인** + **법무법인 관리자 대시보드**.
>
> 본 문서는 **기획자(PM)용 웹 구조·기술 스택 개요**입니다. 개발·배포 상세는 섹션 16의 연관 문서를 참고하세요.

---

## 1. 사업자 정보

**법무법인 로연 (Law Firm Lawyeon)**

| 항목 | 내용 |
|---|---|
| 대표자 | 민준우 |
| 사업자등록번호 | 391-85-03007 |
| 주소 | 서울특별시 강서구 공항대로 164, 503호(마곡동, 류마타Tower) |
| 대표 전화 | 02-2039-0544 |
| 대표 이메일 | taemin.ahn@lawyeon.com |
| 개인정보보호책임자 | 안태민 (taemin.ahn@lawyeon.com) |
| 운영 도메인 | www.lawyeonvisa.app |

---

## 2. 핵심 수치 한눈에

| HTML 페이지 | 출입국 서비스 | 서비스 카테고리 | 지원 언어 | 협약 대학 | Edge Functions |
|---|---|---|---|---|---|
| **31** | **75** | **6** | **7** | **2** (조선대·극동대) | **2** |

> 가격대: ₩22,000 ~ ₩1,400,000 (KRW 고정).
> 상태 아이콘 표기법: ✅ 작동 · ⚠️ 데모 · 🟡 부분 구현 · 🔄 예정.

---

## 3. 기술 스택 요약표

| 구분 | 스택 |
|---|---|
| 프론트엔드 | HTML5 + Vanilla JavaScript (프레임워크 미사용) |
| 스타일 | 자체 CSS (Toss 스타일), Font Awesome 6.4, Google Fonts(Noto Sans KR) |
| 백엔드/DB | **Supabase** (PostgreSQL · Auth · Storage · Realtime · Edge Functions) |
| 인증 | Google OAuth (Supabase Auth) |
| 결제 | Toss Payments Global ⚠️ · PayPal 🔄 · WISE 송금 🟡 |
| 이메일 | Resend 🔄 |
| 다국어 | 자체 i18n 엔진 (7개 언어) |
| 상태 관리 | 클라이언트 `localStorage` + 서버 Supabase DB |
| 호스팅 | GitHub Pages (main 브랜치 자동 배포) |
| CI | GitHub Actions — `validate.yml`, `build-blog.yml` |
| npm 의존성 | `@supabase/supabase-js` **단 1개** (그 외는 모두 CDN 로드) |

---

## 4. 시스템 구성도

```
┌──────────────┐
│   Browser    │  (데스크톱/모바일, 7개 언어)
└──────┬───────┘
       │ HTTPS
       ├───────▶ ┌─────────────────────────────┐
       │         │  GitHub Pages               │
       │         │  www.lawyeonvisa.app        │  정적 HTML/CSS/JS
       │         └─────────────────────────────┘
       │
       └──API──▶ ┌─────────────────────────────┐
                 │  Supabase                   │
                 │  ├─ Auth (Google OAuth)     │
                 │  ├─ PostgreSQL + RLS        │
                 │  ├─ Storage (암호화 파일)   │
                 │  ├─ Realtime (쓰레드 메시지)│
                 │  └─ Edge Functions          │
                 │     ├─ confirm-payment ───▶ Toss Payments Global / PayPal
                 │     └─ send-notification ─▶ Resend (이메일, 예정)
                 └─────────────────────────────┘
```

---

## 5. 전체 페이지 지도 (31개)

### 5-1. 공개 페이지 (9) — 로그인 불필요
| 경로 | 역할 |
|---|---|
| `index.html` | 메인 랜딩 (로그인 전/후 통합) |
| `price-list.html` | 75개 서비스 가격표 |
| `blog.html` / `blog-post.html` | 비자 정보 블로그 목록/상세 |
| `consultation-request.html` | 견적·무료 상담 신청 |
| `terms-of-service.html` | 이용약관 |
| `privacy-policy.html` | 개인정보처리방침 |
| `refund-policy.html` | 환불 규정 |
| `404.html` | 오류 페이지 |

### 5-2. 사용자 페이지 (10) — 로그인 후
| 경로 | 역할 |
|---|---|
| `profile-submit.html` | 최초 프로필 입력 |
| `profile-edit.html` | 프로필 수정 |
| `service-apply-general.html` | 서비스 신청 (2단계: 서비스 선택 → 결제) |
| `thread-general-v2.html` | 신청 건별 쓰레드 (1:1 커뮤니케이션) |
| `visa-thread-general.html` | 비자 전용 쓰레드 |
| `partnership-apply.html` / `partnership-apply-success.html` | 기관 제휴 신청(+완료) |
| `payment-success.html` / `payment-fail.html` | 결제 결과 |
| `payment-wise.html` | WISE 국제송금 대체 결제 |

### 5-3. 협약 대학 전용 (6) — 대문 페이지 + 30% 할인
| 경로 | 역할 |
|---|---|
| `login-chosun.html` / `service-chosun.html` | 조선대 학생 로그인·신청 |
| `login-kdu.html` / `service-kdu.html` | 극동대 학생 로그인·신청 |
| `login-demo.html` / `service-demo.html` | 내부 테스트용 데모 |

### 5-4. 관리자 페이지 (6) — 법무법인 직원
| 경로 | 역할 |
|---|---|
| `admin-login.html` | 관리자 로그인 |
| `admin-dashboard.html` | 전체 쓰레드·고객·통계·결제 대시보드 |
| `admin-thread.html` | 개별 쓰레드 상세 관리 |
| `admin-blog.html` / `admin-insert-blog.html` / `admin-blog-edit.html` | 블로그 관리 |

### 5-5. 담당자 페이지 🔄
- `partner-dashboard.html` — 제휴기관 담당자용 외국인 체류 현황 모니터링 (구현 예정)

---

## 6. 주요 사용자 플로우

**① 일반 사용자**
```
index → Google 로그인 → profile-submit → index
     → service-apply-general (서비스 선택 → 결제)
     → payment-success → thread-general-v2 (진행 확인)
```

**② 협약 대학 학생 (조선대·극동대)**
```
login-chosun / login-kdu → Google 로그인
     → service-chosun / service-kdu (30% 할인 자동 적용)
     → payment-success → thread-general-v2
```

**③ 관리자 (법무법인 직원)**
```
admin-login → admin-dashboard (전체 쓰레드)
     → admin-thread (개별 처리: 상태 변경/문서 요청/결제 관리)
```

---

## 7. 데이터 & 서비스 카테고리

`data/services.json` 기준.

| # | 카테고리 | 서비스 수 | 대표 서비스 |
|---|---|---|---|
| 1 | 교육·구직 | 10 | D-4→D-2 변경, D-10 연장, 시간제취업 허가 |
| 2 | 취업·워크 | 17 | E-7 변경/연장, E-9 근무처 변경, 파견 신고 |
| 3 | 사업·투자 | 12 | D-8 투자비자, D-9 무역경영, 외투기업 등록 |
| 4 | 동포·가족·결혼 | 13 | F-4 거소신고, F-6 결혼이민, 가족 초청 |
| 5 | 거주·영주·국적 | 11 | F-5 영주권, 귀화, 국적회복 |
| 6 | 일반 신고·증명 | 12 | 외국인등록, 체류지 변경, 출입국사실 증명서 |
|   | **합계** | **75** | 가격대 ₩22,000 ~ ₩1,400,000 |

---

## 8. 쓰레드 상태머신

신청 건별로 **쓰레드** 1개가 생성되고, 센터 담당자와 1:1로 문서·진행을 주고받습니다.

```
  payment  ─▶  document  ─▶  processing  ─▶  completed  ─▶  archived
  (결제완료)   (서류수집)     (신청진행)      (처리완료)     (보관)
```

- 결제 완료 시 **자동 생성** (서류 사전 업로드 불필요)
- 처리 완료 시 **아카이빙** 처리 후 문서 다운로드 가능
- 확인 위치: `index.html` → "나의 신청 내역"

---

## 9. 협약 기관 할인 정책

- **30% 할인** 자동 적용, 천원 단위 반올림
- Google 로그인만 사용 (학교 이메일 불필요), 학번·사번으로 소속 인증
- 할인 예시:

| 서비스 | 정상가 | 할인가 | + 정부 수수료 |
|---|---|---|---|
| 비자 발급/변경/부여 | ₩880,000 | ₩616,000 | 별도 |
| 비자 연장 | ₩550,000 | ₩385,000 | + ₩50,000 |
| 귀화 신청 | ₩1,100,000 | ₩770,000 | + ₩300,000 |

---

## 10. 다국어 지원 (7개 언어)

| 언어 | 코드 | 비고 |
|---|---|---|
| English | `en` | **기본값** (사용자 선택 전까지) |
| 한국어 | `ko` | 폴백 언어 |
| 中文 (간체) | `zh` | |
| Tiếng Việt | `vi` | |
| 日本語 | `ja` | |
| Монгол | `mn` | |
| ไทย | `th` | |

- 구현: `js/i18n.js` + `js/translations.js` (638KB, 모든 UI 텍스트 포함)
- HTML 요소에 `data-i18n="key"` 속성 부여 → 런타임 치환
- 사용자 선택은 `localStorage`에 저장

---

## 11. 외부 연동 현황

| 서비스 | 용도 | 상태 | 비고 |
|---|---|---|---|
| Supabase Auth | Google OAuth 로그인 | ✅ | - |
| Supabase DB | 프로필·쓰레드·결제 저장 | ✅ | RLS 활성 |
| Supabase Storage | 문서 업·다운로드 | ✅ | 클라이언트 암호화 후 업로드 |
| Supabase Realtime | 쓰레드 실시간 메시지 | ✅ | - |
| Toss Payments Global | 국제 결제 | ⚠️ 데모 | 실결제 연동 진행 예정 |
| PayPal | 결제 대체 | 🔄 예정 | - |
| WISE | 송금 결제 | 🟡 부분 | `payment-wise.html` 옵션 제공 |
| Resend | 트랜잭션 이메일 | 🔄 예정 | `send-notification` Edge Function에서 호출 예정 |

---

## 12. 디렉터리 구조 (핵심)

```
lawyeonvisa.app/
├── *.html                  # 31개 페이지 (루트 배치, GitHub Pages 라우팅)
├── css/                    # 스타일시트 5개
├── js/                     # 11개 JS 모듈 (supabase-client, i18n, payment 등)
├── data/services.json      # 75개 서비스 마스터 데이터 (단일 진실 공급원)
├── blog/                   # 정적 블로그 HTML (자동 생성)
├── sql/                    # Supabase 스키마·RLS·보안 정책 SQL
├── supabase/functions/     # Edge Functions (confirm-payment, send-notification)
├── scripts/                # 블로그 빌드·HTML 검증 Node 스크립트
├── migrations/             # DB 마이그레이션 SQL
├── images/                 # 이미지 자산
├── .github/workflows/      # GitHub Actions (validate, build-blog)
├── CNAME                   # → www.lawyeonvisa.app
├── package.json            # 의존성 1개 (@supabase/supabase-js)
└── README.md               # 본 문서
```

---

## 13. 배포 & CI

| 항목 | 내용 |
|---|---|
| 호스팅 | GitHub Pages |
| 도메인 | `www.lawyeonvisa.app` (CNAME) |
| 배포 트리거 | `main` 브랜치 푸시 시 자동 |
| CI 워크플로우 | `validate.yml` (HTML/JS 문법 검증) · `build-blog.yml` (블로그 자동 빌드) |
| 주요 npm 스크립트 | `npm test`, `npm run validate`, `npm run build:blog` |

---

## 14. 보안 & 법적 문서

### 14-1. 보안 조치
- **Google OAuth 2.0** (Supabase Auth)
- **Row Level Security (RLS)** — DB 수준 접근 제어 (`customer` / `partner_admin` / `super_admin` 역할)
- **AES-256-GCM 클라이언트 측 암호화** — 여권·외국인등록증 등 민감 문서
- **TLS 1.3 / HTTPS** — 모든 통신
- **접근 로그 3년 보관** — 문서 업로드·다운로드·삭제 이력 추적
- 관련 파일: `js/secure-file-handler.js`, `sql/PRODUCTION_SETUP_COMPLETE.sql`, `sql/SECURITY_ENHANCEMENT.sql`

### 14-2. 규정 준수
- 개인정보보호법 제24조(고유식별정보)·제29조(안전조치)
- 전자문서 및 전자거래 기본법 제9조
- 정보통신망법 제28조

### 14-3. 법적 필수 페이지
| 페이지 | 내용 |
|---|---|
| `terms-of-service.html` | 이용 계약, 착수 전 100% / 진행 중 50% / 완료 후 불가 환불 규정, 분쟁 관할 |
| `privacy-policy.html` | 수집 항목·목적, 제3자 제공, 5년 보관, 정보주체 권리 |
| `refund-policy.html` | 환불 규정 상세 |

---

## 15. 기획자용 미니 용어집

| 용어 | 한 줄 설명 |
|---|---|
| **Supabase** | 오픈소스 백엔드 플랫폼. DB + 인증 + 파일저장 + 서버리스 함수를 한 번에 제공. |
| **RLS (Row Level Security)** | DB가 사용자 역할별로 "어떤 행을 볼 수 있는지" 제어하는 기능. 관리자/사용자/담당자 권한 분리에 사용. |
| **OAuth** | 비밀번호 대신 Google 등 외부 계정으로 로그인하는 표준 방식. |
| **Edge Function** | Supabase가 제공하는 서버리스 함수. 결제 승인·이메일 발송처럼 서버 검증이 필요한 로직을 담당. |
| **i18n** | 다국어 지원(Internationalization)의 줄임. 여기서는 자체 구현한 번역 엔진. |
| **CDN** | 전 세계 서버에서 파일을 빠르게 배포하는 네트워크. Font Awesome·Supabase SDK 로드에 사용. |
| **CNAME** | 도메인(`www.lawyeonvisa.app`)을 GitHub Pages에 연결하는 설정 파일. |
| **쓰레드** | 신청 1건당 생성되는 대화방. 결제부터 서류 수집·처리·완료까지 한 쓰레드에서 진행. |
| **사전진단** | 협약 기관 소속 외국인을 대상으로 연 2회 실시하는 불법체류 예방 점검. |

---

## 16. 연관 문서

| 문서 | 독자 | 내용 |
|---|---|---|
| `BACKEND_HANDOFF.md` | 개발자 | 백엔드 연동·API·환경 변수 상세 |
| `PO_SERVICE_REVIEW.md` | 기획/PO | 사업 요구사항 리뷰·의사결정 기록 |
| `QA_REPORT.md` | QA | 품질 보증 리포트 |
| `UPLOAD_CHECKLIST.md` | 배포 담당 | 배포 전 체크리스트 |

---

_마지막 업데이트: 2026-04-20 · 관리: 안태민 (taemin.ahn@lawyeon.com)_
