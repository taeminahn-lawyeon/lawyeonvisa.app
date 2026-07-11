# 인사이트 새 아티클 추가 가이드 (Claude 지시서)

> 새 대화 인스턴스에게: **이 파일을 읽고 아래 절차·규칙 그대로** 인사이트에 새 아티클을 추가하라. 임의로 HTML을 손으로 만들지 말고 반드시 빌드 파이프라인을 따르라.

## 시스템 개요
정적 사이트 생성기다. `content/`의 **언어별 본문 조각** + 공용 `partials/`를 `scripts/build-site.js`가 조립해 HTML을 만든다.
- 영어 = 루트(`/foo`), 한국어 = `/ko/foo`, 베트남어 = `/vi/foo` (확장자 없는 clean URL).
- 빌드: `node scripts/build-site.js` → 루트/`ko/`/`vi/`에 HTML, `sitemap.xml`, `robots.txt` 생성.
- 배포: `main` 브랜치에 커밋·푸시하면 GitHub Pages로 배포된다. (PR은 사용자가 요청할 때만)

## 절대 원칙 (콘텐츠 규칙)
1. **발행년월(작성일) 표기 금지** — 본문 `.art-meta`에 `발행/Published/Ngày đăng` 넣지 말 것. (검색용 작성일은 빌드가 자동 처리)
2. **“무료 상담 / 무상 상담 / free consultation” 등 무료 표현 금지.** CTA 문구는 `상담 신청하기 →` / `Request a consultation →` / `Đăng ký tư vấn →`.
3. **변호사·스태프·전문가가 “답변한다”는 식의 표현 금지.** 주체는 항상 “로연 / Law Firm Lawyeon”. **응답 시간 보장(24시간·30분 등) 문구 금지.**
4. 각 언어는 번역키가 아니라 **별도 파일**로 만든다. 한국법 내용의 영문·베트남어는 기계번역이 아니라 **정확한 법률 문안으로 감수**해 작성. 원문이 한 언어만 제공되면 그 언어만 만들고 사용자에게 확인.
5. 언어별 slug(파일명)는 **동일**하게. 소문자·하이픈, 제목 키워드 기반(예: `foreigner-xxx-korea-2026`).

## 1) 본문 파일 — `content/<slug>.<lang>.html`
표준 예시: `content/foreigner-dui-deportation-korea-2026.ko.html`. 아래 구조를 따른다.

```html
<div class="wrap">
    <div class="art-head">
        <div class="art-kicker"><span class="cat">형사</span><span class="dot">·</span><span>출입국·사범심사</span></div>
        <h1>기사 제목 (브랜드명 붙이지 말 것)</h1>
        <div class="art-meta"><span><b>분류</b> 출입국·형사</span><span><b>읽는 시간</b> 약 8분</span></div>
        <p class="disclaimer">도입 요약 1~2문장.</p>
    </div>
</div>

<div class="wrap">
    <div class="art-layout">
        <nav class="toc">
            <h4>목차</h4>
            <a href="#s1">소제목1</a>
            <a href="#s2">소제목2</a>
            <a href="#faq">자주 묻는 질문</a>
        </nav>

        <article class="body">
            <p><b>"핵심 질문?"</b> 도입 문단…</p>

            <h2 id="s1">소제목1</h2>
            <p>본문…</p>

            <!-- 사진 삽입 (6번 규칙) -->
            <figure class="art-fig"><img src="__BASE__images/blog/office-yangju-exterior.jpg" alt="설명"><figcaption>캡션.</figcaption></figure>

            <h2 id="s2">소제목2</h2>
            <p>본문…</p>

            <!-- 표 -->
            <div class="tbl"><table>
                <thead><tr><th>항목</th><th>내용</th></tr></thead>
                <tbody><tr><td>A</td><td>B</td></tr></tbody>
            </table></div>

            <!-- 본문 CTA (한 개, 무료 표현 금지) -->
            <div class="callout">사안 요약… 상담을 신청하시면서 …를 남겨 주시면 함께 정리해 드립니다. <a href="consultation" style="color:var(--btn);font-weight:700">상담 신청하기 →</a></div>

            <h2 id="faq">자주 묻는 질문</h2>
            <div class="qa"><div class="q">질문?</div><div class="a">답변.</div></div>
            <div class="qa"><div class="q">질문?</div><div class="a">답변.</div></div>

            <p class="disclaimer" style="margin-top:30px">본 글은 일반적 법률정보이며 개별 사건에 대한 자문이 아닙니다. …</p>

            <div class="related">
                <h4>이어지는 글</h4>
                <a href="관련기사-slug"><span class="rt">관련 기사 제목</span><span class="rtag">형사</span></a>
                <a href="insights?cat=criminal"><span class="rt">형사 인사이트 더 보기</span><span class="rtag">인사이트</span></a>
            </div>
        </article>
    </div>
</div>
```

주의:
- **이미지·내부 링크 경로는 반드시 `__BASE__`로 시작**(`__BASE__images/blog/...`). 빌드가 언어별 상대경로를 자동으로 넣는다.
- `#faq`의 `.qa`(질문/답변)는 그대로 두면 빌드가 **FAQPage 구조화 데이터로 자동 변환**한다. FAQ는 반드시 이 형식으로.
- 베트남어(vi)이고 vi 상담 페이지가 없으면: `<article class="body" data-no-cta>` 로 열고, CTA는 `href="../consultation"`.

## 2) `scripts/build-site.js` — `PAGES`에 등록
기사 제목에는 브랜드 접미사를 붙여도 된다(기사 `<title>`에서는 빌드가 자동 제거).
```js
{
  id: 'foreigner-xxx-korea-2026', content: 'foreigner-xxx-korea-2026',
  langs: ['ko', 'en'],   // 만든 언어만. 생략 시 기본 ['en','ko']. vi 포함 시 ['ko','en','vi']
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
- 한 언어에만 있는 기사는 그 언어 목록에만 추가.

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
- [ ] `#faq`는 `.qa` 형식 / 본문 CTA 1개(“상담 신청하기 →”)
- [ ] `PAGES` + `ARTICLE_DATES` 등록, `langs` 정확
- [ ] 인사이트·홈 목록 4개 파일에 행 추가(카테고리·`hidden`·연월 날짜·최신순)
- [ ] 사진은 축소+워터마크 후 `images/blog/`, 본문은 `__BASE__` 경로
- [ ] `node scripts/build-site.js` 성공 → `main` 푸시
