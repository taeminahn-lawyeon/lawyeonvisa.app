<!--
  BUSINESS_IMMIGRATION_SPEC.md
  사업이민 섹션 개발 명세 — 법무법인 로연 출입국이민지원센터
  작성: 안태민 · 섹션 14 병합 및 확정본: 2026-04-20
-->

> 법무법인 로연 출입국이민지원센터(`lawyeonvisa.app`)에 **사업이민 전용 섹션**을 신규 추가하는 작업 명세.
>
> 본 문서는 Claude Code(개발자)용입니다. 기존 저장소 전제에서 작업하며, 컴포넌트·스타일·i18n·쓰레드·대시보드 시스템은 최대한 재활용합니다.

---

## 0. 전제 및 원칙

### 전제
- Claude Code는 기존 `lawyeonvisa.app` 저장소에 접근 가능.
- 기존 README(섹션 1~16)에 명시된 기술 스택·디렉터리 구조·컨벤션을 그대로 이어받음.
- 기존 HTML 31개 페이지 중 `index.html`·`consultation-request.html`·`thread-general-v2.html`·`admin-dashboard.html`을 참고·패턴 복제 원본으로 사용.

### 원칙
- 기존 Vanilla JS + 정적 HTML + Supabase 구조 유지. 신규 프레임워크 도입 금지.
- CSS·컴포넌트는 기존 파일을 import/reuse. 신규 스타일 파일 생성 최소화.
- i18n은 기존 `js/i18n.js` + `js/translations.js` 방식 그대로. 번역 키만 추가.
- 카피는 본 문서에 한국어 마스터 확정 버전이 직접 삽입되어 있음. 영어·베트남어·중국어 번역은 별도 작업으로 분리.
- 가격·비용에 관한 일체의 언급·링크 완전 제거 (사업이민 섹션 전체 원칙).
- 변호사광고규칙 준수(제3조 자신의 이름, 제4조 과장·결과 예측 금지, 제6조 공직 재직 표시).

### 작업 범위
- 사업이민 전용 랜딩 페이지 1개 + 상담 신청 페이지 1개 신설.
- 기존 블로그 "사업·투자" 카테고리 재활용 (새 카테고리 생성 없음).
- 기존 쓰레드 시스템에 사업이민 전용 상태 추가.
- 기존 대시보드 UI에 사업이민 프로젝트 진행 현황 뷰 추가.
- 4개 언어(ko·en·vi·zh) 동시 런칭.

---

## 1. 신규 파일 목록

루트 배치 (기존 컨벤션 유지).

```
lawyeonvisa.app/
├── business-immigration.html            [신설] 사업이민 랜딩
├── business-immigration-request.html    [신설] 사업이민 전용 상담 신청 폼
```

### 신규 CSS/JS 파일
- 신규 스타일시트 생성 금지. 기존 `css/` 재사용.
- 신규 JS 필요 시 `js/business-immigration.js` 1개만 생성 (폼 로직·진행 단계 라벨 맵핑).

---

## 2. URL 라우팅

GitHub Pages 정적 라우팅 기준.

| 경로 | 파일 |
|---|---|
| `/business-immigration.html` | 사업이민 랜딩 (언어는 쿼리/로컬스토리지로 제어) |
| `/business-immigration-request.html` | 사업이민 상담 신청 폼 |

### 언어 전환
- 기존 i18n 방식 그대로. URL 변경 없이 `localStorage.language` 키 기반.
- 랜딩 진입 시 기본값 `en` (기존 원칙 유지).

---

## 3. 랜딩 페이지 구조 (`business-immigration.html`)

### 3-1. 베이스 원본
기존 `index.html`을 복제 후 수정하는 방식으로 구현. 기존 `index.html`의 다음 블록을 그대로 재활용.

- 상단 헤더 (로고·언어 드롭다운·Google 로그인·관리자)
- 법무법인 신뢰 배지 + 변호사 6인 캐러셀 블록 (그대로 유지, 통역사·전문가 추가 없음)
- 뉴스 & 인사이트 블록
- 나의 신청 내역 블록 (라벨만 "나의 프로젝트 진행 현황"으로 교체)
- 푸터

### 3-2. 섹션 구성 (위→아래)

**섹션 1 — 상단 헤더**
기존 `index.html`과 동일. 변경 없음.

**섹션 2 — 히어로 + 단일 CTA**
기존 `index.html`의 3개 카드(Immigration Legal Services / Free Pre-Consultation / Visa Diagnosis)를 단일 CTA 블록으로 교체.

레이아웃:
- 좌측: 헤드라인 + 서브헤드 + CTA 버튼
- 우측: 대표 이미지 영역 (이미지 자산은 추후 전달, 임시로 기존 이미지 중 하나 placeholder)

콘텐츠 (번역 키 기준):
```
data-i18n="biz.hero.headline"    → "한국에서 사업을 시작하고 이주하기 위한 통합 법률서비스"
data-i18n="biz.hero.subhead"     → "해외에서 한국 이주를 검토하는 외국인을 대상으로, 프로젝트 탐색·규제 자문·비자 취득을 순차 수행합니다."
data-i18n="biz.hero.cta"         → "사업이민 사전 상담 신청"
```

CTA 버튼 동작:
- 클릭 시 `/business-immigration-request.html` 이동.
- Google 로그인 상태가 아니면 로그인 모달 선표시 후 이동.

