# archive/ — 보관용 (삭제 아님)

2026-07 사이트 단순화 작업으로 운영에서 내려온 페이지·스크립트·데이터를 원본 그대로 보관합니다.
**지우지 마세요.** 기록 보존 및 필요 시 복원을 위해 남겨 둔 파일들입니다.

## 왜 내렸는가

상담 쓰레드(개설 → 대화 → 서류 → 결제)와 회원 로그인 기반 "플랫폼" 구조를,
**온라인 사전상담(이메일) + 방문 상담 예약** 두 채널로 단순화했습니다.

- 온라인 상담은 `/consultation` 폼 접수 → 담당 변호사 메일로 발송 → `admin-dashboard` 에서 확인
- 방문 상담은 기존 `/booking` 유지
- 고객 로그인(Google OAuth) 제거. **관리자 로그인은 유지** (Supabase RLS가 이에 의존)

## 무엇을 내렸는가

| 디렉터리 | 내용 |
|---|---|
| `pages/` | 쓰레드·서비스신청·결제·프로필·마이페이지·구 가격표 등 운영 페이지 |
| `content/` | 빌드 소스 조각 (`mypage`, `visa-info`) — `scripts/build-site.js` PAGES 에서도 제거됨 |
| `js/` | `service-pricing.js`, `payment-integration.js`, `chat-widget.js` |
| `data/` | `services.json` (75개 서비스 상세 요금 데이터) |
| `mocks/` | 참조 0건의 디자인 목업·테스트 파일 |
| `chat-widget.css` | 채팅 위젯 스타일 |

주요 파일:

- `pages/visa-thread-general.html` — 구 버전 상담 쓰레드 (이미 미사용이었음)
- `pages/service-apply-general.html` — 서비스 신청·결제 진입 플로우
- `pages/consultation-request.html`, `pages/urgent-consultation-request.html`, `pages/business-immigration-request.html` — 구 상담 접수 폼들
- `pages/mypage.html`, `pages/ko-mypage.html`, `pages/visa-info.html`, `pages/ko-visa-info.html` — 마이페이지·비자정보
- `pages/profile-edit.html` — 프로필 수정
- `pages/payment-quote.html`, `pages/payment-wise.html` — 참조가 없던 결제 화면
- `pages/price-list.html` — 구 가격표 (75행, 출입국 수수료 포함). 새 가격표는 `content/price-list.{en,ko}.html`

## 운영에서 살아 있는 것

**기존 상담 쓰레드는 그대로 유지합니다.** 신규 접수만 사전상담 폼으로 바뀌었을 뿐,
이미 열려 있는 쓰레드는 고객·관리자 양쪽에서 계속 사용할 수 있어야 하므로 다음 페이지는 아카이브하지 않았습니다.

- `thread-general-v2.html` — 고객용 상담 쓰레드. 헤더에 진입 링크는 없지만, 고객이 알림 메일로 받은 쓰레드 URL 로 접근하면 그대로 동작합니다(페이지 자체가 Google 로그인을 유도)
- `profile-submit.html` — 관리자가 쓰레드로 보내는 서류 제출 링크
- `payment-success.html`, `payment-fail.html` — 결제 콜백 대상. 진행 중인 결제가 있을 수 있어 남겨 둡니다
- `admin-login.html`, `admin-dashboard.html`, `admin-thread.html` — 관리자
- `booking`, `corporate-advisory`, `consultation` — 비로그인 폼 3종
- `login-chosun/feu/demo.html`, `service-chosun/feu/demo.html`, `index.html` — 대학 제휴 플로우. 현행 유지하기로 했습니다. 이 플로우는 로그인을 전제로 하므로, 운영을 종료한다면 함께 아카이브하고 `index.html` 의 OAuth 콜백 예외 처리도 정리해야 합니다

### 남아 있는 끊긴 링크 (의도된 것)

- `thread-general-v2.html` 의 "결제하기" → `service-apply-general.html`
- `payment-fail.html` 의 "다시 시도" → `service-apply-general.html`

신규 결제 진입점을 없애기로 했으므로 두 링크는 404 가 됩니다. 진행 중인 건의 비용 청구는
사전상담 회신 메일이나 방문 상담에서 별도로 안내해 주세요.

## 데이터는 지우지 않았습니다

Supabase의 `auth.users`, `profiles`, `threads`, `messages`, `payments`, `quotes` 는 **그대로 보존**되어 있습니다.
로그인 UI만 걷어냈을 뿐이며, 기존 회원의 재로그인은 지원하지 않습니다.

## 주의사항

- 이 디렉터리도 GitHub Pages 가 그대로 서빙합니다. 검색 색인 방지를 위해 `robots.txt` 에 `Disallow: /archive/` 를 넣어 두었습니다
- 아카이브된 HTML 안의 상대경로(`js/...`, `css/...`)는 이동으로 인해 깨져 있습니다. 브라우저에서 그대로 열면 스타일·스크립트가 로드되지 않습니다. 복원하려면 원위치로 되돌리세요
- `pages/service-apply-general.html` 은 `data/services.json` 과 id 정합성 검증을 받고 있었으나(`scripts/validate-syntax.js`), 두 파일이 함께 내려오면서 해당 검증도 제거했습니다
