# 테스트 가이드 (Supabase 연동 포함)

새 빌드 페이지(`main`, `consultation`, EN/KO)를 **로그인·쓰레드 생성까지 실제로** 테스트하는 방법.

핵심: 헤드리스 렌더로는 외형만 검증된다. 로그인/DB는 (1) 클린 URL을 서빙하는 로컬 서버 + (2) Supabase Auth 리다이렉트 허용목록 설정이 있어야 동작한다.

---

## 0. 빌드
콘텐츠/파셜 수정 후에는 항상:
```bash
node scripts/build-site.js   # main.html, ko/main.html, consultation.html, ko/consultation.html, sitemap.xml, robots.txt 생성
```
⚠️ `main.html`·`consultation.html` 등은 **생성물**이다. 수정은 `content/`·`partials/`·`css/site.css`에서 하고 재빌드.

---

## 1. 로컬 서버 (클린 URL 필수)
링크가 확장자 없는 형태(`/consultation`)라, `.html`을 자동 서빙하는 서버가 필요하다. **`serve` 권장**(Python `http.server`는 `/consultation`에서 404 — 사용 금지):
```bash
npx serve -l 3000 .
# http://localhost:3000/main  /ko/main  /consultation  /ko/consultation
```
GitHub Pages는 동일하게 `/consultation → consultation.html`을 서빙하므로 로컬과 동작이 같다.

---

## 2. Supabase Auth 설정 (로그인 리다이렉트)
구글 로그인은 `Supabase 콜백 → 앱 redirectTo`로 돌아온다. 앱 복귀 URL이 **Supabase 허용목록**에 있어야 한다.

Supabase 대시보드 → **Authentication → URL Configuration → Redirect URLs** 에 추가:
```
http://localhost:3000/**
https://www.lawyeonvisa.app/**
```
(스테이징으로 GitHub Pages 도메인을 쓰면 그 도메인 `/**`도 추가)

- **Site URL**: `https://www.lawyeonvisa.app` (그대로).
- Google Cloud OAuth 쪽은 변경 불필요 — 구글은 Supabase 콜백(`https://gqistzsergddnpcvuzba.supabase.co/auth/v1/callback`)만 알고, 앱 복귀는 Supabase 허용목록이 통제한다.
- 코드 패치 완료: 클린 URL 페이지는 로그인 후 **현재 페이지로 복귀**(`js/supabase-client.js`). 기존 `.html` 페이지 동작은 변경 없음.

---

## 3. 테스트 시나리오
브라우저 콘솔(F12)을 열고 진행. 하드 리프레시(Cmd/Ctrl+Shift+R)로 캐시 방지.

1. **홈/언어**: `/main` 로드 → 헤더 EN·한국어 토글로 `/ko/main` 전환. 이미지·캐러셀 정상.
2. **헤더 로그인**: 우상단 **Login** 클릭 → 구글 로그인 → 같은 페이지로 복귀 → 헤더가 **이름 + 로그아웃**으로 바뀜(`site.js`). 로그아웃 클릭 → 다시 Login.
3. **상담 생성(핵심)**: `/consultation`
   - 동의 체크 → 버튼 활성화 → **Request Consultation** 클릭
   - (비로그인) 구글 로그인 → `/consultation` 복귀 → 자동으로 쓰레드 생성 → **쓰레드 화면으로 이동**(`thread-preview.html?id=...`)
   - (로그인 상태) 즉시 쓰레드 생성·이동
4. **쓰레드**: 메시지 작성·파일 업로드 동작. (관리자 답글은 `admin-thread.html`에서.)
5. **언어별 동일 확인**: `/ko/consultation`도 동일 흐름.

---

## 4. Supabase에서 결과 확인
대시보드 → **Table Editor**:
- `profiles`: 로그인 시 최초 1회 생성.
- `threads`: 상담 시 `service_name='무료 사전 상담 (Consultation)'`, `status='document'`, `is_consulting=true` 행 생성.
- `messages`: 환영 메시지 1건.
콘솔/네트워크 탭에서 `createThread`, `createWelcomeMessage` 호출 성공/에러 확인.

---

## 5. 알림(이메일·SNS) — 서버 시크릿 필요
새 쓰레드 시 `send-admin-email`(Resend), 관리자 답글 시 `send-email`/`send-notification`(메신저) Edge Function이 동작한다. 이건 **Supabase Edge Function 시크릿**(예: `RESEND_API_KEY`, 메신저 토큰)이 설정돼야 발송된다.
- 시크릿이 없어도 **쓰레드 생성 자체는 성공**한다(이메일만 미발송, `notification_logs`에 기록).
- 확인: Supabase → Edge Functions → Logs.

---

## 6. 배포 테스트(권장 최종)
OAuth는 실제 https 도메인이 가장 확실하다.
- 현재 작업 브랜치를 GitHub Pages 스테이징(또는 라이브)로 배포 → 위 2번 허용목록에 그 도메인 추가 → `/main`, `/consultation`에서 전체 흐름 점검.
- ⚠️ `index.html → main` 전환(공개 스위치)은 **패리티 완료 후** 마지막에 한다. 지금은 라이브 `index`가 그대로 살아 있다.

---

## 자주 막히는 점
- `/consultation`에서 404 → `npx serve`가 아니라 클린 URL 미지원 서버 사용. `serve`로 재실행.
- 로그인 후 옛 `index`로 튕김 → Supabase Redirect URLs 미설정 또는 `.html`로 직접 접근. 클린 URL(`/consultation`)로 접근.
- 헤더가 로그인 후에도 Login 그대로 → 콘솔에서 `checkSession` 에러 확인(네트워크/허용목록), 하드 리프레시.
- 이미지 안 보임(한국어 페이지) → `/ko/`에서 `../images/` 경로. 빌드 산출물인지 확인.
