# 블로그 상세 페이지 · 구현 핸드오프 (v4 · 검정 감소 · 네이비 안 C)

법무법인 로연 출입국이민지원센터 블로그의 **상세 페이지** 디자인 최종안을 실제 코드베이스로 옮기기 위한 개발자용 명세입니다. 디자인 참조 파일과 토큰·컴포넌트·인터랙션 명세가 이 폴더 안에 모두 들어있습니다.

## 0. 이 폴더에 들어있는 파일

```
design_handoff_blog_detail/
├─ README.md                               ← 이 문서
└─ preview/
   ├─ 블로그 상세 v4 - 검정 감소.html        ← 브라우저로 열면 바로 보이는 참조 디자인
   ├─ design_c.jsx                         ← 페이지 전체 React 구조 (마크업)
   ├─ design_c_navy_v4.css                 ← 모든 스타일
   └─ content.js                           ← 데모 콘텐츠 (실제 구현 시 CMS/API로 대체)
```

**참조 디자인 확인**: `preview/블로그 상세 v4 - 검정 감소.html` 을 브라우저로 열면 데스크톱(1280px) + 모바일(390px) 뷰가 나란히 렌더링됩니다. 외부 의존성은 Google Fonts + React/Babel CDN 뿐이라 온라인 상태면 바로 뜹니다.

---

## 1. 디자인 콘셉트

**구조주의 문서 · 법무 브리프 느낌**
- 잉크 블랙 본문, 딥 네이비(`#0f2552`) 엑센트, 페이퍼 베이지 배경, 노란 하이라이트(`#f5c518`)
- 제목/본문 = sans (Noto Sans KR 800)
- 라벨/코드/ASCII 구분자 = mono (IBM Plex Mono)
- 대형 숫자 + 단계 숫자 = **Manrope 700/800 tabular** (한 가지 수치 보이스로 통일)
- 섹션 간 경계는 **1px 또는 2px 네이비 룰**, 대시/해시 ASCII 구분자로 "문서" 느낌 강화
- **검정 solid 블록은 페이지 상하 프레임 2곳에만 유지**: `TopBar`(상단), `Closing NEXT ACTIONS`(하단) — "문서의 시작과 끝" 역할. 중간 블록은 모두 네이비 또는 종이톤으로 해결.
- 그라데이션 **금지** (본 디자인은 강의안 표지 전용 그라데이션과 분리됨)

---

## 2. 디자인 토큰

```css
/* 색상 */
--c-bg:          #ededea;   /* 페이지 외곽 배경 (차분한 그레이 베이지) */
--c-paper:       #f5f5f2;   /* 아티클/카드 배경 */
--c-ink:         #0a0a0a;   /* 기본 텍스트 */
--c-ink-2:       #2b2b2b;   /* 본문 */
--c-ink-3:       #6b6b6b;   /* 라벨·부가 텍스트 */
--c-rule-2:      #c9c9c5;   /* 얇은 점선/실선 룰 */
--c-accent:      #0f2552;   /* 브랜드 딥 네이비 — 테두리·포인트 */
--c-accent-soft: #e6eaf2;   /* 네이비 hover 배경 */
--c-yellow:      #f5c518;   /* 하이라이트 (본문 bold + 날짜 뱃지) */

/* 폰트 */
--font-sans:  "Noto Sans KR", -apple-system, sans-serif;
--font-serif: "Noto Serif KR", serif;     /* (현재 미사용, 본문 인용문 확장 시 사용 가능) */
--font-mono:  "IBM Plex Mono", "Courier New", monospace;
--font-num:   "Manrope", "Noto Sans KR", sans-serif;
              /* font-feature-settings: "tnum" 1, "lnum" 1;  (tabular/lining figures) */

/* Google Fonts 임포트 */
Noto+Sans+KR:400,500,600,700,800
Noto+Serif+KR:400,500,600,700
Manrope:500,600,700,800
IBM+Plex+Mono:400,500,600
```

### 타이포 스케일 (데스크톱 / 모바일)

| 역할 | 폰트 | 크기 · 굵기 |
|---|---|---|
| **대형 에피소드 넘버** (예: `04`) | Manrope 800 | 108px / 64px, letter-spacing -0.055em, line-height 0.82 |
| 페이지 제목 H1 | Noto Sans KR 800 | 38px / 24px, line-height 1.3, letter-spacing -0.025em, text-wrap: balance |
| 섹션 H2 | Noto Sans KR 800 | 28px / 22px, line-height 1.35, text-wrap: balance |
| 단계 H3 / 실수 H3 / FAQ Q | Noto Sans KR 700 | 18px / 15.5px |
| Mid CTA 타이틀 | Noto Sans KR 800 | 22px |
| 본문 P | Noto Sans KR 400 | 15px, line-height 1.8, color: `--c-ink-2`, text-wrap: pretty |
| Step 넘버 박스 | Manrope 700 tabular | 26px (모바일 24px), letter-spacing -0.01em |
| 라벨 · 뱃지 · ASCII · 코드 | IBM Plex Mono | 10~13px, letter-spacing 0.08–0.18em, uppercase 권장 |

