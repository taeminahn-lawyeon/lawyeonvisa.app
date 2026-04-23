# 법무법인 로연 · 사업이민 블로그 시리즈 4편 — 개발자 핸드오프

외국인 대상 한국 사업이민 블로그 시리즈 4편의 **디자인 · 콘텐츠 · 렌더링 로직** 전체입니다. 이 패키지 하나로 4편 모두 재현·편집·이식이 가능합니다.

---

## 1. 패키지 구성

```
handoff/
├── README.md               ← 이 파일
├── src/                    ← 프로덕션 이식용 소스
│   ├── design_c_navy_v4.css    디자인 시스템 (네이비 안 C · v4)
│   ├── design_c.jsx            렌더링 컴포넌트 (React 18)
│   ├── content_ep1.js          편 1 콘텐츠 (비자 개괄)
│   ├── content_ep2.js          편 2 콘텐츠 (제도 구조)
│   ├── content_ep3.js          편 3 콘텐츠 (진행 흐름)
│   └── content_ep4.js          편 4 콘텐츠 (사업이민 이후)
└── preview/                ← 단독 실행 가능한 디자인 미리보기
    ├── ep1.html
    ├── ep2.html
    ├── ep3.html
    └── ep4.html
```

`preview/` 안의 HTML은 디자이너가 만든 **데스크톱(1280px) + 모바일(390px) 병렬 뷰어**입니다. 개발자가 디자인 의도를 확인할 때만 사용하시면 됩니다. 프로덕션 빌드에 들어가는 것은 `src/` 아래의 4개 파일입니다.

---

## 2. 시리즈 구성

| 편 | 제목 | 콘텐츠 파일 |
|---|---|---|
| 편 1 | 한국 사업이민 비자 개괄 — D-9-4와 D-9-5, 그리고 프랜차이즈라는 선택지 | `content_ep1.js` |
| 편 2 | 한국 사업이민 비자 제도의 구조 — 투자금·체류·연장·동반가족 | `content_ep2.js` |
| 편 3 | 한국에서 사업을 시작하기까지, 실제로 무엇이 진행되는가 | `content_ep3.js` |
| 편 4 | 한국 사업이민 이후 — 장기 거주·가족·부동산·사회보험 | `content_ep4.js` |

4편 모두 **동일한 디자인 시스템(design_c_navy_v4.css)과 동일한 렌더링 컴포넌트(design_c.jsx)** 를 공유하며, 각 페이지 간의 차이는 오직 `content_epN.js` 하나로 귀결됩니다.

---

## 3. 의존성

| 의존성 | 버전 | 역할 |
|---|---|---|
| React | 18.3.1 | 렌더링 |
| ReactDOM | 18.3.1 | 루트 마운트 |
| Babel Standalone | 7.29.0 | **미리보기 전용** (프로덕션에서는 제거) |
| Google Fonts | Noto Sans KR, Noto Serif KR, Manrope, IBM Plex Mono | 한/영 혼용 타이포 |

**프로덕션 권장 처리**
- `design_c.jsx` → 빌드 시스템(Vite/Webpack/Next 등)에서 JSX로 트랜스파일하여 번들. 현재 미리보기에서는 `@babel/standalone`이 런타임으로 JSX를 변환하지만 프로덕션에서는 **빌드 단계에서 변환**해야 합니다.
- 폰트는 `<link rel="preconnect">` 후 정식 import(구글 폰트 또는 셀프 호스팅).

---

## 4. 콘텐츠 스키마 (`content_epN.js`)

각 파일은 글로벌 스코프에 두 개의 객체를 노출합니다.

```js
window.POST = {
  category: "business",
  categoryLabel: "사업·투자",
  episodeNo: "01",            // 대형 숫자 표시 및 우측 레일 활성 항목
  rev: "01",                  // 개정 번호
  seriesNav: [                // 우측 레일(또는 상단 내비)
    { no: "01", label: "비자 개괄 · 프랜차이즈", active: true },
    { no: "02", label: "비자 제도 구조" },
    { no: "03", label: "이주·창업 진행 흐름" },
    { no: "04", label: "사업이민 이후" },
  ],
  title: "...",
  disclaimer: "...",
  series: "편 1 · 사업이민 시리즈",
  publishedAt: "2026.04.10",
  updatedAt: "2026.04.20",
  readingMin: 9,
  sections: [ /* Section[] — 아래 블록 타입 참조 */ ],
  related: [ { tag: "편 2", title: "..." }, ... ]
};
window.TOC = window.POST.sections
  .filter(s => s.heading)
  .map(s => ({ id: s.id, label: s.heading }));
```