**섹션 3 — 법무법인 신뢰 배지 + 변호사 캐러셀**
기존 `index.html` 블록 그대로 복제. 통역사·전문가 추가 없음.
- 법무부 등록 출입국민원대행기관 배지 (#25-SM-RG-063)
- 변호사 6인 캐러셀 (S.H. Bong, J.W. Min, D.H. Nam, S.C. Kim, Y.H. Hwang, D.G. Shin)

상단 한 문장 설명은 사업이민용 번역 키로 교체:
```
data-i18n="biz.badge.description" → "법무법인 로연 출입국이민지원센터는 외국인의 한국 사업이민 법률서비스를 제공합니다."
```

**섹션 4 — 서비스 명세 5단계 카드**
기존 `index.html`의 "출입국 민원 대행 6카테고리" 블록 자리에 배치. 5그리드 레이아웃. 각 카드는 헤드 + 본문 1~2문장 구조.

```
[카드 1] 사전 상담
  biz.step1.title   → "사전 상담"
  biz.step1.body    → "쓰레드를 통해 귀하의 국적, 자금 조달 방식, 이주 시점, 가족 구성을 확인하고 한국 사업이민 경로 개요를 안내합니다."

[카드 2] 본 상담
  biz.step2.title   → "본 상담"
  biz.step2.body    → "이민 경로 상세 자문, 사업 개시 절차 및 예산 배정 구조화, 주요 리스크 안내, 비자 발급 등 출입국 행정 안내를 제공합니다."

[카드 3] 착수
  biz.step3.title   → "착수"
  biz.step3.body    → "프로젝트 설계, 오퍼레이션 설계, 실사 방문 코디네이션, 최종 점검 회의를 수행합니다."

[카드 4] 잔금
  biz.step4.title   → "잔금"
  biz.step4.body    → "계약 체결 지원, 외국인 투자 절차, 행정 등록 감독, 비자 취득, 동반가족 비자를 수행합니다."

[카드 5] 사후관리
  biz.step5.title   → "사후관리"
  biz.step5.body    → "주거 임대차 검토, 가맹본부-점주 분쟁 조정, 근로계약 자문, 체류기간 연장, 영주권 전환 자문을 별도 계약으로 제공합니다."
```

카드 클릭 동작: 각 카드는 CTA로 작동하지 않음(정보 제공용). 페이지 하단 CTA로 유도.
주의: 어느 카드에도 가격·비용·기간 언급 금지.

**섹션 5 — 뉴스 & 인사이트**
기존 `index.html`의 뉴스 블록 구조 재활용. 단, 다음 차이점 적용:
- 기본 카테고리 필터를 "사업·투자"로 설정.
- "더 많은 글 보기" 버튼 링크를 `/blog.html?category=사업·투자`로 지정 (기존 카테고리 필터 URL 컨벤션 따름).
- 카드 3~4개 노출.

**섹션 6 — 나의 프로젝트 진행 현황**
기존 `index.html`의 "나의 신청 내역" 블록 재활용. 다음만 수정.

라벨 교체:
- 블록 제목: "나의 신청 내역" → "나의 프로젝트 진행 현황"
- 비로그인 안내 문구: `biz.dashboard.guest` → "로그인하시면 나의 프로젝트 진행 현황, 상담 내역, 쓰레드를 확인하실 수 있습니다."

**진행 단계 바 라벨 맵핑**:
사업이민 쓰레드는 `status='active'` 고정이며, 진행 단계는 신규 컬럼 `business_immigration_status`가 추적합니다. 8단계 값은 섹션 14-2-2·섹션 6-2 참조.

실제 UI에서는 압축된 **5단계 바**(사전 상담 / 본 상담 / 착수 / 잔금 / 사후관리)로 시각화하고, 각 단계 내부 세부 스텝은 쓰레드 상세 페이지에서 노출.

**분기 로직**:
- 로그인 사용자의 쓰레드가 `request_type='business_immigration'`인 경우 사업이민용 5단계 바 표시.
- `request_type='general'` 쓰레드는 기존 5단계 바(`payment`→`document`→`processing`→`completed`→`archived`) 유지.

**섹션 7 — 푸터**
기존 `index.html` 푸터 재활용. 다음 수정:
- "서비스 가격표" 링크 제거 (사업이민 랜딩 전용 푸터).
- 나머지(개인정보처리방침·이용약관·환불규정·법무법인 로연 링크·광고책임변호사 남도현·민준우 표기)는 그대로 유지.

### 3-3. 변호사광고규칙 체크포인트
구현 시 다음 요건 자동 충족되도록 배치.
- 푸터에 "법무법인 로연" 표기 + 광고책임변호사 남도현·민준우 표기 (기존 유지)
- 가격·수임료 표기 전면 제거
- "비자가 반드시 나옵니다" 류 결과 보장·예측 표현 금지 → 카피 확정 시 검수 필요
- 변호사 프로필의 공직 재직 사실 표기 시 부당 영향력 암시 없는 형태만 허용 (기존 캐러셀 그대로이므로 추가 조치 불필요)

---

## 4. 상담 신청 페이지 (`business-immigration-request.html`)

### 4-1. 베이스 원본
기존 `consultation-request.html` 복제 후 필드·카피 수정.

### 4-2. 폼 필드

| 필드명 | 타입 | 필수 | 번역 키 |
|---|---|---|---|
| 국적 | select (국가 리스트) | 필수 | `biz.form.nationality` |
| 현재 거주국 | select (국가 리스트) | 필수 | `biz.form.residence_country` |
| 관심 비자 유형 | radio (D-9-4 / D-9-5 / 잘 모름) | 필수 | `biz.form.visa_type` |
| 가족 구성 — 본인 외 | checkbox (배우자 / 자녀 / 부모) | 선택 | `biz.form.family` |
| 자녀 수 | number (0~10) | 조건부 (자녀 체크 시) | `biz.form.children_count` |
| 예상 이주 시점 | select (3개월 내 / 6개월 내 / 1년 내 / 1년 이상 / 미정) | 필수 | `biz.form.timeline` |
| 자유 메시지 | textarea (모국어 입력 가능) | 선택 | `biz.form.message` |
| 이메일 | email (Google 로그인 시 자동 채움) | 필수 | 기존 재활용 |
| 연락 가능 수단 | radio (이메일 / 쓰레드 / 전화) | 필수 | `biz.form.contact_method` |

자금 관련 필드 없음 (가격 언급 금지 원칙에 따라 폼 단계에서도 자금 규모 질문 없음. 본 상담에서 확인).

### 4-3. 제출 동작
- Google 로그인 상태 강제 (로그인하지 않은 경우 로그인 유도).
- 단일 RPC 호출 `create_business_immigration_request`로 **트랜잭션 처리** (상세는 섹션 14-8-4):
  - `consultation_requests` 레코드 생성 (`request_type='business_immigration'`)
  - `threads` 레코드 생성 (`request_type='business_immigration'`, `status='active'`, `business_immigration_status='pre_consultation'`)
  - 양방향 연결 자동 수행
- 제출 직후 환영 메시지 INSERT (사업이민 전용 템플릿).
- 자동 회신 메시지 표시:
  ```
  biz.form.auto_reply → "상담 신청이 접수되었습니다. 담당자가 쓰레드로 회신드립니다."
  ```
- 제출 완료 후 `/thread-general-v2.html?id={thread_id}`로 직행.
- RPC 실패 시 토스트 + 재시도 버튼(섹션 14-8-5 참조). 재시도 시 중복 없음(전체 롤백).

### 4-4. 결제 관련
- 이 페이지에서는 결제 없음. 사전 상담은 무상.
- 기존 `consultation-request.html`에 결제 관련 로직이 있다면 사업이민 버전에서 완전 제거.

---

## 5. 블로그 처리

### 5-1. 카테고리
새 카테고리 생성 금지. 기존 "사업·투자" 카테고리를 그대로 사용.
블로그 관리자 페이지(`admin-blog.html`)에서 사업이민 글 작성 시 카테고리를 "사업·투자"로 선택하면 자동 연결.

### 5-2. 초기 글 수
런칭 시점에 언어별 최소 3편 = 총 12편(ko·en·vi·zh × 3).
블로그 콘텐츠 자체는 본 명세 범위 밖(카피·콘텐츠는 별도 전달 예정).
Claude Code는 빈 글 템플릿 12개만 생성하거나, 카테고리 필터가 정상 작동하도록 확인만 수행.

### 5-3. 필터 URL 컨벤션
`/blog.html?category=사업·투자` 형식 유지.
사업이민 랜딩의 뉴스 블록 "더 많은 글 보기" 버튼이 이 URL로 연결되는지 확인.

---

## 6. 쓰레드 상태머신 (옵션 B — 사업이민 전용 상태 추가)

### 6-1. 기존 상태 (변경 없음)

```
payment → document → processing → completed → archived
```

일반 출입국 민원 대행 쓰레드에 계속 적용. 본 섹션 14에서 기존 `threads.status` 컬럼을 건드리지 않음.

### 6-2. 신규 사업이민 상태 (8단계)

```
pre_consultation       (사전 상담)
  ↓
detailed_consultation  (본 상담)
  ↓
stage1_engaged         (착수 — 프로젝트 설계·오퍼레이션 설계·실사 방문)
  ↓
stage1_completed       (최종 점검 회의 종료, Stage 2 진행 결정 대기)
  ↓
stage2_engaged         (잔금 — 계약 체결·투자 신고·행정 등록·비자 취득)
  ↓
visa_issued            (D 비자 발급 완료)
  ↓
aftercare              (사후관리 — 별도 계약 시에만 진입)
  ↓
archived               (종료)
```

### 6-3. 구현
Supabase DB의 `threads` 테이블에 **신규 컬럼 `business_immigration_status` (text)** 추가. 사업이민 쓰레드의 `status`는 `'active'` 고정이며, 실제 진행 단계는 `business_immigration_status`에서 추적. DDL 및 CHECK 제약은 **섹션 14-2 참조**.

쓰레드 생성 시 `request_type`이 `business_immigration`이면 위 8개 상태 중 하나, 그렇지 않으면 기존 5개 상태 유지. 관리자 대시보드(`admin-thread.html`)에서는 `request_type`에 따라 다른 상태 선택지 UI 표시(섹션 7-1 참조).

### 6-4. 상태 전이 권한
- 고객: 자기 쓰레드 상태 조회만 가능.
- 관리자: 모든 상태 수동 전환 가능.
- 자동 전이 없음(전 상태 관리자 수동 관리).

### 6-5. 결제와의 연계
Stage 1 착수 결제(25%)가 완료되면 상태를 `pre_consultation` → `detailed_consultation` 또는 `stage1_engaged`로 수동 전환.

결제 시스템은 기존 Toss Payments Global 연동 재활용. 다만 사업이민 결제는 액수가 건별 상이하므로 가격표 기반 결제가 아닌 수동 견적·인보이스 발행 방식 필요.

**결제 시스템 연동은 본 섹션 14 구현 범위 밖이며 후속 작업으로 분리**. 본 명세에서 Claude Code는 상태머신·쓰레드·RPC만 구현하고, 결제 연동은 별도 지시서로 진행.

---

## 7. 대시보드 UI 조정

### 7-1. 관리자 대시보드 (`admin-dashboard.html`)
- 사업이민 쓰레드를 필터링할 수 있는 유형 필터 추가 (일반 / 협약 대학 / 사업이민).
- 사업이민 쓰레드의 경우 신규 상태값(`business_immigration_status`) 표시.
- 목록 뷰에 `request_type` 뱃지 추가.
- 기존 `status` 필터 쿼리는 `request_type='general'` 조건을 **추가**하여 동작 보존(섹션 14-2-4 참조).

### 7-2. 사용자 대시보드 (`index.html` + `business-immigration.html` 내 블록)
- 로그인 사용자의 쓰레드 중 `request_type === 'business_immigration'`인 것이 있으면 별도 섹션으로 묶어 표시.
- 진행 단계 바는 5단계 압축 뷰 (사전 상담 / 본 상담 / 착수 / 잔금 / 사후관리).
- 상세는 쓰레드 페이지 진입 시 풀 8단계 흐름(`business_immigration_status` 기반) 표시.

---

## 8. i18n 번역 키 추가

### 8-1. 추가할 네임스페이스
`js/translations.js`에 `biz.*` 네임스페이스 신규 추가.

### 8-2. 주요 키 목록 (부분 발췌 — 전체 목록은 섹션 14-9-5)

```
biz.hero.headline
biz.hero.subhead
biz.hero.cta
biz.badge.description
biz.step1.title, biz.step1.body
biz.step2.title, biz.step2.body
biz.step3.title, biz.step3.body
biz.step4.title, biz.step4.body
biz.step5.title, biz.step5.body
biz.news.heading
biz.dashboard.heading
biz.dashboard.guest
biz.dashboard.progress.stage1
biz.dashboard.progress.stage2
biz.dashboard.progress.stage3
biz.dashboard.progress.stage4
biz.dashboard.progress.stage5
biz.form.title
biz.form.nationality
biz.form.residence_country
biz.form.visa_type
biz.form.family
biz.form.children_count
biz.form.timeline
biz.form.message
biz.form.contact_method
biz.form.submit
biz.form.auto_reply
```

섹션 14-9-5에서 본 섹션의 키 + 14-4 프로필 필드 라벨 + 14-7 배너·welcome + 14-8 에러 키를 합쳐 **전체 manifest 키 목록**을 고정.

### 8-3. 초기 값
- 한국어(ko): 본 명세 섹션 3·4에 명시된 확정 카피를 그대로 삽입.
- 영어·베트남어·중국어·일본어·몽골어·태국어(en·vi·zh·ja·mn·th): **섹션 14-9 스텁 운용 규칙**에 따라 en 번역을 우선 삽입하고, 그 외는 en 값을 복제해 `TRANSLATION_PENDING` 주석 표기. 실번역 도착 시 일괄 치환.

---

## 9. 데이터 모델 변경

본 섹션은 개괄이며, 실제 DDL·RLS는 **섹션 14**에서 전문(全文) 기술됩니다.

### 9-1. Supabase 테이블 수정

**`consultation_requests`** — 신규 CREATE. 콘솔 확인 결과 테이블 미실존 확정. 기존 `consultation-request.html` 일반 경로는 `threads` 직접 INSERT로 동작 중이며(14-0-2 추가 발견 E), 이번 작업에서 건드리지 않음. 사업이민 경로 전용 신규 테이블로 생성하며 DDL은 **섹션 14-1-2** 참조.

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | `auth.users(id)` FK |
| `request_type` | text | 기본값 `'general'`, `'general'`\|`'business_immigration'` CHECK |
| `thread_id` | uuid | 순환 FK 회피로 인덱스만, `threads.id` 참조 |
| `nationality` | text | 사업이민 스냅샷 |
| `residence_country` | text | 사업이민 스냅샷 |
| `visa_type_interest` | text | `D-9-4`\|`D-9-5`\|`undecided` CHECK |
| `family_composition` | jsonb | |
| `children_count` | integer | |
| `timeline` | text | 5개 값 CHECK |
| `message` | text | 자유 서술 |
| `contact_method` | text | `email`\|`thread`\|`phone` CHECK |
| `email` | text | 제출 시점 스냅샷 |
| `created_at` | timestamptz | |

**`business_immigration_profiles`** — 신규 테이블. 29개 필드. 상세는 **섹션 14-1-1 · 14-4** 참조.

**`threads`** — 신규 컬럼 2개 추가. 기존 `status` 컬럼은 유지(변경 없음).

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `request_type` | text | 기본값 `'general'`, `'general'`\|`'business_immigration'` CHECK |
| `business_immigration_status` | text | NULL 허용 (일반 쓰레드는 NULL), 8개 값 CHECK — 섹션 14-2 참조 |

기존 `status` 컬럼은 그대로 유지. 사업이민 쓰레드는 `status='active'` 고정(기존 status 허용값 집합에 `'active'` 추가가 이미 되어 있으므로 ENUM 변경 불필요 — text 컬럼 확정).

**`system_errors`** — 신규 테이블. 쓰레드 생성 실패 등 시스템 에러 추적. 상세는 **섹션 14-8-3** 참조.

### 9-2. RLS 정책
기존 RLS 정책(`customer`·`partner_admin`·`super_admin`) 그대로 적용. 사업이민 전용 추가 정책 없음. 신규 테이블 3개·신규 Storage 버킷 1개의 정책은 섹션 14-1·14-3·14-8-3에서 전문 기술.

### 9-3. 마이그레이션
`migrations/` 디렉터리에 신규 SQL 파일 생성. 파일명 규칙은 기존 컨벤션 따름.

본 명세 구현 시 생성할 마이그레이션 파일(섹션 14 부록 참조):
```
migrations/20260420_create_business_immigration_profiles.sql
migrations/20260420_create_biz_profile_completed_trigger.sql
migrations/20260420_create_consultation_requests.sql
migrations/20260420_alter_threads_add_business_immigration.sql
migrations/20260420_create_business_immigration_storage.sql
migrations/20260420_create_system_errors.sql
migrations/20260420_create_business_immigration_rpc.sql
```

---

## 10. 변경되지 않는 것 (명시)

다음은 건드리지 않음. Claude Code는 기존 그대로 유지.
- 기존 `index.html` (사업이민 랜딩과 별도 페이지)
- 기존 31개 페이지의 동작
- 기존 서비스 카테고리(6개)·서비스 데이터(`data/services.json`)
- 협약 대학 30% 할인 정책·관련 페이지(`login-chosun.html` 등)
- 가격표(`price-list.html`)
- 결제 시스템 연동 (Toss Payments Global 등) — 사업이민 결제는 후속 작업으로 분리
- 보안·RLS·암호화 정책 (기존 정책은 섹션 14-0-4의 "해결하지 않는 범위" 참조)
- CI 워크플로우 (`validate.yml`·`build-blog.yml`)의 기존 스텝 (신규 스텝 추가는 섹션 14-9-8)
- 호스팅·도메인·CNAME
- 기존 `consultation-request.html` 일반 상담 경로(`threads` 직접 INSERT 구조 유지)
- 기존 welcome 메시지의 D-10-1·일반 경로 분기(섹션 14-7-5)

---

## 11. 테스트·검증 체크리스트 (개괄)

전체 검증 항목은 **섹션 14-10**에서 11개 카테고리·60+ 포인트로 상세 기술. 본 섹션은 개괄만.

### 기능 테스트
- [ ] `/business-immigration.html` 접근 시 정상 렌더링 (4개 언어 전환 작동)
- [ ] 히어로 CTA 클릭 시 상담 신청 페이지로 이동
- [ ] 로그인하지 않은 상태에서 CTA 클릭 시 로그인 유도
- [ ] 변호사 캐러셀·뉴스 블록·대시보드 블록 정상 동작
- [ ] 서비스 5단계 카드 카피 정확히 노출
- [ ] 푸터에서 "서비스 가격표" 링크 제거 확인
- [ ] `/business-immigration-request.html` 폼 제출 정상 작동 (RPC 트랜잭션 호출)
- [ ] 제출 후 Supabase에 `request_type: business_immigration` 레코드 생성 확인
- [ ] 쓰레드 자동 생성 및 상태 `pre_consultation` 확인
- [ ] 관리자 대시보드에서 사업이민 쓰레드 필터링·상태 전환 가능

### 코드 품질
- [ ] 기존 `npm run validate` 통과 (HTML·JS 문법 검증)
- [ ] 신규 `npm run validate:biz-i18n` 통과
- [ ] 기존 컨벤션(루트 HTML 배치·i18n 키·CSS 파일명) 준수
- [ ] 신규 의존성 추가 없음 (`package.json` dependencies 변경 없음)

### 변호사광고규칙
- [ ] 사업이민 랜딩 어디에도 가격·수임료·비용 언급 없음
- [ ] 결과 예측·보장 표현 없음 (카피 검수는 본 명세 범위 밖이나 템플릿·라벨에서 확인)
- [ ] 광고책임변호사 표기 유지

---

## 12. 전달 방식

Claude Code는 다음 순서로 작업 진행.

1. 저장소 탐색하여 기존 `index.html`·`consultation-request.html` 구조 확인 (완료 — 진단 단계에서 수행)
2. 본 명세 기반 작업 계획 수립 (수정·신규 파일 목록, 예상 단계) (완료)
3. 선생님(안태민)에게 작업 계획 확인 요청 (완료)
4. 승인 후 구현 진행
5. 구현 완료 후 섹션 14-10 체크리스트 자체 검증
6. 커밋 전 선생님에게 최종 diff 또는 PR 확인 요청

### 커밋 단위
- 파일 단위 또는 기능 단위로 작은 커밋 유지.
- 큰 일괄 커밋 지양.
- 마이그레이션 SQL 7건은 **개별 커밋 권장**(롤백 용이성).

### 개발자 프리퍼런스 반영
- 안태민(PM)은 개발자가 아님. 코드 설명은 기획자에게 설명하듯이.
- 코드 작성·커밋 전 변경 사항을 간단히 정리해 확인 요청.
- 작은 수정 반복 회피를 위해 QA를 상시 수행.

---

## 13. 확정되지 않은 항목 (후속 전달 예정)

본 섹션 14 확정으로 데이터 스키마·Storage·RPC·배너·i18n 운용은 모두 확정. 아래 항목만 후속 전달·별도 작업으로 남아 있음.

- 영어·베트남어·중국어 번역 카피 (한국어 마스터 카피 확정 완료, 번역 주입만 별도 작업)
- 블로그 초기 글 12편 콘텐츠
- 대표 이미지 자산 (히어로 우측)
- 결제 시스템 연동 (Stage 1·Stage 2 분할 결제, 수동 견적·인보이스 방식) — 별도 작업으로 분리

---

이 문서는 사업이민 섹션 신규 추가 작업의 **단일 진실 공급원**입니다. 추가 결정이 필요한 항목은 선생님에게 확인 후 진행해 주십시오.

---

# 14. 사업이민 전용 데이터 스키마 및 Storage 분리

## 14-0. 진단 결과 요약 (PROJECT_KNOWLEDGE.md 섹션 7 인용 + 콘솔 확인 업데이트)

### 14-0-1. PROJECT_KNOWLEDGE.md 섹션 7 원문 (5가지 발견사항)

**발견 1 — `on_auth_user_created` 트리거 저장소에 존재하지 않음**
저장소 SQL 파일(`sql/*`·`migrations/*`) 어디에도 정의가 없음. 프로필 레코드는 클라이언트 측 `createUserProfile()` upsert로만 생성됨(`js/supabase-client.js:171-192`).

**발견 2 — 프로필 완성도 판정이 `passport_number` 단일 필드**
`hasProfile` 판정이 `passport_number` 한 필드의 NULL 여부로 결정됨(`js/supabase-client.js:972-974`). `profile-submit.html` 폼에 `passportNumber` 입력 필드가 보이지 않아 구조적 버그 가능성.

**발견 3 — Storage RLS가 SQL 저장소에 없음**
`storage.objects` 대상 `CREATE POLICY`가 저장소 전체에 없음. 형상관리 밖에 있는 상태.

**발견 4 — 쓰레드 생성 실패 조용한 무시**
Edge Function `confirm-payment`은 결제 승인 성공 후 `threads` INSERT 실패 시 결제를 성공 처리(`confirm-payment/index.ts:263-271`). 사업이민 쓰레드는 반드시 실패 시 사용자 피드백 + 관리자 알림 구현 필요.

**발견 5 — i18n 7개 언어 수동 동기화 필요**
`js/translations.js`는 7개 언어 각자 독립 객체(총 8,385줄). 새 네임스페이스 도입 시 7개 언어 × 키 개수 수동 편집 필요. 미추가 키는 `ko` 폴백 동작.

### 14-0-2. 콘솔 확인 결과 업데이트 (확인 완료)

| # | 진단 결과 | 콘솔 확인 결과 | 상태 |
|---|---|---|---|
| 발견 1 | 저장소에 트리거 없음 → 콘솔 수동 설정 "가능성" | **확인 완료**: `on_auth_user_created` 트리거 실존. `handle_new_user()` 함수가 `profiles`에 `id`/`email`/`name`/`role='customer'`/`created_at`/`updated_at` 삽입, `ON CONFLICT (id) DO NOTHING` | 형상관리 밖 지속 |
| 발견 3 | SQL 저장소에 Storage RLS 없음 → "가능성" | **확인 완료**: `storage.objects`에 12개 정책 실존 (4개 버킷에 걸쳐) | 형상관리 밖 지속 |
| 추가 발견 A | — | **확인 완료**: `documents`·`passports` 버킷 존재하지만 파일 0개 (RLS 정책은 각 3개씩 잔존) | 정리 대상 후보 |
| 추가 발견 B | — | **확인 완료**: "미사용"으로 지목된 6개 중 `avatars`·`blog`·`thread_files`·`user_avatars` 4개는 애초에 존재하지 않음 | 문서 보정 완료 |
| 추가 발견 C | — | **확인 완료**: `profile-documents` admin SELECT 정책의 `EXISTS` 서브쿼리가 `objects.id = auth.uid()` 조건 사용. 일반적 admin 검증 패턴과 구조 다름 | 관찰 사실 기록 |
| 추가 발견 D | — | **확인 완료**: `thread_documents`의 SELECT/INSERT 정책은 `bucket_id` 매칭만 검사하고 경로 소유권 검증 없음 | 관찰 사실 기록 |
| 추가 발견 E | — | **확인 완료**: 기존 `consultation-request.html`은 별도 상담 테이블 없이 `createThread()`를 통해 `threads` 테이블에 직접 INSERT 함 (`consultation-request.html:780-787`). 일반 상담은 `is_consulting:true`·`organization:'general'` 플래그로 구분. `consultation_requests`·`contact_requests`·`inquiries` 등 테이블은 코드베이스 전체에서 참조 없음 | 향후 일반 경로 리팩토링 시 활용 |

**콘솔 쿼리 3건 결과 (확정)**:
- `user_role` ENUM 허용값: `customer`, `partner_admin`, `super_admin`
- `consultation_requests` 테이블 실존 여부: **false** → 본 섹션 14에서 신규 CREATE
- `threads.status` 컬럼 타입: `text` → `ALTER TYPE` 불필요, text 컬럼 DDL 그대로 적용

### 14-0-3. 본 섹션 14가 해결하는 범위

- 사업이민 전용 **데이터 스키마 신설** (기존 `profiles`·`threads` 구조에 최소 영향)
- 사업이민 전용 **Storage 버킷 신설** (RLS 정책을 SQL 마이그레이션 형태로 형상관리)
- **쓰레드 생성 실패 처리** (발견 4) 개선 — 단, `confirm-payment` Edge Function 수정은 결제 연동 작업에 포함되므로 범위 밖. 본 섹션은 **사업이민 상담 신청 경로의 실패 처리**만 정의
- **프로필 완성도 판정**을 사업이민 한정 `profile_completed` 불리언 컬럼 도입으로 해결 (발견 2의 구조적 모호성 우회)
- **i18n 7개 언어 스텁 운용 방침** 확정 (발견 5 대응)

### 14-0-4. 본 섹션 14가 해결하지 않는 범위 (명시)

- 기존 `handle_new_user()` 트리거 수정 (저장소 편입 여부는 별도 결정)
- 기존 Storage RLS 정책 정리 (`documents`·`passports` 버킷 삭제 등)
- `profile-documents` admin 정책의 `objects.id = auth.uid()` 구조 보정
- `thread_documents` SELECT/INSERT 정책에 경로 제약 추가
- `confirm-payment` Edge Function의 L263-271 수정 (결제 연동 작업 범위)

위 5개 항목은 **후속 별도 작업**으로 분리. 본 섹션 14 구현 시 기존 코드·정책은 그대로 유지.

## 14-1. 신규 테이블 DDL

### 14-1-1. `business_immigration_profiles` (신규 테이블)

사업이민 지원자의 사전 상담용 프로필. 기존 `profiles` 테이블은 수정하지 않고, 사업이민 전용 정보를 별도 테이블로 분리합니다.

**설계 원칙**
- `user_id`를 기본키(PK) 겸 `auth.users(id)` 외래키로 사용 → 사용자 1인당 사업이민 프로필 1건.
- `profile_completed`는 BEFORE 트리거로 자동 계산(섹션 14-6 참조).
- `updated_at`은 UPDATE 트리거로 자동 갱신.

```sql
-- migrations/20260420_create_business_immigration_profiles.sql

CREATE TABLE public.business_immigration_profiles (
  -- 메타
  user_id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed            boolean     NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),

  -- 기본 정보 (8)
  last_name_en                 text        NOT NULL,
  first_name_en                text        NOT NULL,
  full_name_native             text,
  nationality                  text        NOT NULL,
  passport_number              text        NOT NULL,
  passport_expiry              date        NOT NULL,
  birth_date                   date        NOT NULL,
  gender                       text        NOT NULL
                                 CHECK (gender IN ('male','female','other')),

  -- 거주·연락 (6)
  residence_country            text        NOT NULL,
  home_address                 text,
  home_phone                   text,
  email                        text        NOT NULL,
  native_language              text        NOT NULL,
  preferred_contact_method     text        NOT NULL
                                 CHECK (preferred_contact_method IN ('email','thread','phone')),

  -- 가족 구성 (1)
  family_composition           jsonb,

  -- 이민 의도 (5)
  visa_type_interest           text        NOT NULL
                                 CHECK (visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  timeline                     text
                                 CHECK (timeline IS NULL
                                        OR timeline IN ('3months','6months','1year','over1year','undecided')),
  preferred_industry           text,
  preferred_location           text,
  funding_source               text,

  -- 배경 (5)
  education_background         text,
  work_experience              text,
  korea_visit_history          text,
  korean_language_proficiency  text,
  criminal_record              boolean
);

-- 인덱스
CREATE INDEX idx_biz_profiles_nationality
  ON public.business_immigration_profiles(nationality);
CREATE INDEX idx_biz_profiles_visa_type_interest
  ON public.business_immigration_profiles(visa_type_interest);
CREATE INDEX idx_biz_profiles_profile_completed
  ON public.business_immigration_profiles(profile_completed)
  WHERE profile_completed = false;  -- 미완 프로필 대시보드 조회용 부분 인덱스

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_biz_profiles_set_updated_at
  BEFORE UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS 활성화
ALTER TABLE public.business_immigration_profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 고객은 자기 레코드만 SELECT/INSERT/UPDATE
CREATE POLICY biz_profiles_owner_select
  ON public.business_immigration_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY biz_profiles_owner_insert
  ON public.business_immigration_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY biz_profiles_owner_update
  ON public.business_immigration_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 정책: super_admin은 모두 SELECT/UPDATE
CREATE POLICY biz_profiles_super_admin_all
  ON public.business_immigration_profiles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ));
```

**콘솔 확인 결과**: `user_role` ENUM 허용값은 `customer`, `partner_admin`, `super_admin` 3개로 확정. 위 DDL의 `'super_admin'::user_role` 캐스팅 그대로 사용.

### 14-1-2. `consultation_requests` (신규 테이블)

사업이민 상담 신청 시점의 **스냅샷**을 저장합니다. SOT 원칙(확정사항 2번)에 따라 `nationality`는 여기에 제출 시점 값이 고정되고, 이후 변경되지 않습니다.

**콘솔 확인 결과**: `consultation_requests` 테이블은 DB에 **존재하지 않음**. 아래 `CREATE TABLE` 마이그레이션 그대로 적용. (기존 `consultation-request.html`은 별도 상담 테이블 없이 `threads`에 직접 INSERT 하는 구조 — 14-0-2 추가 발견 E 참조.)

```sql
-- migrations/20260420_create_consultation_requests.sql

CREATE TABLE public.consultation_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type             text NOT NULL DEFAULT 'general'
                              CHECK (request_type IN ('general','business_immigration')),
  thread_id                uuid,  -- threads(id) 참조(순환 외래키 회피 위해 FK 없이 인덱스만)

  -- 사업이민 전용 스냅샷 필드 (9개)
  nationality              text,
  residence_country        text,
  visa_type_interest       text
                              CHECK (visa_type_interest IS NULL
                                     OR visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  family_composition       jsonb,
  children_count           integer,
  timeline                 text
                              CHECK (timeline IS NULL
                                     OR timeline IN ('3months','6months','1year','over1year','undecided')),
  message                  text,
  contact_method           text
                              CHECK (contact_method IS NULL
                                     OR contact_method IN ('email','thread','phone')),
  email                    text,

  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_consult_requests_user_id      ON public.consultation_requests(user_id);
CREATE INDEX idx_consult_requests_thread_id    ON public.consultation_requests(thread_id);
CREATE INDEX idx_consult_requests_request_type ON public.consultation_requests(request_type);

ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY consult_requests_owner_select
  ON public.consultation_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY consult_requests_owner_insert
  ON public.consultation_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY consult_requests_super_admin_all
  ON public.consultation_requests
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));
```

## 14-2. 기존 `threads` 테이블 컬럼 추가 DDL

확정사항 4번(별도 컬럼 `business_immigration_status` 신설)에 따라 `threads` 테이블에 **2개 컬럼**을 추가합니다. 기존 `status` 컬럼의 기존 값·의미는 보존되며, 사업이민 쓰레드는 `status='active'`로 고정되고 실제 진행 단계는 `business_immigration_status`에서 추적됩니다.

**콘솔 확인 결과**: `threads.status` 컬럼 타입은 **`text`**로 확정 (ENUM 아님). 아래 DDL 그대로 적용. `ALTER TYPE` 불필요.

### 14-2-1. DDL

```sql
-- migrations/20260420_alter_threads_add_business_immigration.sql

ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS request_type                text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS business_immigration_status text;

ALTER TABLE public.threads
  ADD CONSTRAINT threads_request_type_check
    CHECK (request_type IN ('general','business_immigration')),
  ADD CONSTRAINT threads_biz_status_check
    CHECK (
      business_immigration_status IS NULL
      OR business_immigration_status IN (
           'pre_consultation',
           'detailed_consultation',
           'stage1_engaged',
           'stage1_completed',
           'stage2_engaged',
           'visa_issued',
           'aftercare',
           'archived'
         )
    );

-- 사업이민 쓰레드는 status='active' 고정 → 기존 status 값과 공존 (text 컬럼이므로 별도 CHECK 불필요)

-- 인덱스
CREATE INDEX idx_threads_request_type
  ON public.threads(request_type);
CREATE INDEX idx_threads_biz_status
  ON public.threads(business_immigration_status)
  WHERE business_immigration_status IS NOT NULL;
```

### 14-2-2. 컬럼 의미 정의

| 컬럼 | 의미 | 허용값 | 기본값 | NULL 허용 |
|---|---|---|---|---|
| `request_type` | 쓰레드 타입 구분자 | `general` \| `business_immigration` | `general` | No |
| `business_immigration_status` | 사업이민 프로젝트 단계 | (위 8개 값) | — | Yes (일반 쓰레드일 때 NULL) |
| `status` (기존) | 처리 단계 | 기존 값들 + `active` | 기존 유지 | 기존 유지 |

### 14-2-3. 데이터 정합성 규칙

애플리케이션 레벨에서 보장해야 할 규칙(DB 제약으로는 표현 복잡, 코드·코드 리뷰로 강제):

- `request_type = 'business_immigration'` → `status = 'active'`로 고정, `business_immigration_status`는 NOT NULL.
- `request_type = 'general'` → `business_immigration_status`는 NULL, `status`는 기존 값(`payment`/`document`/`processing`/`completed`/`archived` 등).

필요 시 BEFORE INSERT/UPDATE 트리거로 보강 가능. 초기에는 코드 리뷰로 보장하고, 정합성 문제가 관찰되면 트리거 도입.

### 14-2-4. 기존 관리자 쿼리 호환성

`admin-dashboard.html`·`admin-thread.html` 등의 기존 SQL/필터 중 `status` 기준 조회는 모두 `request_type='general'` 조건을 **추가**하여 동작 보존. 본 스펙 구현 시 관리자 쿼리 수정 항목은 14-7·14-10에서 상세.

## 14-3. 신규 Storage 버킷 구조 및 RLS 정책

### 14-3-1. 신규 버킷 개요

| 항목 | 값 |
|---|---|
| 버킷 이름 | `business-immigration-documents` |
| `public` | `false` |
| 경로 컨벤션 | `{user_id}/{document_type}/{timestamp}_{sanitizedFileName}` |
| `document_type` 허용값 | `passport` \| `criminal_record` \| `education` \| `family` \| `funding` \| `contracts` |
| file_size_limit | 50 MB (50 × 1048576 bytes) |
| allowed_mime_types | `application/pdf`, `image/jpeg`, `image/png`, `image/heic` |

**설계 근거(콘솔 관찰 반영)**:
- 기존 `thread_documents` 버킷의 SELECT/INSERT 정책은 `bucket_id` 매칭만 하고 경로 소유권 검증이 없음(진단 발견 D). 본 신규 버킷은 **모든 작업(SELECT/INSERT/UPDATE/DELETE)에 `{user_id}/...` 경로 소유권 검증 적용**으로 이 패턴을 따르지 않음.
- 기존 `profile-documents` 버킷의 admin 정책은 `objects.id = auth.uid()` 구조(진단 발견 C)를 사용. 본 신규 버킷은 `profiles.id = auth.uid() AND profiles.role = 'super_admin'` 표준 패턴 사용.

### 14-3-2. 마이그레이션 SQL (전문)

```sql
-- migrations/20260420_create_business_immigration_storage.sql

-- 1) 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-immigration-documents',
  'business-immigration-documents',
  false,
  52428800,  -- 50 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/heic']
)
ON CONFLICT (id) DO NOTHING;


-- 2) RLS 정책 — 고객: 자기 파일만 전체 작업
--    경로 첫 세그먼트(storage.foldername(name)[1])가 auth.uid()와 일치해야 허용

CREATE POLICY biz_docs_owner_select
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY biz_docs_owner_insert
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] IN
        ('passport','criminal_record','education','family','funding','contracts')
  );

CREATE POLICY biz_docs_owner_update
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY biz_docs_owner_delete
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );


-- 3) RLS 정책 — super_admin: 전체 작업 허용

CREATE POLICY biz_docs_super_admin_all
  ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  );

-- 그 외 역할(anon·partner_admin·customer 타인)은 정책 미매칭 → 자연 deny
```

### 14-3-3. 경로 컨벤션 강제 로직

INSERT 정책의 `WITH CHECK`에서 경로 2번째 세그먼트(`document_type`)를 허용 목록으로 제한합니다. 이는 **클라이언트가 임의 폴더에 업로드하는 것을 방지**합니다.

**허용되는 경로 예**:
- `{user_id}/passport/1713568800_passport.pdf` ✅
- `{user_id}/criminal_record/1713568800_fbi_cert.pdf` ✅

**차단되는 경로 예**:
- `{user_id}/unknown_type/file.pdf` ❌ (2번째 세그먼트가 허용 목록 밖)
- `other_user_id/passport/file.pdf` ❌ (1번째 세그먼트가 auth.uid()와 불일치)
- `{user_id}/passport/subfolder/file.pdf` ❌ (3번째 세그먼트는 파일명이어야 함, `storage.foldername`의 배열 구조상 오히려 2번째가 `subfolder`로 잡히지 않도록 클라이언트 경로 생성 시 `/`개수 제한 필요)

### 14-3-4. 클라이언트 업로드 함수 시그니처 (참고)

`js/supabase-client.js`에 신규 함수 추가(구현 작업 시):

```javascript
async function uploadBusinessImmigrationDocument(documentType, file) {
    const session = await supabaseClient.auth.getSession();
    if (!session.data.session) throw new Error('Not authenticated');

    const userId = session.data.session.user.id;
    const allowedTypes = ['passport','criminal_record','education','family','funding','contracts'];
    if (!allowedTypes.includes(documentType)) {
        throw new Error('Invalid document_type: ' + documentType);
    }

    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${documentType}/${timestamp}_${sanitized}`;

    return supabaseClient.storage
      .from('business-immigration-documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
}
```

### 14-3-5. 다운로드 URL

기존 `thread_documents` 패턴 참고:
- 고객 다운로드: 1시간 유효 서명 URL (`createSignedUrl(path, 3600)`)
- 관리자 장기 보관: 1년 유효(`createSignedUrl(path, 31536000)`)

### 14-3-6. 관찰 기반 주의사항 (본 버킷에는 적용하지 않음)

본 신규 버킷 설계는 기존 버킷들의 관찰된 특이사항을 **의도적으로 회피**합니다. 기존 버킷 정책의 보정 여부는 후속 작업으로 분리.

| 기존 관찰 | 본 버킷 적용 | 비고 |
|---|---|---|
| `profile-documents` admin 정책 `objects.id = auth.uid()` | 미채택 | 표준 `profiles.role` 패턴 사용 |
| `thread_documents` SELECT/INSERT 경로 제약 없음 | 미채택 | 모든 작업 경로 소유권 검증 |
| `documents`·`passports` 버킷 `roles=public` | 미채택 | `authenticated` 사용 |
| 정책명 한글/영문 혼용 | 영문으로 통일 | `biz_docs_*` 접두 |

## 14-4. 사업이민 전용 프로필 필드 상세 (29개 + 메타)

PROJECT_KNOWLEDGE.md 섹션 7 확정 목록. 정본은 **나열된 29개 필드 전부**(옵션 A 확정, 헤딩 "7개·5개"는 오기 정정).

### 14-4-1. 카테고리별 필드 요약

| 카테고리 | 필드 수 |
|---|---|
| 기본 정보 | 8 |
| 거주·연락 | 6 |
| 가족 구성 | 1 |
| 이민 의도 | 5 |
| 배경 | 5 |
| 메타 | 4 |
| **합계** | **29** |

### 14-4-2. 기본 정보 (8개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 1 | `last_name_en` | text | ✅ | 영문 성 | 폼 |
| 2 | `first_name_en` | text | ✅ | 영문 이름 | 폼 |
| 3 | `full_name_native` | text | — | 본국어 성명 | 폼 |
| 4 | `nationality` | text | ✅ | ISO 국가 코드 또는 국가명 문자열 | 폼 |
| 5 | `passport_number` | text | ✅ | 여권번호 | 폼 (신규) |
| 6 | `passport_expiry` | date | ✅ | 여권 유효기간 | 폼 (신규) |
| 7 | `birth_date` | date | ✅ | 생년월일 | 폼 (신규) |
| 8 | `gender` | text | ✅ | `male` \| `female` \| `other` | 폼 (신규) |

### 14-4-3. 거주·연락 (6개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 9 | `residence_country` | text | ✅ | 현재 거주국 | 폼 |
| 10 | `home_address` | text | — | 본국 주소 | 폼 (신규) |
| 11 | `home_phone` | text | — | 본국 연락처 | 폼 (신규) |
| 12 | `email` | text | ✅ | Google OAuth 이메일 자동 채움, 변경 가능 | 폼 |
| 13 | `native_language` | text | ✅ | 모국어 | 폼 (신규) |
| 14 | `preferred_contact_method` | text | ✅ | `email` \| `thread` \| `phone` | 폼 |

### 14-4-4. 가족 구성 (1개)

| # | 컬럼명 | 타입 | 필수 | 구조 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 15 | `family_composition` | jsonb | — | `{ spouse: bool, children: int, parents: bool, spouse_info?: {...}, children_info?: [...] }` | 폼(부분) |

**`family_composition` 스키마(JSON)**:
```json
{
  "spouse": true,
  "children": 2,
  "parents": false,
  "spouse_info": {
    "name": "...",
    "birth_date": "YYYY-MM-DD",
    "nationality": "..."
  },
  "children_info": [
    { "name": "...", "birth_date": "YYYY-MM-DD", "nationality": "..." },
    { "name": "...", "birth_date": "YYYY-MM-DD", "nationality": "..." }
  ]
}
```

`spouse_info`·`children_info`는 선택. 폼에서는 `spouse`·`children`(수)·`parents` 3개 체크/숫자만 수집, 세부 정보는 본 상담에서 관리자가 채움.

### 14-4-5. 이민 의도 (5개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 16 | `visa_type_interest` | text | ✅ | `D-9-4` \| `D-9-5` \| `undecided` | 폼 |
| 17 | `timeline` | text | — | `3months` \| `6months` \| `1year` \| `over1year` \| `undecided` | 폼 |
| 18 | `preferred_industry` | text | — | 희망 업종 | 폼 (신규) |
| 19 | `preferred_location` | text | — | 희망 지역 | 폼 (신규) |
| 20 | `funding_source` | text | — | 자유 서술 (자금 규모 언급 금지 원칙 유지: 서술은 본인 의사) | 폼 (신규) |

**주의 — `funding_source` 원칙**: 확정사항 섹션 4와 원 명세 섹션 4-3에 따라 **폼 단계에서 자금 규모·금액을 질문하지 않습니다**. 본 필드는 "본인이 밝히고자 하는 자금 조달 방식"(예: `개인 자산`, `투자자 유치 예정`, `가족 지원` 등 자유 서술)만 담는 선택 필드. 관리자는 본 상담에서 상세 확인.

### 14-4-6. 배경 (5개)

| # | 컬럼명 | 타입 | 필수 | 허용값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 21 | `education_background` | text | — | 최종 학력·전공 등 자유 서술 | 폼 (신규) |
| 22 | `work_experience` | text | — | 주요 경력 자유 서술 | 폼 (신규) |
| 23 | `korea_visit_history` | text | — | 한국 방문 이력 자유 서술(사업이민 대상이지만 관광 방문 경험은 있을 수 있음) | 폼 (신규) |
| 24 | `korean_language_proficiency` | text | — | 자유 서술 또는 `none` \| `beginner` \| `intermediate` \| `advanced` | 폼 (신규) |
| 25 | `criminal_record` | boolean | — | 본인 신고 기준, 상세는 Stage 2 증빙 | 폼 (신규) |

### 14-4-7. 메타 (4개)

| # | 컬럼명 | 타입 | 필수 | 기본값/비고 | 폼 필드 여부 |
|---|---|---|---|---|---|
| 26 | `profile_completed` | boolean | ✅ | `false`, BEFORE 트리거 자동 계산 (14-6 참조) | — |
| 27 | `user_id` | uuid | ✅ | `auth.users(id)` FK, PK | — |
| 28 | `created_at` | timestamptz | ✅ | `now()` | — |
| 29 | `updated_at` | timestamptz | ✅ | `now()`, UPDATE 트리거로 자동 갱신 | — |

### 14-4-8. 명시적 제외 필드

PROJECT_KNOWLEDGE.md 섹션 7 확정 — 한국 미방문 외국인 대상이므로 다음은 저장하지 않음:

- `alien_registration_number` (외국인등록번호)
- 현재 `visa_type` / `stay_expiry` (한국 내 체류자격·만료일)
- `korea_address` (한국 내 주소)

기존 `profiles` 테이블은 이 필드들을 가질 수 있으나, 사업이민 사용자는 해당 값을 `NULL`로 둡니다.

### 14-4-9. 언어 라벨 (i18n 키 매핑)

각 필드의 한국어·영어 라벨은 섹션 8(i18n)과 14-9 운용 규칙에 따라 `biz.form.*` 네임스페이스로 추가. 키 이름은 컬럼명과 동일한 snake_case 매핑(예: `biz.form.last_name_en`).

구체 번역 카피는 본 섹션 범위 밖(원 명세 섹션 13에서 "후속 전달"로 분리). 키 스텁은 런칭 전 반드시 7개 언어 전부 추가(섹션 14-9 참조).

## 14-5. 사업이민 전용 문서 업로드 항목 (Stage 1 이전 · Stage 2 구분)

PROJECT_KNOWLEDGE.md 섹션 7 확정. Storage 버킷은 `business-immigration-documents` 단일, 경로 컨벤션으로 문서 유형 구분.

### 14-5-1. Stage 1 이전 (사전 상담 ~ 본 상담 사이)

| 문서 | `document_type` | 필수 | 비고 |
|---|---|---|---|
| 여권 사본 | `passport` | ✅ | 본 상담 전 신원 확인용 |
| 본인 확인용 신분증 | `passport` 하위 | — | 여권 외 보조(예: 본국 ID 카드) |

**경로 예**: `{user_id}/passport/{timestamp}_passport.pdf`

### 14-5-2. Stage 2 단계 (계약 체결 후)

| 문서 | `document_type` | 필수 | 아포스티유/번역 |
|---|---|---|---|
| 본국 범죄 경력 증명서 | `criminal_record` | ✅ | 아포스티유 + 한국어 번역 |
| 학력 증명서 | `education` | ✅ | 아포스티유 + 한국어 번역 |
| 가족관계 증명서 | `family` | ✅ | 아포스티유 + 한국어 번역 |
| 투자금 증빙 | `funding` | ✅ | 아포스티유 + 한국어 번역 |
| 송출국 재직 증명 | `funding` | ✅ | 아포스티유 + 한국어 번역 |
| 가맹계약서 | `contracts` | 상황 | 한국 내 계약서, 번역 불필요 |
| 임대차계약서 | `contracts` | 상황 | 한국 내 계약서, 번역 불필요 |

**경로 예**:
- `{user_id}/criminal_record/{timestamp}_fbi_cert_original.pdf`
- `{user_id}/criminal_record/{timestamp}_fbi_cert_apostille_kr.pdf`
- `{user_id}/funding/{timestamp}_bank_statement.pdf`
- `{user_id}/contracts/{timestamp}_franchise_agreement.pdf`

**원본·번역본 구분**: 같은 `document_type` 내에서 파일명 suffix로 구분(`_original`, `_apostille`, `_kr`). 별도 컬럼·테이블 없이 파일명 컨벤션으로 해결.

### 14-5-3. `document_type` 선택 근거

PM 확정(블로커 3 답변) — stage별 분류를 **반려**하고 문서 유형별로 채택. 이유:

- 같은 문서 유형이 Stage 1/2에서 재업로드·보완될 수 있음
- 문서 유형별 폴더는 관리자 검토·장기 보관 시 탐색이 쉬움
- Stage 구분은 **업로드 시점의 쓰레드 상태**(`business_immigration_status`)로 사후 추적 가능(파일 `created_at` + 당시 쓰레드 상태 join)

### 14-5-4. 업로드 시점·주체 매트릭스

| 문서 | 주 업로드 주체 | 업로드 허용 시점(사업이민 상태) |
|---|---|---|
| `passport` | 고객 | `pre_consultation` 이상 |
| `criminal_record`, `education`, `family` | 고객 | `stage2_engaged` 이상 |
| `funding` | 고객 | `stage2_engaged` 이상 |
| `contracts` | 관리자(super_admin) | `stage2_engaged` 이상 |

허용 시점 제약은 애플리케이션 레벨(UI)로 구현. Storage RLS에서는 소유권·document_type만 검증(시점 제약을 DB로 표현하려면 custom SQL 함수가 필요하지만, 복잡도 대비 이득이 적음).

### 14-5-5. 파일 메타 추적 테이블 (선택적)

문서 메타데이터를 DB에 별도 인덱싱할지 여부:

- **옵션 1 (권장)**: 별도 테이블 없이 `storage.objects` 메타 + 경로 파싱으로 관리.
- **옵션 2**: `business_immigration_documents` 테이블 신설 (file_path, document_type, uploaded_by, uploaded_at, status, notes). 관리자 체크리스트·승인 상태 관리가 필요해지면 이때 도입.

본 섹션 14는 **옵션 1**로 시작. 옵션 2는 Stage 2 워크플로 명세가 확정될 때 후속 작업으로 추가.

## 14-6. 프로필 완성도 판정 기준 (필수 3개 필드, `request_type` 분기)

### 14-6-1. 확정 원칙

PROJECT_KNOWLEDGE.md 섹션 7 + 확정사항 4번:

- **사업이민 프로필 완성도**: `nationality`, `residence_country`, `visa_type_interest` **3개 필드가 모두 NOT NULL**일 때 `profile_completed = true`.
- 다른 NOT NULL 컬럼이 누락되면 **DB INSERT 자체가 실패**하므로 판정 대상이 아님. 위 3개는 특별히 강조된 "사업이민 핵심 의도 트리플".
- 기타 필드(가족 구성·이주 시점·자금 조달·배경 등)는 완성도 판정에 영향 없음. 보강은 UI 레벨 안내로 처리.
- 기존 일반 프로필(`profiles` 테이블) 판정 기준은 **기존 `passport_number` NULL 여부 방식 그대로 유지**. 본 섹션 14가 건드리지 않음.

### 14-6-2. DB 트리거로 자동 계산

`business_immigration_profiles` 테이블의 `profile_completed` 컬럼은 BEFORE INSERT/UPDATE 트리거로 자동 채웁니다. 애플리케이션은 이 컬럼에 직접 `true`/`false`를 쓰지 않습니다.

```sql
-- migrations/20260420_create_biz_profile_completed_trigger.sql

CREATE OR REPLACE FUNCTION public.compute_biz_profile_completed()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completed := (
    NEW.nationality        IS NOT NULL AND
    NEW.residence_country  IS NOT NULL AND
    NEW.visa_type_interest IS NOT NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_biz_profile_compute_completed
  BEFORE INSERT OR UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.compute_biz_profile_completed();
```

**장점**:
- 애플리케이션 버그·누락으로 불일치 상태가 생기지 않음.
- 관리자가 DB 직접 UPDATE로 3개 필드를 변경해도 `profile_completed`가 즉시 갱신됨.

### 14-6-3. 판정 함수 (애플리케이션 레벨)

`js/supabase-client.js`에 신규 함수 추가(구현 작업 시):

```javascript
async function isProfileCompleteForRequest(userId, requestType) {
    if (requestType === 'business_immigration') {
        const { data, error } = await supabaseClient
            .from('business_immigration_profiles')
            .select('profile_completed')
            .eq('user_id', userId)
            .maybeSingle();
        if (error || !data) return false;
        return data.profile_completed === true;
    }

    // 기존 일반 경로 (변경 없음) — passport_number 단일 필드 판정 유지
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('passport_number')
        .eq('id', userId)
        .maybeSingle();
    return !!(profile && profile.passport_number);
}
```

**호출 위치**:
- `thread-general-v2.html` 페이지 로드 시 배너 표시 판정(14-7)
- `createWelcomeMessage()`의 request_type 분기(14-7)
- 관리자 대시보드 고객 목록 렌더링 시 "프로필 완성 여부" 컬럼(14-8-5)

### 14-6-4. "핵심 트리플 미완"일 때 사업이민 경로 동작

| 상태 | UX 처리 |
|---|---|
| `business_immigration_profiles` 레코드 자체가 없음 | 쓰레드 페이지 진입 시 배너로 "프로필 작성" 유도, CTA 클릭 → `profile-submit.html?type=business&thread={id}` |
| 레코드는 있으나 `profile_completed = false` | 배너 표시, CTA는 "프로필 이어서 작성" |
| `profile_completed = true` | 배너 숨김 |

구체 배너 UI·텍스트는 14-7에서 기술.

### 14-6-5. 기존 `profiles` 테이블과의 관계

- `business_immigration_profiles.user_id` = `auth.users.id` = `profiles.id` → 1:1 연결.
- 사업이민 사용자도 `on_auth_user_created` 트리거로 `profiles` 기본 레코드는 자동 생성됨(콘솔 확인 결과). 이 기본 레코드의 `passport_number`·`nationality` 등은 `NULL` 상태 유지.
- 사업이민 전용 정보는 오직 `business_immigration_profiles`에서 관리.
- 관리자 대시보드에서 고객 정보를 보여줄 때:
  - 이름·이메일·역할: `profiles`에서 조회
  - 사업이민 상세: `business_immigration_profiles`에서 조회
  - SOT 원칙(확정사항 2번): 표시는 `profiles` 우선, 상담 이력 스냅샷은 `consultation_requests` 조회.

### 14-6-6. 판정 기준이 바뀔 때의 운영 절차

추후 "3개 핵심 필드" 외에 다른 필드를 완성도 조건에 추가하고 싶은 경우:

1. `compute_biz_profile_completed()` 함수 본문 수정 마이그레이션 작성.
2. 변경 직후 `UPDATE business_immigration_profiles SET updated_at = now()` 한 번 실행해 트리거 재평가로 기존 행의 `profile_completed` 값도 재계산.
3. 관련 i18n·UI 안내 문구 동시 배포.

3단계 운영 절차를 섹션 11 체크리스트에 연결.

## 14-7. welcome message 처리 정책 (동적 배너 적용 범위, 기존 경로 보존)

### 14-7-1. 적용 범위 확정

확정사항 3번:

- **이번 범위**: `request_type = 'business_immigration'` 쓰레드에서만 배너 활성화.
- **기존 경로 보존**: `D-10-1` 경로(service_name 문자열 매칭으로 분기)와 일반 상담 경로의 현재 welcome 메시지 구조는 **변경하지 않음**. 기존 "Enter Basic Info" 링크 로직(`js/supabase-client.js:913-1041`) 그대로 유지.
- 배너 컴포넌트는 **재사용 가능한 구조**로 구현하되, 활성화 조건만 사업이민 쓰레드로 제한.

### 14-7-2. 배너 표시 위치 및 DOM 구조

`thread-general-v2.html`과 `visa-thread-general.html` 상단 쓰레드 헤더 아래, 메시지 리스트 위에 배너 컨테이너 삽입:

```html
<!-- thread-general-v2.html 기존 헤더 블록 다음, 메시지 리스트 전에 배치 -->
<div id="thread-profile-banner"
     class="thread-banner thread-banner-hidden"
     role="region"
     aria-live="polite">
  <div class="thread-banner-body">
    <i class="fa-solid fa-circle-info thread-banner-icon"></i>
    <div class="thread-banner-text">
      <strong data-i18n="biz.banner.title">프로필 작성이 필요합니다</strong>
      <p data-i18n="biz.banner.description">원활한 상담을 위해 기본 정보를 입력해 주세요.</p>
    </div>
    <a id="thread-profile-banner-cta"
       class="thread-banner-cta"
       href="#"
       data-i18n="biz.banner.cta">프로필 작성하기</a>
  </div>
</div>
```

### 14-7-3. 배너 활성화 조건 (클라이언트 로직)

`js/business-immigration.js`(신규 파일, 원 명세 섹션 1 허용)에서 담당:

```javascript
async function evaluateThreadProfileBanner() {
    const threadId = new URLSearchParams(location.search).get('id');
    if (!threadId) return;

    // 1) 쓰레드 정보 조회
    const { data: thread } = await supabaseClient
        .from('threads')
        .select('id, user_id, request_type, business_immigration_status')
        .eq('id', threadId)
        .maybeSingle();
    if (!thread) return;

    // 2) 사업이민 쓰레드가 아니면 배너 비활성 (기존 경로 보존)
    if (thread.request_type !== 'business_immigration') return;

    // 3) 현재 사용자가 쓰레드 소유자인지 확인
    const session = await supabaseClient.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    if (!userId || userId !== thread.user_id) return;  // 관리자 뷰는 별도 처리

    // 4) 프로필 완성 여부 조회 (14-6 함수 재사용)
    const completed = await isProfileCompleteForRequest(userId, 'business_immigration');

    // 5) 미완이면 배너 표시, CTA 링크 설정
    const banner = document.getElementById('thread-profile-banner');
    const cta    = document.getElementById('thread-profile-banner-cta');
    if (!completed) {
        cta.href = `profile-submit.html?type=business&thread=${encodeURIComponent(threadId)}`;
        banner.classList.remove('thread-banner-hidden');
    } else {
        banner.classList.add('thread-banner-hidden');
    }
}

document.addEventListener('DOMContentLoaded', evaluateThreadProfileBanner);
```

**중요**: 본 함수는 **사업이민 쓰레드가 아니면 조기 반환**하여 기존 D-10-1·일반 경로에 영향을 주지 않습니다.

### 14-7-4. 재평가 트리거

배너는 다음 시점에 재평가되어 표시/숨김이 갱신됩니다:

| 이벤트 | 처리 |
|---|---|
| 쓰레드 페이지 최초 로드 | `DOMContentLoaded`에서 `evaluateThreadProfileBanner()` 호출 |
| 프로필 제출 후 쓰레드로 리다이렉트 | 쿼리 `?updated=1`이 있으면 1회 더 호출 |
| 브라우저 뒤로가기 → 쓰레드 복귀 | `pageshow` 이벤트에서 bfcache 복귀 시 재호출 |
| Realtime 구독(선택, 후속 작업) | 현재 코드에 Realtime 구독 없음 → 이번 작업에선 미도입 |

### 14-7-5. `createWelcomeMessage()` 수정 범위

확정사항 2번(SOT)·3번(기존 경로 보존)에 따라:

- **사업이민 쓰레드 전용 브랜치 추가**: `request_type === 'business_immigration'` 우선 체크.
  - 별도 welcome 메시지 템플릿 사용(환영 인사 + 3단계 안내, **"Enter Basic Info" 링크 포함하지 않음** — 배너가 담당).
- **D-10-1 브랜치**: 기존 `service_name` 문자열 매칭 그대로 유지, 변경 없음.
- **일반 브랜치**: 기존 `passport_number` 기반 `hasProfile` 판정 그대로 유지.

```javascript
async function createWelcomeMessage(threadId, serviceName, opts = {}) {
    const requestType = opts.requestType || 'general';

    // (신규) 사업이민 우선 분기
    if (requestType === 'business_immigration') {
        return insertWelcomeMessage(threadId, buildBusinessImmigrationWelcome());
    }

    // (기존 유지) D-10-1 경로
    if (serviceName && serviceName.toLowerCase().includes('d-10-1')) {
        return insertWelcomeMessage(threadId, buildD10Welcome(threadId));
    }

    // (기존 유지) 일반 경로
    const hasProfile = await checkHasProfileByPassportNumber();
    return insertWelcomeMessage(threadId, buildGeneralWelcome(threadId, hasProfile));
}
```

`buildBusinessImmigrationWelcome()`의 본문은 i18n 키 `biz.welcome.*`로 구성(섹션 14-9 스텁 처리 참조).

### 14-7-6. 스타일 가이드

배너 CSS는 기존 `css/ui-components.css`(토스트 스타일)에 이어 신규 클래스 추가:

```css
/* css/ui-components.css 말미에 추가 */

.thread-banner {
  background: #fff8e1;
  border-left: 4px solid #f5a623;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 12px 0;
}

.thread-banner-hidden { display: none; }

.thread-banner-body { display: flex; align-items: center; gap: 12px; }

.thread-banner-icon { color: #f5a623; font-size: 20px; }

.thread-banner-text { flex: 1; }
.thread-banner-text strong { display: block; margin-bottom: 2px; color: #5a3e00; }
.thread-banner-text p { margin: 0; color: #7a5800; font-size: 14px; }

.thread-banner-cta {
  background: #f5a623;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.thread-banner-cta:hover { background: #d98b0c; }
```

### 14-7-7. 관리자 뷰 고려

관리자(`admin-thread.html`)가 사업이민 쓰레드를 열 때 배너는 **숨김** 처리:
- 로직 14-7-3 step 3에서 `userId !== thread.user_id`로 조기 반환. 관리자는 본인 프로필이 쓰레드 소유자가 아니므로 자동 숨김.
- 관리자용 "고객 프로필 미완" 안내는 14-8-5의 대시보드 뱃지로 담당.

## 14-8. 쓰레드 생성 실패 처리 정책

### 14-8-1. 적용 범위 (확정)

확정사항 6번:

- **이번 작업 범위**: 사업이민 **상담 신청 폼**(`business-immigration-request.html`) 제출 시 쓰레드 생성 실패 처리.
- **범위 밖**: `confirm-payment` Edge Function의 L263-271 무시 로직 교체는 **결제 연동 작업에 포함**. 본 섹션은 테이블·UI·정책만 명시하고, Edge Function 수정은 후속 작업으로 분리.
- `send-notification` Edge Function 구현은 후속 작업(권고 수락). 본 섹션은 DB INSERT 경로와 대시보드 뱃지까지.

### 14-8-2. 재시도 정책 세분화 (확정사항 6번)

| 경로 | 결제 유무 | 재시도 버튼 | 실패 시 안내 메시지 |
|---|---|---|---|
| 사업이민 상담 신청 | 결제 없음 | ✅ 제공, `createThread()` 재호출 | "쓰레드 생성에 실패했습니다. 다시 시도해 주세요. 문제가 계속되면 지원팀에 문의해 주세요." |
| 일반 경로(Toss·Wise) 결제 후 | 결제 완료 | ❌ 제거 | "결제는 정상 승인되었습니다. 담당자가 직접 확인하여 쓰레드를 개설해 드립니다. 불편을 드려 죄송합니다." + `system_errors` INSERT + (send-notification 구현 후) 관리자 이메일 |

> 이번 작업에서는 **사업이민 상담 신청 경로**만 구현. 결제 후 실패 경로는 후속 작업.

### 14-8-3. `system_errors` 테이블 DDL

```sql
-- migrations/20260420_create_system_errors.sql

CREATE TABLE public.system_errors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type    text        NOT NULL,     -- 예: 'thread_creation','payment_confirm','document_upload'
  error_code    text,                     -- 내부 에러 코드(선택)
  request_id    text,                     -- orderId·threadId 등 상관 키
  context       jsonb,                    -- 요청 payload 스냅샷·스택 힌트
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   uuid        REFERENCES auth.users(id)
);

-- 인덱스
CREATE INDEX idx_system_errors_error_type ON public.system_errors(error_type);
CREATE INDEX idx_system_errors_unresolved
  ON public.system_errors(created_at DESC)
  WHERE resolved_at IS NULL;  -- 대시보드 뱃지용 부분 인덱스

-- RLS — super_admin만 SELECT/UPDATE, INSERT는 service_role 또는 authenticated 허용
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_errors_super_admin_select
  ON public.system_errors
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

CREATE POLICY system_errors_super_admin_update
  ON public.system_errors
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

-- INSERT는 인증된 모든 사용자에게 허용 (로그 기록 목적)
-- 단, user_id 위조 방지: user_id가 NULL이거나 auth.uid()와 동일한 경우만 허용
CREATE POLICY system_errors_insert
  ON public.system_errors
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
```

**주의**: `context` jsonb에 주문 정보·개인정보 스냅샷이 담길 수 있음. RLS로 **일반 사용자 SELECT 차단**은 필수. 위 DDL에서 super_admin 외 SELECT 정책이 없어 자연 deny.

### 14-8-4. 원자성 확보 — RPC 트랜잭션 방식

확정사항 — 재시도 시 `consultation_requests` + `threads` INSERT의 중복·반쪽 성공을 원천 차단하기 위해 **단일 PostgreSQL 함수(RPC)로 트랜잭션화**합니다. 클라이언트는 한 번의 RPC 호출만 수행하고, 함수 내부에서 두 INSERT 중 하나라도 실패하면 전체가 자동 롤백됩니다.

#### RPC 함수 DDL

```sql
-- migrations/20260420_create_business_immigration_rpc.sql
-- consultation_requests + threads 이원 INSERT를 원자적으로 수행
-- 실패 시 전체 롤백으로 중복·반쪽 성공 방지
-- 사전 조건: 14-1-2의 consultation_requests 테이블, 14-2-1의 threads 컬럼 추가가 먼저 적용되어 있어야 함

CREATE OR REPLACE FUNCTION public.create_business_immigration_request(
  p_nationality         text,
  p_residence_country   text,
  p_visa_type_interest  text,
  p_family_composition  jsonb,
  p_children_count      integer,
  p_timeline            text,
  p_message             text,
  p_contact_method      text,
  p_email               text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_request_id uuid;
  v_thread_id  uuid;
  v_order_id   text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  v_order_id := 'BIZ-' || (extract(epoch FROM now())::bigint)::text;

  -- 1) consultation_requests 스냅샷 INSERT
  INSERT INTO public.consultation_requests (
    user_id, request_type,
    nationality, residence_country, visa_type_interest,
    family_composition, children_count, timeline,
    message, contact_method, email
  ) VALUES (
    v_user_id, 'business_immigration',
    p_nationality, p_residence_country, p_visa_type_interest,
    p_family_composition, p_children_count, p_timeline,
    p_message, p_contact_method, p_email
  )
  RETURNING id INTO v_request_id;

  -- 2) threads INSERT (request_type 분기 + business_immigration_status 초기값)
  INSERT INTO public.threads (
    user_id, service_name, status, amount, order_id,
    request_type, business_immigration_status,
    is_consulting, organization
  ) VALUES (
    v_user_id,
    'Business Immigration Consultation',
    'active',
    0,
    v_order_id,
    'business_immigration',
    'pre_consultation',
    true,
    'business_immigration'
  )
  RETURNING id INTO v_thread_id;

  -- 3) 양방향 연결 — consultation_requests.thread_id 업데이트
  UPDATE public.consultation_requests
     SET thread_id = v_thread_id
   WHERE id = v_request_id;

  RETURN jsonb_build_object(
    'request_id', v_request_id,
    'thread_id',  v_thread_id,
    'order_id',   v_order_id
  );
END;
$$;

-- authenticated 역할에 실행 권한 부여 (RLS는 함수 내부 INSERT 각각에 개별 적용됨)
REVOKE ALL ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) TO authenticated;
```

**설계 요점**
- `SECURITY INVOKER` — 함수가 **호출자 권한**으로 실행됨. `auth.uid()`로 호출자를 확인하고, 각 INSERT는 14-1-2·14-2-1에서 정의한 RLS 정책의 보호를 받음. (`SECURITY DEFINER`를 사용하면 RLS를 우회하므로 피함.)
- `BEGIN ... END` 블록은 단일 트랜잭션. 두 INSERT 중 어느 하나라도 실패하면 **PostgreSQL이 자동 롤백** → 중복·반쪽 성공 불가.
- `v_order_id`는 epoch 초 기준으로 생성 (클라이언트 `Date.now()` 대체). 순간적 중복 방지가 더 필요해지면 `gen_random_uuid()` 기반으로 전환 가능.

#### 클라이언트 측 호출 흐름 (재작성)

```javascript
async function submitBusinessImmigrationRequest() {
    // ... 폼 검증, 프로필 upsert 등은 사전 단계에서 완료 ...

    try {
        // 1) 단일 RPC 호출 — 트랜잭션으로 consultation_requests + threads 처리
        const { data, error } = await supabaseClient
            .rpc('create_business_immigration_request', {
                p_nationality:        form.nationality,
                p_residence_country:  form.residence_country,
                p_visa_type_interest: form.visa_type_interest,
                p_family_composition: form.family_composition,
                p_children_count:     form.children_count ?? null,
                p_timeline:           form.timeline ?? null,
                p_message:            form.message ?? null,
                p_contact_method:     form.contact_method,
                p_email:              form.email
            });
        if (error) throw error;

        const threadId = data.thread_id;

        // 2) 환영 메시지 (RPC 외부 — 실패해도 쓰레드 자체는 성공 보존)
        try {
            await createWelcomeMessage(threadId, 'Business Immigration Consultation',
                                       { requestType: 'business_immigration' });
        } catch (welcomeErr) {
            await logSystemError({
                error_type: 'welcome_message',
                request_id: String(threadId),
                context: { message: welcomeErr?.message }
            });
            // welcome 실패는 무음 진행 — 쓰레드 진입은 성공으로 처리
        }

        // 3) 쓰레드 페이지로 리다이렉트
        location.href = `thread-general-v2.html?id=${threadId}`;

    } catch (err) {
        // RPC 자체 실패 — 모든 DB 상태가 롤백됨
        await logSystemError({
            error_type: 'thread_creation',
            context: {
                message: err?.message,
                code:    err?.code,
                form_summary: {
                    nationality:        form.nationality,
                    visa_type_interest: form.visa_type_interest
                }
            }
        });

        showToastWithRetry(
            i18n.translate('biz.error.thread_creation'),
            () => submitBusinessImmigrationRequest()  // 롤백된 상태에서 재시도, 중복 없음
        );
    }
}

async function logSystemError(payload) {
    try {
        await supabaseClient.from('system_errors').insert(payload);
    } catch (_) {
        // 로그 INSERT 실패는 무음 처리(이중 실패 방지)
    }
}
```

#### RPC 방식의 이점 요약

| 비교 항목 | 단순 2-step (과거 설계) | RPC 트랜잭션 (현재 확정) |
|---|---|---|
| 반쪽 성공 가능성 | 있음 (consultation_requests만 성공 + threads 실패) | 없음 (전체 롤백) |
| 재시도 시 중복 | 가능 | 불가능 |
| 클라이언트 복잡도 | 2회 호출 + 상태 추적 | 1회 호출 |
| 실패 시 정리 로직 | 클라이언트가 수행 | 자동 롤백 |
| RLS 적용 | 각 INSERT별 | 각 INSERT별 (동일) — `SECURITY INVOKER` |

#### 검증 방법 (섹션 14-10 참조)
- RPC 실패 주입 테스트: 일부러 CHECK 제약 위반 값 전달 후 `consultation_requests` 테이블에 잔여 row 없는지 확인.
- 재시도 100회 반복 후 `consultation_requests`·`threads` 레코드 수가 **1건씩**만 증가하는지 확인.

### 14-8-5. 토스트 + 재시도 버튼 UI

기존 `js/ui-components.js`의 토스트 유틸을 래핑합니다. **토스트 유틸이 번역 키를 직접 받지 않는 구조**(문자열만 받음)임이 확인되었으므로, 호출 전에 `i18n.translate()` 결과를 전달하는 래퍼를 추가합니다.

```javascript
// js/ui-components.js 또는 js/business-immigration.js

function showToastWithRetry(message, onRetry, durationMs = 8000) {
    // 기존 toast API를 확장: retry 버튼 포함 variant
    const container = ensureToastContainer();  // 기존 로직 재사용
    const toast = document.createElement('div');
    toast.className = 'toast toast-error toast-with-retry';
    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-retry">${escapeHtml(i18n.translate('common.retry'))}</button>
      <button class="toast-close" aria-label="close">×</button>
    `;
    toast.querySelector('.toast-retry').addEventListener('click', () => {
        onRetry();
        hide(toast);
    });
    toast.querySelector('.toast-close').addEventListener('click', () => hide(toast));
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    // 자동 숨김 없음 — 사용자 조치 전까지 유지
}
```

기존 `js/ui-components.js:13-58`의 `show/hide` 헬퍼를 그대로 재사용. 토스트 유틸의 i18n 지원 상태는 **런타임 문자열 인자만 받음**으로 확인되어, 위처럼 호출 전 `i18n.translate()`로 처리.

### 14-8-6. 관리자 대시보드 뱃지

`admin-dashboard.html` 상단 내비 또는 헤더 근처에 "미해결 시스템 오류" 뱃지 추가:

```html
<a href="#system-errors" id="nav-system-errors" class="admin-nav-item">
  <i class="fa-solid fa-triangle-exclamation"></i>
  <span data-i18n="admin.nav.system_errors">시스템 오류</span>
  <span id="system-errors-badge" class="nav-badge nav-badge-hidden">0</span>
</a>
```

페이지 로드 시 카운트 쿼리:

```javascript
async function refreshSystemErrorsBadge() {
    const { count } = await supabaseClient
        .from('system_errors')
        .select('id', { count: 'exact', head: true })
        .is('resolved_at', null);
    const badge = document.getElementById('system-errors-badge');
    if (count && count > 0) {
        badge.textContent = String(count);
        badge.classList.remove('nav-badge-hidden');
    } else {
        badge.classList.add('nav-badge-hidden');
    }
}
document.addEventListener('DOMContentLoaded', refreshSystemErrorsBadge);
```

- Realtime 구독은 현재 코드 전반에 미도입 상태이므로 이번 작업에서도 미채택. 페이지 로드 시 1회 조회가 기본. 관리자는 새로고침 또는 페이지 이동 시 최신화.
- 상세 목록 뷰·`resolved_at` 마킹 UI는 후속 작업(또는 본 작업 후반부 옵션).

### 14-8-7. i18n 키 추가

섹션 14-9 스텁 운용 규칙에 따라 다음 키를 7개 언어에 모두 추가:

- `common.retry` — "Retry" / "다시 시도"
- `biz.error.thread_creation` — 상담 실패 안내 (재시도 버튼 케이스)
- `biz.error.thread_creation_after_payment` — 결제 후 실패 안내 (재시도 없음) ※ 본 작업 범위 밖 키지만 사전 스텁 권장
- `admin.nav.system_errors` — "시스템 오류" 내비 라벨

### 14-8-8. `send-notification` 연동 (범위 밖, 후속 작업용 메모)

본 섹션 14 구현 시 `system_errors` INSERT만 수행하고 이메일 발송은 트리거하지 않습니다. Resend 계정·발신 도메인(DNS SPF/DKIM/DMARC) 인증·이메일 템플릿 4개 언어 준비가 선행되어야 하며, 준비 완료 후:

1. `send-notification` Edge Function 본체에 Resend API 호출 로직 구현
2. `system_errors` 테이블에 AFTER INSERT 트리거 추가 → `error_type='thread_creation'` 신규 insert 시 Edge Function 호출
3. 관리자 수신 이메일 주소 환경 변수(`NOTIFY_ADMIN_EMAIL`) 정의

이 후속 작업 명세는 별도 섹션(섹션 15 또는 별도 문서)으로 분리.

## 14-9. i18n 7개 언어 스텁 처리 정책

### 14-9-1. 확정 운용 규칙 (확정사항 5번)

| 언어 코드 | 런칭 여부 | 초기 스텁 값 | 최종 상태 |
|---|---|---|---|
| `ko` | ✅ | 마스터 카피 (원 명세 섹션 3·4의 확정 한국어 그대로) | 마스터 |
| `en` | ✅ | 번역 우선 삽입 | 실번역 확정 |
| `vi` | ✅ | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `zh` | ✅ | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `ja` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `mn` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |
| `th` | ❌ (비런칭) | **`en` 값 복제 + TRANSLATION_PENDING 주석** | 번역 도착 시 교체 |

**이유** (진단 발견 5 대응): 폴백 언어가 `ko`이므로 키를 7개 언어 중 일부에서 누락하면 해당 언어 사용자가 **한국어 값을 보게 됨**. 비런칭 언어 사용자가 한국어를 보는 것보다 **영어를 보는 편이 UX·번역 관리상 우월**하다는 판단. `en`이 실번역 품질을 갖춘 후에만 복제해야 하므로 `en` 번역 검수는 전체 품질의 1차 게이트.

### 14-9-2. 주석 표식 형식 (확정사항 5번)

`js/translations.js`에 복제본 스텁을 넣을 때 바로 위 줄에 **일관된 주석 포맷**을 삽입합니다:

```javascript
// ko 블록
ko: {
  // ... 기존 키들 ...
  'biz.hero.headline': '한국에서 사업을 시작하고 이주하기 위한 통합 법률서비스',
  // ...
},

// en 블록
en: {
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// vi 블록
vi: {
  // [TRANSLATION_PENDING: biz.hero.headline, vi, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// zh 블록
zh: {
  // [TRANSLATION_PENDING: biz.hero.headline, zh, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// ja 블록
ja: {
  // [TRANSLATION_PENDING: biz.hero.headline, ja, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// mn 블록
mn: {
  // [TRANSLATION_PENDING: biz.hero.headline, mn, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},

// th 블록
th: {
  // [TRANSLATION_PENDING: biz.hero.headline, th, cloned from en at 2026-04-20]
  'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
  // ...
},
```

### 14-9-3. 주석 포맷 정규식 (집계용)

번역 교체 잔여분을 빠르게 파악하기 위한 regex 포맷:

```
// \[TRANSLATION_PENDING: (biz\.[a-z0-9_.]+), (ko|en|vi|zh|ja|mn|th), cloned from (ko|en) at (\d{4}-\d{2}-\d{2})\]
```

**잔여분 카운트 명령**:
```bash
grep -c "TRANSLATION_PENDING" js/translations.js
```

**언어별 잔여분 카운트**:
```bash
grep -oE "TRANSLATION_PENDING: biz\.[a-z0-9_.]+, [a-z]+, " js/translations.js | sort | uniq -c
```

### 14-9-4. 번역 교체 운영 절차

번역이 도착하면:

1. 해당 언어 블록에서 대응 키를 찾음
2. 바로 위 `TRANSLATION_PENDING` 주석 라인 **삭제**
3. 키 값(문자열)을 실번역으로 **교체**
4. `grep -c TRANSLATION_PENDING js/translations.js`로 잔여분 카운트 감소 확인
5. 섹션 14-9-6의 `validate-biz-i18n.js` 재실행해 누락 없는지 확인

### 14-9-5. `biz.*` 키 목록 (원 명세 섹션 8 + 본 섹션 14 추가분)

원 명세 섹션 8-2에 명시된 키 + 본 섹션에서 새로 도입된 키를 합산:

```
# 원 명세 섹션 8-2 (랜딩·폼·대시보드)
biz.hero.headline
biz.hero.subhead
biz.hero.cta
biz.badge.description
biz.step1.title, biz.step1.body
biz.step2.title, biz.step2.body
biz.step3.title, biz.step3.body
biz.step4.title, biz.step4.body
biz.step5.title, biz.step5.body
biz.news.heading
biz.dashboard.heading
biz.dashboard.guest
biz.dashboard.progress.stage1
biz.dashboard.progress.stage2
biz.dashboard.progress.stage3
biz.dashboard.progress.stage4
biz.dashboard.progress.stage5
biz.form.title
biz.form.nationality
biz.form.residence_country
biz.form.visa_type
biz.form.family
biz.form.children_count
biz.form.timeline
biz.form.message
biz.form.contact_method
biz.form.submit
biz.form.auto_reply

# 본 섹션 14 추가분
# 14-7 배너
biz.banner.title
biz.banner.description
biz.banner.cta

# 14-7 welcome 메시지 (사업이민 전용)
biz.welcome.greeting
biz.welcome.step1
biz.welcome.step2
biz.welcome.step3
biz.welcome.closing

# 14-8 에러·공통
biz.error.thread_creation
biz.error.thread_creation_after_payment
common.retry
admin.nav.system_errors

# 14-4 폼 필드 라벨 (29개 프로필 컬럼 매핑)
biz.form.last_name_en
biz.form.first_name_en
biz.form.full_name_native
biz.form.passport_number
biz.form.passport_expiry
biz.form.birth_date
biz.form.gender
biz.form.home_address
biz.form.home_phone
biz.form.email
biz.form.native_language
biz.form.preferred_contact_method
biz.form.preferred_industry
biz.form.preferred_location
biz.form.funding_source
biz.form.education_background
biz.form.work_experience
biz.form.korea_visit_history
biz.form.korean_language_proficiency
biz.form.criminal_record
```

구현 시점에 최종 키 목록을 섹션 14-10 체크리스트의 `i18n 키 매니페스트` 파일(`scripts/biz-i18n-manifest.json`)로 고정.

### 14-9-6. `scripts/validate-biz-i18n.js` 신규 스크립트

`biz.*` 키가 7개 언어 모두에 존재하는지 검증. 누락 시 빌드 실패.

```javascript
// scripts/validate-biz-i18n.js
// 실행: node scripts/validate-biz-i18n.js
// 성공: exit 0
// 누락 발견: exit 1, 누락 내역 stderr 출력

const fs = require('fs');
const path = require('path');

// translations.js는 브라우저 전역에 할당되는 스크립트이므로,
// Node에서 평가하기 위해 한 번 래핑해 로드.
const translationsSrc = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'translations.js'),
  'utf8'
);
// 전역 할당 패턴: `const translations = { ... };` 또는 `window.translations = { ... };`
// CommonJS 호환을 위해 eval 내부에서 module.exports에 바인딩.
let translations;
eval(translationsSrc.replace(
  /^\s*const\s+translations\s*=/m,
  'translations ='
));

const REQUIRED_LANGS = ['ko','en','vi','zh','ja','mn','th'];
const NAMESPACE_PREFIX = 'biz.';

// 매니페스트에 정의된 공식 키 목록을 단일 진실 공급원으로 사용
const manifestPath = path.join(__dirname, 'biz-i18n-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
// manifest = { keys: ['biz.hero.headline', ...] }

const missing = [];
for (const key of manifest.keys) {
  for (const lang of REQUIRED_LANGS) {
    const dict = translations[lang] || {};
    if (typeof dict[key] === 'undefined') {
      missing.push({ key, lang });
    }
  }
}

if (missing.length > 0) {
  console.error('[validate-biz-i18n] Missing keys:');
  for (const m of missing) console.error(`  - ${m.key} [${m.lang}]`);
  process.exit(1);
}

console.log(`[validate-biz-i18n] OK (${manifest.keys.length} keys × ${REQUIRED_LANGS.length} langs)`);
process.exit(0);
```

### 14-9-7. `scripts/biz-i18n-manifest.json` 포맷

```json
{
  "version": 1,
  "generatedAt": "2026-04-20",
  "namespace": "biz.*",
  "keys": [
    "biz.hero.headline",
    "biz.hero.subhead",
    "biz.hero.cta",
    "biz.badge.description",
    "biz.step1.title",
    "biz.step1.body",
    "biz.step2.title",
    "biz.step2.body",
    "biz.step3.title",
    "biz.step3.body",
    "biz.step4.title",
    "biz.step4.body",
    "biz.step5.title",
    "biz.step5.body",
    "biz.news.heading",
    "biz.dashboard.heading",
    "biz.dashboard.guest",
    "biz.dashboard.progress.stage1",
    "biz.dashboard.progress.stage2",
    "biz.dashboard.progress.stage3",
    "biz.dashboard.progress.stage4",
    "biz.dashboard.progress.stage5",
    "biz.form.title",
    "biz.form.nationality",
    "biz.form.residence_country",
    "biz.form.visa_type",
    "biz.form.family",
    "biz.form.children_count",
    "biz.form.timeline",
    "biz.form.message",
    "biz.form.contact_method",
    "biz.form.submit",
    "biz.form.auto_reply",
    "biz.banner.title",
    "biz.banner.description",
    "biz.banner.cta",
    "biz.welcome.greeting",
    "biz.welcome.step1",
    "biz.welcome.step2",
    "biz.welcome.step3",
    "biz.welcome.closing",
    "biz.error.thread_creation",
    "biz.error.thread_creation_after_payment",
    "biz.form.last_name_en",
    "biz.form.first_name_en",
    "biz.form.full_name_native",
    "biz.form.passport_number",
    "biz.form.passport_expiry",
    "biz.form.birth_date",
    "biz.form.gender",
    "biz.form.home_address",
    "biz.form.home_phone",
    "biz.form.email",
    "biz.form.native_language",
    "biz.form.preferred_contact_method",
    "biz.form.preferred_industry",
    "biz.form.preferred_location",
    "biz.form.funding_source",
    "biz.form.education_background",
    "biz.form.work_experience",
    "biz.form.korea_visit_history",
    "biz.form.korean_language_proficiency",
    "biz.form.criminal_record"
  ],
  "nonBizKeys": [
    "common.retry",
    "admin.nav.system_errors"
  ]
}
```

`nonBizKeys`는 `biz.*` 외지만 본 작업에서 신설되는 키. 검증 스크립트에서 `manifest.keys ∪ manifest.nonBizKeys`로 확장하면 둘 다 검증 가능.

### 14-9-8. CI 편입

`.github/workflows/validate.yml`에 단계 추가:

```yaml
# .github/workflows/validate.yml (기존 파일 편집)
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/validate-syntax.js
      # 신규
      - run: node scripts/validate-biz-i18n.js
```

누락 시 CI가 실패해 배포 전에 차단. `package.json`에는 스크립트 별칭을 추가해 로컬에서도 간편 실행:

```json
"scripts": {
  "test": "node scripts/validate-syntax.js",
  "validate": "node scripts/validate-syntax.js",
  "validate:biz-i18n": "node scripts/validate-biz-i18n.js",
  "build:blog": "node scripts/build-blog.js"
}
```

### 14-9-9. 복제 작업 자동화 보조 스크립트 (선택)

대량 키 복제 시 수작업 실수를 줄이기 위해 `scripts/clone-biz-i18n-to-en.js` 같은 보조 스크립트를 도입할 수 있음. 본 섹션 범위 밖(구현자 재량).

## 14-10. 연동 검증 체크리스트

구현 완료 후 개발자 자체 검증용. 원 명세 섹션 11(기본 기능 테스트)과 중복되는 항목은 참조 표기만 하고, 본 체크리스트는 **섹션 14에서 신설·변경된 부분**에 집중합니다.

### 14-10-1. DB 마이그레이션 적용 확인

- [ ] `migrations/20260420_create_business_immigration_profiles.sql` 실행 성공, 테이블·인덱스·RLS·트리거 생성 확인
- [ ] `migrations/20260420_create_consultation_requests.sql` 실행. 테이블·RLS 3개 정책 생성 확인 (14-1-2)
- [ ] `migrations/20260420_alter_threads_add_business_immigration.sql` 실행. `request_type`·`business_immigration_status` 컬럼 추가 확인 (14-2-1, text 컬럼 확정)
- [ ] `migrations/20260420_create_business_immigration_storage.sql` 실행. 버킷 생성 + 5개 정책 생성 확인
- [ ] `migrations/20260420_create_biz_profile_completed_trigger.sql` 실행. 트리거 동작 확인 (테스트 INSERT → `profile_completed` 자동 계산)
- [ ] `migrations/20260420_create_system_errors.sql` 실행. RLS 3개 정책 확인
- [ ] `migrations/20260420_create_business_immigration_rpc.sql` 실행. `create_business_immigration_request` 함수 생성 + authenticated 역할 EXECUTE 권한 확인

검증 SQL:
```sql
-- 테이블 존재 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('business_immigration_profiles','consultation_requests','system_errors');

-- 신규 컬럼 확인
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'threads'
  AND column_name IN ('request_type','business_immigration_status');

-- 버킷 확인
SELECT name FROM storage.buckets WHERE name = 'business-immigration-documents';

-- Storage RLS 확인
SELECT policyname FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'biz_docs_%';

-- 트리거 확인
SELECT tgname FROM pg_trigger
WHERE tgname IN ('trg_biz_profiles_set_updated_at','trg_biz_profile_compute_completed');
```

### 14-10-2. 프로필 완성도 판정 동작

- [ ] 사업이민 프로필에 필수 3개 중 1~2개만 NULL로 INSERT 시 `profile_completed = false` 자동 계산 (NOT NULL 컬럼들은 테스트를 위해 임시로 NULL 허용 후 롤백)
- [ ] 필수 3개 전부 NOT NULL INSERT 시 `profile_completed = true` 자동 계산
- [ ] UPDATE로 3개 중 하나를 NULL로 바꾸면 `profile_completed`가 `false`로 재계산
- [ ] `isProfileCompleteForRequest(userId, 'business_immigration')`이 DB 값 그대로 반환
- [ ] `isProfileCompleteForRequest(userId, 'general')`은 기존 `passport_number` 로직 유지(회귀 테스트)

### 14-10-3. Storage 업로드 경로 강제

- [ ] 정상 경로 `{user_id}/passport/{ts}_file.pdf` 업로드 성공
- [ ] 타인 `user_id` 폴더 업로드 시도 → RLS로 차단 (INSERT 실패)
- [ ] 허용 밖 `document_type`(예: `{user_id}/unknown/file.pdf`) 업로드 시도 → RLS로 차단
- [ ] super_admin 계정으로 타인 폴더 SELECT 가능
- [ ] 일반 사용자로 타인 폴더 SELECT 시도 → 차단
- [ ] `allowed_mime_types` 밖(예: `application/zip`) 업로드 시도 → 거부

### 14-10-4. 쓰레드 생성 플로우 (RPC 트랜잭션)

- [ ] `business-immigration-request.html` 폼 정상 제출 시 단일 RPC 호출(`create_business_immigration_request`)로:
  - [ ] `consultation_requests` 레코드 INSERT (`request_type='business_immigration'`)
  - [ ] `threads` 레코드 INSERT (`request_type='business_immigration'`, `status='active'`, `business_immigration_status='pre_consultation'`)
  - [ ] `consultation_requests.thread_id`가 신규 thread id로 UPDATE (RPC 내부 수행)
  - [ ] RPC 반환값 `{ request_id, thread_id, order_id }` 확인
  - [ ] welcome 메시지 INSERT (사업이민 전용 템플릿, "Enter Basic Info" 링크 없음)
  - [ ] `thread-general-v2.html`로 리다이렉트
- [ ] **RPC 실패 원자성 테스트**:
  - [ ] CHECK 제약 위반 값(예: `visa_type_interest='invalid'`) 주입 시 RPC 예외 발생
  - [ ] 예외 발생 후 `consultation_requests`·`threads`에 **잔여 row 0건** 확인(전체 롤백)
  - [ ] 재시도 100회 반복 시 각 테이블 레코드 수가 정확히 **1건씩** 증가(중복 없음)
- [ ] RPC 호출 실패 시:
  - [ ] `system_errors` 레코드 INSERT (`error_type='thread_creation'`)
  - [ ] 토스트 + 재시도 버튼 노출, i18n 번역 정상
  - [ ] 재시도 클릭 시 플로우 처음부터 재실행(롤백된 상태에서 재개되므로 중복 없음)
- [ ] welcome 메시지 실패 시: `system_errors` INSERT(`error_type='welcome_message'`)되고 쓰레드는 진입 성공으로 처리
- [ ] 로그인하지 않은 상태에서 제출 → Google 로그인 유도

### 14-10-5. welcome 배너 표시/숨김

- [ ] 사업이민 쓰레드 진입 시, `profile_completed=false`면 배너 표시
- [ ] 같은 쓰레드에서 `profile_completed=true`로 변경 후 재진입 시 배너 숨김
- [ ] 배너 CTA 링크가 `profile-submit.html?type=business&thread={id}`로 정확히 세팅
- [ ] **일반(general) 쓰레드 진입 시 배너 비활성** — 기존 경로 회귀 없음
- [ ] **D-10-1 쓰레드 진입 시 배너 비활성** — 기존 경로 회귀 없음
- [ ] 관리자 계정으로 사업이민 쓰레드 열 때 배너 숨김

### 14-10-6. 관리자 대시보드

- [ ] `admin-dashboard.html` 로드 시 `system-errors-badge` 카운트 정상
- [ ] 미해결 오류가 0건이면 뱃지 숨김
- [ ] 사업이민 쓰레드 목록 필터(일반/협약대학/사업이민) 정상 작동
- [ ] 사업이민 쓰레드 선택 시 `business_immigration_status` 컬럼 표시 및 수정 가능
- [ ] 일반 쓰레드 선택 시 `status` 컬럼 표시(기존), `business_immigration_status` 영역 비활성
- [ ] 기존 `status` 필터 쿼리에 `request_type='general'` 조건 추가 후 기존 결과와 동일함 확인

### 14-10-7. i18n 검증

- [ ] `scripts/biz-i18n-manifest.json` 작성, 전체 `biz.*` 키 + `common.retry` + `admin.nav.system_errors` 포함
- [ ] `scripts/validate-biz-i18n.js` 실행 시 누락 0건
- [ ] 7개 언어 모두 키 존재 확인 (각 언어 탭에서 무작위 3개 키 스팟 체크)
- [ ] `vi`·`zh`·`ja`·`mn`·`th` 블록에 `TRANSLATION_PENDING` 주석이 대응 키 바로 위에 위치
- [ ] `grep -c TRANSLATION_PENDING js/translations.js` 결과와 주석 매뉴얼 카운트 일치
- [ ] `ko` 블록에 마스터 카피가 원 명세 섹션 3·4와 정확히 일치
- [ ] `.github/workflows/validate.yml`에 `validate-biz-i18n` 스텝 추가, CI 통과
- [ ] `package.json`에 `validate:biz-i18n` 스크립트 별칭 추가

### 14-10-8. 변호사광고규칙·가격 언급 금지 (섹션 3-3 상시 체크)

- [ ] `business-immigration.html` 어디에도 가격·수임료·비용 언급 없음 (DOM 텍스트·data-i18n 값·주석 전체 검색)
- [ ] `business-immigration-request.html` 폼에 금액·자금 규모 입력 필드 없음
- [ ] 푸터에서 "서비스 가격표" 링크 제거 확인
- [ ] 변호사 캐러셀·신뢰 배지 기존 구조 그대로 유지

### 14-10-9. 회귀 테스트 (섹션 10 변경되지 않는 것)

- [ ] 기존 `index.html` 사용자 플로우 (로그인·프로필·신청·결제) 정상
- [ ] 기존 협약 대학 플로우(`login-chosun`·`login-kdu`·`service-*`) 정상, 30% 할인 유지
- [ ] 기존 `consultation-request.html` 제출 시 **일반(general)** 경로로 쓰레드 생성, `request_type` 기본값 `'general'` 확인
- [ ] 기존 D-10-1 쓰레드 welcome 메시지·"Enter Basic Info" 링크 그대로 노출
- [ ] 기존 관리자 대시보드 일반 쓰레드 관리 기능 정상
- [ ] `npm run validate` (HTML/JS 문법 검증) 통과
- [ ] `npm run validate:biz-i18n` 통과

### 14-10-10. 콘솔 확인 결과 (확정 완료)

3건 모두 콘솔 쿼리 실행 완료 (2026-04-20):

- ✅ `user_role` ENUM 허용값: `customer`, `partner_admin`, `super_admin` → 14-1-1 DDL의 `'super_admin'::user_role` 캐스팅 그대로 사용
- ✅ `consultation_requests` 테이블 실존: **false** → 14-1-2 `CREATE TABLE` 적용
- ✅ `threads.status` 컬럼 타입: `text` → 14-2-1 DDL 그대로 적용, `ALTER TYPE` 불필요

### 14-10-11. 범위 밖 작업(참고)

본 섹션 14 검증 완료 후 착수해야 할 후속 작업 참고:

1. **기존 `handle_new_user()` 트리거 저장소 편입**: 콘솔 정의를 SQL 마이그레이션 파일로 이관, `sql/` 또는 `migrations/`에 반영.
2. **기존 Storage RLS 정리**: `documents`·`passports` 버킷의 미사용 상태 확정 시 삭제 + 관련 정책 삭제.
3. **`profile-documents` admin 정책 보정**: `objects.id = auth.uid()` → 표준 패턴 전환.
4. **`thread_documents` 정책에 경로 제약 추가**.
5. **`confirm-payment` Edge Function L263-271 무시 로직 교체**: 결제 후 쓰레드 생성 실패 시 `system_errors` INSERT.
6. **`send-notification` Edge Function 본체 구현**: Resend 연동.
7. **블로그 디자인 시안 파일 처리 원칙** (확립 완료 · 2026-04-20): 임시 시안은 `blog/drafts/` 하위에 배치하며 `scripts/validate-syntax.js`의 `IGNORE_RELATIVE_PATHS`로 CI 검증에서 제외. 공개 전환 시 `blog/` 루트로 이동. 본 컨벤션은 본 결정 1(2026-04-20)에서 확립됨.

위 6개(1~6)는 이번 섹션 14 구현이 충분히 안정된 후 **별도 명세 + 별도 브랜치**로 진행 권장. 7번은 이미 저장소에 반영됨.

---

## 부록 — 본 섹션 14 구현 시 생성·수정 파일 목록 (요약)

### 신규 생성
- `migrations/20260420_create_business_immigration_profiles.sql`
- `migrations/20260420_create_biz_profile_completed_trigger.sql`
- `migrations/20260420_create_consultation_requests.sql`
- `migrations/20260420_alter_threads_add_business_immigration.sql`
- `migrations/20260420_create_business_immigration_storage.sql`
- `migrations/20260420_create_system_errors.sql`
- `migrations/20260420_create_business_immigration_rpc.sql` (RPC `create_business_immigration_request`)
- `scripts/validate-biz-i18n.js`
- `scripts/biz-i18n-manifest.json`
- `js/business-immigration.js`

### 수정
- `js/supabase-client.js` (함수 추가: `uploadBusinessImmigrationDocument`, `isProfileCompleteForRequest`, `logSystemError`, `createThread` 시그니처 확장)
- `js/ui-components.js` (`showToastWithRetry` 헬퍼 추가)
- `js/translations.js` (7개 언어에 `biz.*` + 공통 키 스텁 추가, `TRANSLATION_PENDING` 주석 포함)
- `css/ui-components.css` (배너·뱃지 스타일 추가)
- `admin-dashboard.html` (`system-errors-badge` DOM + 스크립트)
- `admin-thread.html` (사업이민 상태 선택 UI)
- `thread-general-v2.html` (배너 DOM + `js/business-immigration.js` 로드)
- `visa-thread-general.html` (동일)
- `package.json` (`validate:biz-i18n` 스크립트 별칭)
- `.github/workflows/validate.yml` (`validate-biz-i18n` 스텝)

### 변경 없음 (명시)
- 기존 `profiles` 테이블 스키마
- `on_auth_user_created` 트리거 / `handle_new_user()` 함수
- `profile-documents`·`thread_documents`·`documents`·`passports` 버킷 및 RLS
- `confirm-payment` / `send-notification` Edge Functions
- 기존 welcome 메시지 D-10-1·일반 경로 로직
- 협약 대학 관련 파일·할인 정책
- `data/services.json`, `price-list.html`
- GitHub Pages 호스팅·CNAME·`validate.yml`의 기존 스텝

---

_초안 작성 완료일: 2026-04-20 · 커밋 안 됨_