### 한글 줄바꿈 — 전역 필수
한글이 음절 단위로 끊어지는 현상(`시작하기까\n지`)을 방지하기 위해 **페이지 루트와 모든 자손**에 아래 속성을 적용합니다. 이 규칙이 빠지면 전체 레이아웃이 어색해집니다.

```css
.designC, .designC *, .designC *::before, .designC *::after {
  word-break: keep-all;
  overflow-wrap: break-word;
}
```
또한 제목·H2에는 `text-wrap: balance`, 본문에는 `text-wrap: pretty` 를 함께 적용해 가독성 보강.

---

## 3. 페이지 전체 레이아웃

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar (sticky, black bg, 10px padding)                     │ ← 검정 유지
├──────────────────────────────────────────────────────────────┤
│ Header                                                       │
│   ┌─ 메타 그리드 (SERIES / CATEGORY / PUBLISHED) ─┐          │
│   └───────────────────────────────────────────────┘          │
│   ┌ 04 ┐  한국에서 사업을 시작하기까지, …            (baseline │
│   └────┘                                           정렬)     │
│   ⚠ 본 글의 예시는 … (Disclaimer)                            │
├────────────┬─────────────────────────────────────────────────┤
│            │ ARTICLE (페이퍼 배경, padding 32 48)            │
│  SIDE RAIL │ ─ 섹션 × N (01, 02, …)                           │
│  240px     │ ─ Mid CTA (상하 네이비 룰 + 페이퍼 배경)         │
│  sticky    │ ─ 섹션 계속 …                                    │
│            │ ─ Closing                                       │
│            │   ├─ NEXT ACTIONS (검정 박스)                    │ ← 검정 유지
│            │   └─ RELATED 테이블                              │
└────────────┴─────────────────────────────────────────────────┘
```

- 전체 쉘: `grid-template-columns: 240px minmax(0, 1fr)`, `max-width: 1320px`, 중앙 정렬
- 모바일(< 1024px 권장): 사이드 레일 숨김, 쉘 1컬럼, 아티클 패딩 좌우 제거 (부모 `.C-shell` 에서 `padding: 0 16px`)
- 시맨틱 루트: 바깥쪽 래퍼는 `<article className="designC">` (모바일은 `designC mobile`)

---

## 4. 컴포넌트 명세

`design_c.jsx` 가 이 모든 컴포넌트의 마크업 기준입니다. React 컴포넌트 단위로 떼어내서 쓰거나, 그대로 다른 프레임워크로 옮겨도 됩니다(의존성은 `window.POST` 데이터 형상 하나뿐).

### 4.1 TopBar — `.C-topbar`
- 검정 배경, 하단 3px 네이비 룰, `position: sticky; top: 0`
- 좌: `EP04` (mono, gray) + 블로그 타이틀 (sans 700)
- 우: `PUB 2026.04.22` 노란 뱃지 + `READ 12min` + 네이비 버튼 `[상담 →]`
- 모바일: 패딩/폰트만 축소, 동일 구조 유지

### 4.2 Header — `.C-header`
- 배경: `--c-paper`, 하단 3px 네이비 룰
- **메타 그리드** `.C-header-grid`: 120px 1fr 그리드, 1px 네이비 테두리, 흰 배경. 3행 (SERIES / CATEGORY / PUBLISHED). 라벨은 mono 대문자, 값 중 일부(`사업·투자` 등)는 `.C-pill` 노란 뱃지로 강조.
- **Title Block** `.C-title-block`: `grid-template-columns: auto 1fr`, **`align-items: end`** (베이스라인 정렬). gap 24px.
  - 좌: `.C-bigno` = 108px Manrope 800, 네이비, `margin-bottom: -6px` 로 하단 보정해 제목 바닥과 정렬.
  - 우: H1 제목 38px.
- **Disclaimer** `.C-disclaimer`: 종이톤 아니고 **흰 배경 + 좌 4px 네이비 바 + 1px 그레이 테두리**. mono 12.5px. `⚠` 아이콘은 네이비 색.

### 4.3 Side Rail — `.C-rail`
- `position: sticky; top: 60px`, 오른쪽 1px 그레이 룰
- 세 블록(`.C-rail-block`)으로 분리, 블록 사이 1px 그레이 룰:
  - **CONTENTS** — 라벨 `.C-rail-label` 네이비 배경, 흰 글자
  - **SERIES** — 같은 시리즈 내 다른 에피소드 리스트. 활성 항목은 `.C-active` 클래스 → 네이비 + bold.
  - **ACTION** — 풀폭 네이비 버튼 `.C-rail-cta` = `[ 무상 사전 상담 → ]`
- 모든 글자 mono 12px

### 4.4 Article — `.C-article`
배경 `--c-paper`. 아래 섹션 블록들이 순서대로 쌓임.

#### 섹션 헤드 — `.C-section-head`
- `.C-section-idx` = `SECTION · 01` (mono 11px, 네이비, letter-spacing 0.1em)
- `.C-h2` = 28px sans 800

#### 본문 P — `.C-p`
- 15px / line-height 1.8 / `--c-ink-2`
- **`<b>` 는 노란색 하이라이트 밴드** — `background: var(--c-yellow); padding: 0 4px`. 본문 내 유일한 장식 포인트.

#### Callout — `.C-callout`
- 2px 네이비 테두리 + 흰 배경
- `.C-callout-head` 라벨 (mono, 네이비)

#### Table — `.C-tablewrap` + `.C-table`
- 외곽: 2px 네이비 테두리 + 흰 배경
- **Table 헤더바** `.C-table-head`: 네이비 배경, 흰 글자, mono 라벨 (예: `TABLE · 세 선택지 비교`)
- `<th>`: 종이톤 배경, mono uppercase 라벨. 특정 옵션 강조는 `.C-th-opt` 클래스로 노란 배경.
- `<td>`: 1px 점선 하단 구분, `.C-td-label` 은 첫 열 고정 라벨(mono, 종이톤)
- `.C-table-note`: 푸터 주석

#### Steps — `.C-steps` / `.C-step`
- `grid-template-columns: 72px 1fr`, gap 24px (모바일 50px / 14px)
- 좌측 `.C-step-left`: **`.C-step-n` 56×56 네이비 박스** (모바일 44×44) + 아래로 뻗는 2px 네이비 `.C-step-line` (마지막 단계는 제외)
- 번호 폰트: **Manrope 700 tabular** — 26px/24px, letter-spacing -0.01em
- 우측: mono 라벨 (예: `STEP · 01`) + H3 + 본문 P

#### FAQ — `.C-faq`
- 상단 3px 네이비 룰로 시작
- 항목: `grid-template-columns: 60px 1fr`, 하단 1px 그레이 룰
- `.C-faq-idx` = `Q.01` (mono, 네이비)

#### Mistakes — `.C-mistakes`
- 각 카드: 2px 네이비 테두리 + 흰 배경
- 좌상단에 **겹쳐진 태그** `.C-mistake-tag` (position absolute, top -10px, 네이비 배경, 흰 mono 글자 예: `MISTAKE · 01`)

#### Mid CTA — `.C-midcta`
- 위아래 네이비 ASCII 바 `.C-midcta-bar` (`=` 반복, mono 10px)
- 본체 `.C-midcta-grid`: **페이퍼 배경**, 상하 1px 네이비 룰, `grid-template-columns: 100px 1fr auto` (모바일 1fr, 세로 스택)
  - 좌: `ACTION · 01` 메타 라벨 (mono)
  - 중: "무상 사전 상담" sans 800 22px + 안내 2줄
  - 우: `.C-midcta-btn` 네이비 배경 흰 글자 `[ 신청 → ]`

### 4.5 Closing — `.C-closing`
- 3px 네이비 상단 룰로 시작
- `.C-closing-head` = `━` 반복 (mono 10px, 그레이)
- `.C-closing-title` = `END OF DOCUMENT · EP04` (mono 13px, letter-spacing 0.15em, 네이비)
- **`.C-closing-cta`** — **검정 배경** + 흰 글자 (페이지 하단 프레임 = 검정 유지하는 두 번째 블록)
  - 라벨: `NEXT ACTIONS` (mono, 노란색)
  - 리스트 `.C-closing-cta-list`: **2개 링크만** — "무상 사전 상담 신청" / "사업 이민 페이지". `→` mono 화살표는 노란색, 하단 1px 점선(#444) 구분선.
- `.C-related` — 2px 네이비 테두리 테이블, 행 전체 클릭 가능 (hover 시 네이비 soft 배경), 우측 끝 `[읽기 →]` 그레이 힌트
- `.C-closing-foot` = 1px 점선 룰 + `© 법무법인 로연 …` 소형 주석

---

## 5. 인터랙션 명세

1. **TopBar CTA / Rail CTA / Mid CTA / NEXT ACTIONS 링크** → 무상 사전 상담 페이지(라우팅은 코드베이스에 맞게)
2. **Rail TOC 항목 클릭** → 해당 섹션(`#section-01` 등) 앵커로 스무스 스크롤
3. **스크롤 시 Rail TOC 활성 항목 자동 하이라이트** → IntersectionObserver 로 현재 뷰포트 내 섹션 추적, `.C-active` 클래스 토글. 한 번에 하나만 활성.
4. **RELATED 테이블 행 클릭** → 해당 에피소드 상세로 이동 (전체 `<tr>` 클릭 가능)
5. **반응형 breakpoint 권장: 1024px** — 이하에서 Rail 숨김, `.designC mobile` 클래스 토글 (또는 CSS 미디어 쿼리로 분기). 현재 참조 구현은 prop 기반이지만 프로덕션은 미디어 쿼리로 가는 편이 더 깔끔합니다.

