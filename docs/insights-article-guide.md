# 아티클 게시 절차

원고 작성·퇴고 기준은 **로연 아티클 작성**(`lawyeon-articles`) 스킬에서 관리한다. 이 문서에 같은 편집 규칙을 다시 늘리지 않는다.

작업 전 스킬 본문과 작업 유형에 해당하는 참고자료를 읽고, 최신 원고 및 해당 글의 근거 메모를 확인한다. 스킬이 표시되지 않으면 이름으로 찾아 읽는다. 이전 채팅에서 적용했다는 보고만으로 읽기를 생략하지 않는다.

이 문서는 기존 사이트에 원고를 반영할 때 사용하는 기술 절차다. 문서의 HTML 예시는 글의 목차·길이·문단 수를 정하는 양식이 아니다. 원고 검토는 본문 텍스트나 필요한 문서로 제공한다.

- 기존 판결·매뉴얼 근거: [뉴스레터 근거 메모](newsletter-research-20260918.md)
- 대형로펌 개별 글 연구: [뉴스레터 시사점 연구](newsletter-implications-research-20260918.md)

## 시스템 개요
정적 사이트 생성기다. `content/`의 **언어별 본문 조각** + 공용 `partials/`를 `scripts/build-site.js`가 조립해 HTML을 만든다.
- 영어 = 루트(`/foo`), 한국어 = `/ko/foo`, 베트남어 = `/vi/foo` (확장자 없는 clean URL).
- 빌드: `node scripts/build-site.js` → 루트/`ko/`/`vi/`에 HTML, `sitemap.xml`, `robots.txt` 생성.
- 배포: `main` 브랜치에 커밋·푸시하면 GitHub Pages로 배포된다. (PR은 사용자가 요청할 때만)

## 절대 원칙 (콘텐츠 규칙)
1. **발행년월(작성일) 표기 금지** — 본문 `.art-meta`에 `발행/Published/Ngày đăng` 넣지 말 것. (검색용 작성일은 빌드가 자동 처리)
2. **“무료 상담 / 무상 상담 / free consultation” 등 무료 표현 금지.** CTA 문구는 `상담 신청하기 →` / `Request a consultation →` / `Đăng ký tư vấn →`.
3. **변호사·스태프·전문가가 “답변한다”는 식의 표현 금지.** 주체는 항상 “로연 / Law Firm Lawyeon”. **응답 시간 보장(24시간·30분 등) 문구 금지.**
4. **모든 아티클은 국문·영문을 함께 게시한다.** 인사이트·업무사례·뉴스레터 모두 포함한다. 원문이 한 언어로만 제공되어도 다른 언어를 작성하고, 법적 의미·조건·예외·사례 사실·수치를 대조하여 함께 게시한다. 번역을 위한 추가 승인을 요구하지 않는다. 각 언어는 별도 파일로 만들며, 기존 글을 수정할 때에도 두 언어를 동기화한다. 베트남어 등 추가 언어는 요청 범위에 따른다.
5. 언어별 slug(파일명)는 **동일**하게. 소문자·하이픈, 제목 키워드 기반(예: `foreigner-xxx-korea-2026`).

## 1) 본문 파일 — `content/<slug>.<lang>.html`
표준 예시: `content/foreigner-dui-deportation-korea-2026.ko.html`. 아래 구조를 따른다.

```html
<div class="wrap">
    <div class="art-head">
        <div class="art-kicker">기존 분류</div>
        <h1>승인된 제목</h1>
        <div class="art-meta">필요한 기존 분류 정보</div>
    </div>
</div>
<div class="wrap">
    <div class="art-layout">
        <nav class="toc" aria-label="목차"><!-- 실제 승인 소제목에 맞춘 링크 --></nav>
        <article class="body" data-no-cta>
            <!-- 승인 원고의 문단·소제목·목록·표를 그대로 반영 -->
            <!-- 기존 고정 센터 소개와 관련 글 탐색 요소 유지 -->
        </article>
    </div>
</div>
```

승인본에 본문 CTA가 없으면 `data-no-cta`로 공통 스크립트의 자동 CTA 삽입도 막는다.

이 예시는 게시를 위한 기술 구조다. 글의 길이나 구성 요소를 정하는 원고 틀이 아니다. 도입문·요약·FAQ·본문 CTA·고지문은 이 예시를 이유로 새로 추가하지 않는다.

주의:
- **이미지·내부 링크 경로는 반드시 `__BASE__`로 시작**(`__BASE__images/blog/...`). 빌드가 언어별 상대경로를 자동으로 넣는다.
- 승인 원고에 FAQ가 실제로 있는 경우에만 `#faq`와 `.qa`를 사용한다. 빌드가 보이는 질문·답변을 FAQPage 구조화 데이터로 변환하므로, 본문에 없는 질문을 검색용으로 만들지 않는다.
- 베트남어(vi)이고 vi 상담 페이지가 없으면: `<article class="body" data-no-cta>` 로 열고, CTA는 `href="../consultation"`.

## 2) `scripts/build-site.js` — `PAGES`에 등록
기사 제목에는 브랜드 접미사를 붙여도 된다(기사 `<title>`에서는 빌드가 자동 제거).
```js
{
  id: 'foreigner-xxx-korea-2026', content: 'foreigner-xxx-korea-2026',
  langs: ['ko', 'en'],   // 모든 아티클에 국문·영문 필수. vi 추가 시 ['ko','en','vi']
  title: { ko: '한국어 제목 (2026) — 법무법인 로연',
           en: 'English Title (2026) — Law Firm Lawyeon' },
  desc:  { ko: '한국어 메타설명(80자 내외 권장).',
           en: 'English meta description (~155 chars).' },
},
```

