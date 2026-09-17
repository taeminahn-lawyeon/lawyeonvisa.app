# 인사이트 아티클 작성·수정·게시 가이드

> 원고 작성·수정 전에 아래 편집 원칙을 적용한다. 원고 검토는 본문 텍스트나 Markdown으로 진행하고, 승인된 글을 사이트에 반영할 때 기존 빌드 파이프라인을 사용한다. 원고를 위한 별도 HTML 시안은 만들지 않는다.

## 아티클 작성과 퇴고 원칙

- **목적:** 전문성과 신뢰를 통해 고난이도 출입국·사범심사 통합 사건의 유효한 수임 문의를 얻는다. 법률지식을 나열하거나 모든 독자에게 무료 상담을 유도하는 글을 쓰지 않는다.
- **연구:** 주제에서 독자의 결과를 바꾸는 질문을 먼저 정한다. 지침·매뉴얼·재결·감사자료 등 원문에서 적용 대상, 기준, 예외, 판단 권한과 증거의 의미를 확인한다. 인용할 문구만 수집하지 않는다.
- **논증:** 원고를 구성하기 전에 적용 기준 → 의미 있는 사실관계 → 그 사실을 뒷받침하거나 뒷받침하지 못하는 자료 → 독자의 판단이 달라지는 이유를 도출한다. 의뢰인의 사정이 어떤 요건에 해당하는지 설명하지 않은 채 ‘종합적으로 검토해야 한다’로 끝내지 않는다.
- **정확성:** 적용 시점·범위와 미확인 사항은 내부 검증기록에 남긴다. 오래된 지침이나 단일 사례의 숫자를 현행 일반 규칙으로 확대하지 않는다. 표를 채우기 위해 확인되지 않은 액수·기간·자동 처분 관계를 만들지 않는다. 문체 수정이나 출처 삭제를 법률 검증 완료로 취급하지 않는다.
- **발행 표현:** 본문에 규정·재결·보고서 출처 링크, 판례번호, 출처 연도를 장식처럼 넣지 않는다. 필요한 지침명·기준명만 명시한다. ‘공개된 기준에 따라’, ‘공개자료에 제시된’, ‘어느 해 재결에 인용된 어느 해 기준’ 같은 조사 경위 표현을 넣지 않는다. 시행일 자체가 쟁점인 개정 안내의 날짜는 출처 연도 장식과 구별한다.
- **문장:** 각 문장이 주제에 고유한 법적·실무적 의미를 가지게 한다. ‘함께 읽어야 한다’, ‘구분해야 한다’, ‘사안마다 다르다’만으로 끝나는 문장은 실제로 결론을 바꾸는 기준과 결과를 설명하거나 삭제한다. 반복되는 요약, 당연한 구분, 추상적인 선처·전문성 문구로 분량을 늘리지 않는다.
- **구성:** 논증에 필요한 만큼 쓴다. 분량, 문단 수, 소제목 수, 도입 길이, FAQ 수를 미리 고정하지 않는다. 여러 글을 요청받아도 각 글에 필요한 설명을 생략하여 동일 길이의 요약으로 만들지 않는다. 이번 사범심사의 네 부분 구성은 해당 글에 관한 승인이지 모든 아티클의 틀이 아니다.
- **전문성의 범위:** 기준의 의미와 판단의 이유는 충분히 설명한다. 개별 의뢰인에게 적용할 사유 선택, 증거의 부족·충돌 해결, 실제 신청·소송의 구성까지 계약 후 자문서처럼 완성하지 않는다. 기본 결론을 일부러 숨겨 문의를 유도하지 않는다.
- **홍보:** 글마다 업무소개·문의 유도·자료 제출 목록을 새로 만들지 않는다. 센터 소개를 넣을 때는 승인된 고정 문구를 그대로 사용한다. 변호인의 역할이 주제에 포함되면 실제 조사·의견서·증빙·승인 과정에서 하는 일을 설명한다.
- **검색:** 독자가 찾는 정확한 용어와 질문, 직접적인 답, 필요한 비교표를 사용한다. SEO나 AI 인용을 이유로 키워드, FAQ, 출처 문단을 덧붙이지 않는다. 기존 글 수정 시 주소를 유지하고 제목·목차·메타설명·구조화 데이터가 본문과 일치하도록 한다. 노출이나 수임을 보장하지 않는다.
- **승인본 반영:** 사용자가 확정한 원고의 문구와 문단을 게시 과정에서 임의로 축약·재작성하거나 도입문·FAQ·CTA·결론을 추가하지 않는다. 글의 내용과 기존 공통 센터 소개·탐색 요소를 구별한다. 기존 URL 및 요청하지 않은 다른 언어의 글을 보존한다.
- **마지막 검토:** 연구에서 얻은 핵심 판단이 실제 문장에 있는지, 각 문장을 삭제했을 때 독자의 이해가 무엇을 잃는지, 기준과 증빙의 관계를 설명했는지 확인한다. 문체 약속을 반복하는 대신 원고와 실제 게시 결과를 검증한다. 성과는 검색 클릭과 유효한 수임 문의를 함께 본다.

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
- [ ] 승인 원고의 문구·문단·소제목이 일치하고, 불필요한 도입·FAQ·CTA를 추가하지 않음
- [ ] 출처 링크·출처 연도 강조·공개자료 표현을 발행본문에서 제외하고 내부 검증기록에 보관
- [ ] `PAGES` + `ARTICLE_DATES` 등록, `langs` 정확
- [ ] 실제 작성·수정한 언어의 인사이트·홈 목록에 제목을 반영하고, 새 글에만 필요한 행을 추가
- [ ] 사진은 축소+워터마크 후 `images/blog/`, 본문은 `__BASE__` 경로
- [ ] `node scripts/build-site.js` 성공 → `main` 푸시