---

## 6. 데이터 스키마 (`window.POST`)

`content.js` 에 구체 예시가 들어있습니다. 실제 구현 시 CMS(또는 MDX) 에서 아래 형상으로 가져오면 됩니다.

```ts
type Block =
  | { type: "p"; text: string }                       // HTML 허용 (<b>, <br/>)
  | { type: "callout"; head: string; text: string }
  | { type: "table"; head: string; columns: string[]; highlightCol?: number;
                     rows: string[][]; note?: string }
  | { type: "steps"; items: { n: number; title: string; text: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "mistakes"; items: { title: string; text: string }[] }
  | { type: "midcta"; title: string; text: string; cta: string };

interface Post {
  category: string;             // 슬러그
  categoryLabel: string;        // 표시명, 예: "사업·투자"
  title: string;
  episode: string;              // "04"
  series: string;               // "사업이민 시리즈"
  published: string;            // "2026.04.22"
  readTime: string;             // "12min"
  disclaimer: string;
  toc: { idx: string; label: string }[];
  seriesList: { idx: string; label: string; active?: boolean }[];
  sections: { idx: string; heading: string; blocks: Block[] }[];
  related: { tag: string; title: string }[];
}
```

본문 `<b>` 태그가 **노란 하이라이트의 유일한 트리거**입니다. 마크다운을 HTML로 변환할 때 `**강조**` 만 `<b>` 로 렌더되도록 하고, `<strong>` / 인라인 코드 / 링크는 각기 다른 스타일을 쓰도록 분리하세요.