## 3) `scripts/build-site.js` — `ARTICLE_DATES`에 날짜 추가 (검색용, 비표시)
```js
'foreigner-xxx-korea-2026':'2026-08-01',   // YYYY-MM-DD, 실제 발행월
```

## 4) 자동 처리(손대지 말 것)
빌드가 기사 페이지에 자동 삽입: **BlogPosting·FAQPage·BreadcrumbList JSON-LD, og:type=article, 기사별 og:image(본문 첫 blog 이미지), 트위터 카드, article 작성일 메타, 제목 브랜드 접미사 제거, sitemap lastmod, 언어 토글/hreflang.**

## 5) 인사이트·홈 목록에 노출
`content/insights.ko.html`, `content/insights.en.html`, `content/home.ko.html`, `content/home.en.html` 4개 파일의 `#insightList` 안에 행을 추가한다.
- **카테고리(`data-cat`)**: `visa`(비자·이민) / `criminal`(형사) / `residence`(거주·국적) / `admin`(행정).
- **기본 표시 카테고리는 `visa`** → visa는 `class="doc-row"`, 그 외는 `class="doc-row hidden"`.
- **날짜는 연·월만**(`YYYY.MM`). 일(DD)까지 쓰지 말 것.
- **최신 글이 위로**: 같은 카테고리 안에서 최신이면 그 카테고리 블록 맨 위에.
- 국문·영문 양쪽 목록에 같은 글을 등록하고, 각 언어의 제목과 해당 언어 페이지로 연결한다. 업무사례는 양쪽 홈의 업무사례 목록에 등록한다.

```html
<a class="doc-row hidden" data-cat="criminal" href="foreigner-xxx-korea-2026">
    <div class="doc-main">
        <div class="doc-title">목록에 보일 제목</div>
        <div class="doc-tags"><span>#형사</span><span>#태그2</span><span>#태그3</span></div>
    </div>
    <div class="doc-date">2026.08</div>
</a>
```

## 6) 본문 삽입 사진 (선택)
- 위치: `images/blog/<이름>.jpg`. 본문에서 `<figure class="art-fig"><img src="__BASE__images/blog/이름.jpg" alt="…"><figcaption>…</figcaption></figure>`.
- 새 사진은 **① 웹용 축소(가로 최대 1600px, 품질 82) → ② “Law Firm Lawyeon” 사선 워터마크(중앙 1회, 은은하게)** 처리 후 저장. Pillow + 폰트 `LiberationSans-Bold.ttf` 사용:

```python
from PIL import Image, ImageOps, ImageDraw, ImageFont
FONT="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"; TEXT="Law Firm Lawyeon"
for src,dst in [("원본.jpg","images/blog/이름.jpg")]:
    im=ImageOps.exif_transpose(Image.open(src)).convert("RGBA"); im.thumbnail((1600,1600))
    W,H=im.size; fs=max(28,int(W/16)); font=ImageFont.truetype(FONT,fs)
    bb=ImageDraw.Draw(im).textbbox((0,0),TEXT,font=font,stroke_width=2)
    lay=Image.new("RGBA",(bb[2]-bb[0]+60,bb[3]-bb[1]+60),(0,0,0,0))
    ImageDraw.Draw(lay).text((30,30),TEXT,font=font,fill=(255,255,255,90),
        stroke_width=max(1,fs//34),stroke_fill=(45,36,27,70))
    rot=lay.rotate(28,expand=True,resample=Image.BICUBIC)
    im.alpha_composite(rot,((W-rot.width)//2,(H-rot.height)//2))
    im.convert("RGB").save(dst,quality=82,optimize=True,progressive=True)
```

## 7) 빌드 & 배포
```bash
node scripts/build-site.js      # "Done. N page(s) generated." 확인
```
변경분 커밋 후 **`main`에 푸시**하면 배포. (작업 브랜치에서 하고 main 반영)

## 8) 마지막 체크리스트
- [ ] 발행일·무료상담·시간보장·전문가 지칭 표현 없음
- [ ] 승인 원고의 문구·문단·소제목이 일치하고, 불필요한 도입·FAQ·CTA를 추가하지 않음
- [ ] 출처 링크·출처 연도 강조·공개자료 표현을 발행본문에서 제외하고 내부 검증기록에 보관
- [ ] `PAGES` + `ARTICLE_DATES` 등록, `langs`에 `ko`·`en` 모두 포함, 양쪽 본문·제목·메타설명 준비
- [ ] 국문·영문의 법적 의미·조건·예외·사례 사실·수치 대조, 승인 원고에 없는 주장 추가 없음
- [ ] 양쪽 인사이트·홈 또는 업무사례 목록에 제목과 해당 언어 링크 반영
- [ ] 실제 국문·영문 URL, 양방향 언어 전환, canonical·hreflang·사이트맵 확인
- [ ] 사진은 축소+워터마크 후 `images/blog/`, 본문은 `__BASE__` 경로
- [ ] `node scripts/build-site.js` 성공 → `main` 푸시