### Section 블록 타입

`design_c.jsx` 의 `BlockC` 컴포넌트가 지원하는 타입은 다음 6가지입니다.

| type | 용도 | 키 |
|---|---|---|
| `p` | 단락. `text` 안에 `<b>`, `<i>` 등 HTML 허용 (`dangerouslySetInnerHTML`) | `text` |
| `callout` | 강조 박스 (▲ NOTE) | `text` |
| `table` | 비교 표 | `title`, `headers[]`, `rows[][]`, `note?` |
| `numbered` | 번호 매겨진 항목(단계·리스트) | `items: [{ n, title, text }]` |
| `faq` | 질의응답 | `items: [{ q, a }]` |
| `mistakes` | 흔한 실수 리스트 | `items: [{ title, text }]` |

### 특수 섹션

- `{ id: "s-cta-mid", type: "midCta", blocks: [] }` — 본문 중앙에 상담 CTA를 삽입합니다. `design_c.jsx` 의 `MidCtaC` 컴포넌트가 렌더링합니다.

---

## 5. `design_c.jsx` 공개 API

```html
<script src="content_ep1.js"></script>        <!-- window.POST, window.TOC 정의 -->
<script src="design_c.jsx"></script>          <!-- window.DesignC 정의 -->
<script>
  const C = window.DesignC;
  ReactDOM.createRoot(el).render(<C mobile={false} />);  // 데스크톱
  ReactDOM.createRoot(el).render(<C mobile={true} />);   // 모바일 (420px 이하 레이아웃)
</script>
```

- **Props**: `mobile: boolean` — 레일(seriesNav)과 TOC를 숨기고 단일 컬럼으로 전환.
- 내부적으로 `window.POST` 와 `window.TOC` 를 읽습니다. 리팩터 시 Props로 주입하는 구조로 바꾸실 수 있습니다 (권장).

---

## 6. 디자인 시스템 (`design_c_navy_v4.css`)

- 메인 컬러: **네이비 `#0f2552`** (포인트), 블랙 `#1a1a1a` (본문), 베이지 `#e8e6df` (배경)
- 타이포 스케일: Noto Serif KR(제목) / Noto Sans KR(본문) / IBM Plex Mono(메타)
- 클래스 프리픽스: 모든 클래스가 `C-` 로 시작합니다(`C-article`, `C-section`, `C-p`, `C-callout`, ...). 충돌 걱정 없이 기존 페이지 위에 얹을 수 있습니다.

---

## 7. 프로덕션 이식 체크리스트

- [ ] 4개 `content_epN.js` 를 CMS 또는 MDX/JSON 스키마로 이식 (필드명 유지 권장)
- [ ] `design_c.jsx` 를 프로젝트 JSX 빌드 파이프라인에 편입, `window.POST`/`window.TOC` 의존을 Props로 전환
- [ ] `design_c_navy_v4.css` 를 전역 또는 CSS 모듈로 삽입
- [ ] 외부 링크(`href` 현재 더미) 실제 URL로 교체
- [ ] 시리즈 간 내비 링크 (현재 프리뷰는 파일명 기반) → 실제 라우팅으로 교체
- [ ] 폰트 로딩을 preconnect + font-display: swap 으로 최적화
- [ ] `@babel/standalone` 제거 (빌드 타임 트랜스파일로 대체)

---

## 8. 미리보기 실행

`preview/ep1.html` ~ `ep4.html` 중 아무거나 브라우저로 여시면 됩니다. 각 미리보기는 상단에 편 1~4 사이를 이동하는 링크와 **데스크톱 1280px + 모바일 390px** 의 병렬 렌더링을 보여줍니다. 로컬 파일 직접 열기(`file://`)로도 동작합니다.

---

*법무법인 로연 출입국이민지원센터 · 사업이민 시리즈 4편*