---

## 7. 구현 체크리스트

- [ ] Google Fonts 임포트 (Noto Sans KR, Noto Serif KR, Manrope, IBM Plex Mono)
- [ ] CSS 토큰(`--c-*`) 을 프로젝트 토큰 시스템으로 이식 (Tailwind config / CSS 변수 / SCSS 중 택1)
- [ ] `.designC`(또는 동등 스코프)에 `word-break: keep-all` + `overflow-wrap: break-word` 전역 적용
- [ ] TopBar sticky 동작 (헤더 위에 고정, z-index 10)
- [ ] Side Rail sticky + IntersectionObserver TOC 활성화
- [ ] 반응형 breakpoint 1024px: Rail 숨김, 아티클 풀폭
- [ ] `<b>` → 노란 하이라이트 밴드 렌더
- [ ] Title Block baseline 정렬 확인 (`align-items: end` + `.C-bigno` `margin-bottom: -6px`)
- [ ] Table 가로 스크롤 허용 (`overflow-x: auto` on `.C-tablewrap`)
- [ ] RELATED 테이블 행 클릭 커서 + hover 색 변경
- [ ] NEXT ACTIONS 링크 2개만 (추후 늘릴 경우 디자인 재검토 필요)
- [ ] 다크 모드는 현재 정의되지 않음 — 필요 시 토큰 확장 필요

---

## 8. 저작권/이미지

본 디자인에는 이미지 에셋이 사용되지 않았습니다(의도적으로 텍스트 + 룰 + 라벨만으로 구성). 향후 이미지 블록 추가 시 Callout 스타일과 충돌하지 않도록 별도 블록 타입(`{ type: "figure", src, caption }`)을 정의해 주세요.

---

## 9. 문의

디자인 관련 의사결정 히스토리(적색 → 네이비 치환, 검정 블록 감소, 숫자 폰트 3회 반복 실험 등)가 필요하면 원 프로젝트의 v1~v4 파일을 비교해 보시면 됩니다. 질문 있으시면 이 저장소에 PR 코멘트나 이슈로 남겨 주세요.
