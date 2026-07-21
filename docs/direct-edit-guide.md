# 직접 수정 가이드 — 작은 수정은 GitHub 웹에서 바로

인사이트 글·소식·홈 문구의 **오타·단어·문장 수준의 작은 수정**을 코드 작업 없이
GitHub 웹사이트에서 직접 하는 방법입니다. 파일을 고쳐 main에 커밋하면
자동 빌드(Actions의 "Build Site (SSG)")가 돌아 1~3분 안에 사이트에 반영됩니다.

## 1) 어떤 글이 어떤 파일인가

모든 원본은 `content/` 폴더에 있습니다. **`content/` 파일만 수정하세요.**
(루트나 `ko/` 폴더의 같은 이름 HTML은 자동 생성물이라 직접 고쳐도 다음 빌드 때 덮어써집니다.)

| 화면 | 한국어 파일 | 영어 파일 |
|---|---|---|
| 인사이트 글 본문 | `content/<글주소>.ko.html` | `content/<글주소>.en.html` |
| 인사이트 목록 페이지 | `content/insights.ko.html` | `content/insights.en.html` |
| 홈(첫 화면·목록·소개) | `content/home.ko.html` | `content/home.en.html` |
| 소식 — 조선대 MOU | `content/chosun-university-student-legal-mou-2026.ko.html` | 같은 이름 `.en.html` |
| 소식 — 극동대 MOU | `content/far-east-university-student-job-fair-mou-2026.ko.html` | 같은 이름 `.en.html` |
| 상담/예약/기업자문 등 | `content/consultation.ko.html`, `content/booking.ko.html`, `content/corporate-advisory.ko.html` … | 같은 이름 `.en.html` |

`<글주소>`는 브라우저 주소창의 마지막 부분입니다.
예: `lawyeonvisa.app/ko/foreigner-dui-deportation-korea-2026` → `content/foreigner-dui-deportation-korea-2026.ko.html`

## 2) 수정 절차 (3단계)

1. `github.com/taeminahn-lawyeon/lawyeonvisa.app` 접속 → `content` 폴더 → 파일 클릭
2. 오른쪽 위 **연필 아이콘(Edit this file)** → 본문 텍스트 수정
3. **Commit changes...** → "Commit directly to the `main` branch" 선택 → **Commit changes**

이후 자동으로 빌드·배포됩니다. 반영 확인은 1~3분 뒤 해당 페이지에서
**강력 새로고침**(Windows: Ctrl+Shift+R / Mac: Cmd+Shift+R).

## 3) 지킬 것 (중요)

- **글자만 고치세요.** `<p>`, `<b>`, `<div ...>` 같은 꺾쇠 태그는 지우거나 옮기지 않습니다.
- `__BASE__`로 시작하는 경로(`__BASE__images/...`)는 그대로 둡니다.
- FAQ는 `<div class="qa">…` 구조를 유지해야 검색 노출(FAQ 스키마)이 살아 있습니다.
- 금지 표현: 발행일 표기 / "무료 상담·free consultation" / 응답 시간 보장(24시간 등) /
  변호사·전문가가 "답변한다"는 표현(주체는 항상 "로연 / Law Firm Lawyeon") / 본문 조문번호("제○조").
- 한국어를 고쳤으면 **영어 파일도 같은 내용인지** 확인하세요(별도 파일입니다).

## 4) 새 글을 처음부터 쓸 때

작은 수정이 아니라 **새 인사이트 글을 통째로** 쓸 때는 `/blog-editor.html`
(관리자 대시보드의 **새 글 작성** 탭)을 씁니다. 프로토콜 형식으로 작성하면
완성 HTML과 등록 정보가 나오고, 그걸 Claude Code에 전달하면 저장·빌드·배포까지
처리됩니다. 자세한 사용법은 `docs/blog-editor-guide.md` 참고.

## 5) 이런 건 직접 하지 말고 맡기기

기존 글의 문단 재작성, 이미지 교체, 목차·소제목 변경, 표 수정, 메타(title/설명) 변경은
파일 여러 곳과 빌드 설정을 함께 건드려야 하므로 Claude 세션(또는 개발 작업)으로 요청하세요.

## 5) 문제가 생겼을 때

- **반영이 안 됨** → 저장소 상단 **Actions** 탭에서 "Build Site (SSG)"가 초록 체크인지 확인.
  실패(빨간 X)면 대개 태그가 깨진 것 — 아래 방법으로 되돌리세요.
- **되돌리기** → 수정한 파일 화면에서 **History** → 직전 커밋 클릭 → 우측 상단 `...` → **Revert** 
  (또는 Claude 세션에 "방금 커밋 되돌려줘"라고 요청).
