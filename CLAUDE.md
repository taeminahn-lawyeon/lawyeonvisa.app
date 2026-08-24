# 작업 지침

## 대화 방식

- 비유적 표현과 수사적 표현을 쓰지 않는다. 사실을 그대로 기술한다.
- 업계 용어를 그대로 옮기지 않는다. 그것이 무엇인지 그대로 기술한다.
- 비즈니스 문체로만 쓴다.
- 선택지를 나열하고 고르게 하지 않는다. 결정이 필요하면 정리해서 대화체로 묻는다.
  (AskUserQuestion 도구를 쓰지 않는다.)

## 사이트 구조

- 정적 HTML + GitHub Pages. 301 리다이렉트를 보낼 수 없다.
- 페이지는 `scripts/build-site.js` 의 `PAGES` 배열이 등록부다.
  `partials/head|header|footer` + `content/<id>.<lang>.html` 을 합쳐
  루트(EN)와 `/ko`(KO)로 생성한다. 생성된 파일을 직접 고치지 않는다.
- 변경 후에는 `node scripts/build-site.js` 와 `npm run validate` 를 돌린다.

## 해결 사례(Cases) — 첫 게시 시 적용할 보류 결정

- 종결 사례 글은 관리자가 `case-editor.html` 로 한국어 원문을 작성해 전달한다.
  Claude Code 가 법률 용어를 교차검증해 영어판을 만들고, 도구 출력물의
  등록 절차대로 등록한다.
- 사례 목록 섹션은 아직 없다. 첫 사례를 등록할 때 메인 페이지
  (`content/home.ko.html`·`home.en.html`) 하단, 뉴스 카드 섹션(`id="cases"`)
  아래에 신설한다. 형태는 목록형이다: 제목(해결 사례/Cases) + 카테고리 탭
  (전체·형사&사범심사·비자·이민·거주·국적·행정) + 행 목록(`doc-list`,
  `id="case-list"`). 뉴스는 지금의 카드 형태를 유지한다.

## 백엔드

- Supabase(anon key 브라우저 호출) + Deno Edge Function.
- 접수 경로는 세 가지다. 사전상담(`pre_consultations`), 방문 예약(`reservations`),
  기업 자문(`corporate_inquiries`). 모두 비로그인 접수이며 관리자만 조회한다.
- 고객 로그인은 폐지됐다. 관리자 인증(`admin-login.html`)은 유지한다.
- RLS 정책의 역할 비교는 `role::text IN (...)` 형태로 쓴다.
  enum 캐스팅은 값이 없을 때 문장 전체가 실패한다.
- 스키마를 바꾼 뒤에는 `NOTIFY pgrst, 'reload schema';` 를 실행한다.
