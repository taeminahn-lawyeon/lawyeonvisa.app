# 법무법인 로연 출입국이민지원센터

## 📌 프로젝트 개요

법무법인 로연의 출입국 이민 지원을 위한 통합 웹 서비스입니다.
- **일반 회원 시스템**: 개인 외국인을 위한 출입국 민원 대행 서비스
- **협약 기관 시스템**: 전남대학교, 서울대학교 등 협약 대학 학생 전용 서비스 (**일반 페이지와 완전 통일됨**)
- **관리자 시스템**: 법무법인 직원용 쓰레드·고객 관리 대시보드
- **담당자 시스템**: 제휴기관 담당자용 외국인 체류 현황 모니터링

---

## 🏢 사업자 정보

**법무법인 로연 (Law Firm Lawyeon)**
- **대표자**: 민준우
- **사업자등록번호**: 391-85-03007
- **주소**: 서울특별시 강서구 공항대로 164, 503호(마곡동, 류마타Tower)
- **대표 전화**: 02-2039-0544
- **이메일**: taemin.ahn@lawyeon.com
- **개인정보보호책임자**: 안태민 (taemin.ahn@lawyeon.com)
- **관리자 계정**: taemin.ahn@lawyeon.com (super_admin)

---

## 🎯 핵심 기능

### 1. **일반 회원 시스템**

#### 📄 주요 페이지
```
index.html                   # 메인 페이지 (로그인 전/후 통합)
profile-setup.html           # 프로필 설정 (기본정보)
profile-edit.html            # 프로필 수정
service-apply-general.html   # 서비스 신청/결제 (2단계)
payment-success.html         # 결제 완료
payment-fail.html            # 결제 실패
partnership-apply.html       # 제휴 신청
partnership-apply-success.html # 제휴 신청 완료
thread-archive.html          # 쓰레드 아카이브 (완료된 서비스)
faq.html                     # 자주 묻는 질문
terms.html                   # 이용약관
privacy.html                 # 개인정보처리방침
```

#### 🆕 **서비스 신청 시스템** (2단계 프로세스)
```
Step 1: 서비스 확인 → Step 2: 결제
```

**서류 제출 방식**:
- ✅ 결제 완료 후 → **쓰레드에서 센터 담당자가 서류 요청**
- ✅ 결제 전 서류 업로드 불필요
- ✅ 간소화된 신청 프로세스

**주요 기능**:
- ✅ **33개 출입국 민원 서비스** (정부 수수료 포함)
  - 비자 (4개): 발급, 연장, 변경, 부여
  - 체류 신고 (8개): 시간제취업, 근무처변경 등
  - 이민·국적·난민 (9개): 귀화, 국적회복, 난민 등
  - 외국인 등록 (3개): 신청, 재발급, 변경
  - 자문 (3개): 비자, 교육, 단체 (견적 협의)
  - 증명서 (6개): 출입국사실, 외국인등록사실 등
- ✅ **정부 수수료 통합 징수** (센터가 대납)
- ✅ **해외 결제 연동** (Toss Payments Global, PayPal)

#### 🧵 **쓰레드 시스템** (NEW - 개선됨)

**신청 건마다 개별 쓰레드 생성**:
- ✅ 결제 완료 시 자동으로 쓰레드 생성
- ✅ 사전진단 실시 시 진단 결과를 해당 쓰레드에 기록 (추가 쓰레드 생성 없음)
- ✅ 견적 상담 신청 시 쓰레드 생성
- ✅ 센터 담당자와 1:1 커뮤니케이션
- ✅ 쓰레드에서 서류 요청 및 진행 상황 확인
- ✅ 대행 완료 시 쓰레드 아카이빙 처리

**쓰레드 상태 관리**:
1. `payment` - 결제 완료
2. `document` - 서류 수집 중
3. `processing` - 신청 진행 중
4. `completed` - 처리 완료
5. `archived` - 완료 (보관)

**쓰레드 확인 위치**:
- `index.html` → "나의 신청 내역" 섹션
- 활성 쓰레드 / 아카이브된 쓰레드 모두 표시
- `thread-archive.html`에서 완료된 서비스 및 문서 다운로드

---

### 2. **협약 기관 시스템** (대학 전용)

#### 📁 전남대학교 (JNU) 파일
```
visa-login-jnu.html           # 로그인 (대문 페이지, Google 로그인)
visa-dashboard-jnu.html       # 대학 대시보드 (index.html과 동일 구조)
visa-profile-setup-jnu.html   # 프로필 설정 (전용 컬러 적용)
visa-service-apply-jnu.html   # 서비스 신청 (결제 페이지, Toss 스타일)
visa-thread-jnu.html          # 쓰레드 (1:1 상담)
payment-success-jnu.html      # 결제 완료 (전용 컬러 적용)
payment-fail-jnu.html         # 결제 실패 (전용 컬러 적용)
```

#### 🎯 **핵심 특징**
- ✅ **전용 로그인 페이지** (대문 페이지)
- ✅ **Google 로그인** 사용 (학교 이메일 불필요)
- ✅ **학번/사번/회원번호로 소속 인증** (기본정보 제출 시)
- ✅ **30% 할인가** 자동 적용 (천원 단위 반올림)
- ✅ **index.html과 완전 동일한 구조** (브랜드 컬러만 차별화)

#### 🎨 브랜드 컬러

**전남대학교 (JNU) 전용**:
- 로그인 페이지: **전체 배경 Green 그라디언트 `#007A33 → #005A25`**
- 헤더: **3단계 Green 그라디언트 `#00A651 → #007A33 → #005A25`** + Gold Border `#FFD700`
- 긴급 구제 배너: **Orange `#f59e0b → #f97316`**
- 모든 버튼/강조 요소: **Green 그라디언트 `#00A651 → #007A33`**
- 결제 성공/실패 페이지: **Green 헤더 + 아이콘**

**서울대학교 (SNU) 전용** (구현 예정):
- 헤더: Blue `#0E4A84 → #0C3D6E`

#### 💰 가격 정책 (협약 기관 30% 할인)

**비자 서비스**:
- 비자 발급/변경/부여: ₩880,000 → **₩616,000** (30% 할인) + 정부 수수료
- 비자 연장: ₩550,000 → **₩385,000** + ₩50,000 (정부) = **₩435,000**

**체류 신고 (8개)**: ₩110,000 → **₩77,000** + 정부 수수료

**이민·국적·난민**:
- 귀화 신청: ₩1,100,000 → **₩770,000** + ₩300,000 = **₩1,070,000**
- 국적회복: ₩330,000 → **₩231,000** + ₩200,000 = **₩431,000**

---

### 3. **관리자 시스템** (NEW)

#### 📄 관리자 페이지
```
admin-dashboard.html          # 법무법인 직원용 관리자 대시보드
```

**주요 기능**:
- ✅ **전체 고객 및 쓰레드 관리**
  - 진행 중 쓰레드 실시간 모니터링
  - 쓰레드 상태 변경 (payment → document → processing → completed → archived)
  - 우선순위 지정 (보통, 높음, 긴급)
- ✅ **통계 대시보드**
  - 전체 고객 수
  - 진행 중 쓰레드 수
  - 긴급 케이스 수
  - 이번 달 매출
- ✅ **필터 및 검색**
  - 고객명, 서비스명, 상태, 우선순위 필터
- ✅ **문서 요청 기능**
  - 쓰레드 내 문서 요청 메시지 전송
- ✅ **결제 관리**
  - 전체 결제 내역 조회
  - 환불 처리

**접근 권한**:
- 이메일에 "admin" 포함 시 접근 가능 (개발 모드)
- 실제 환경: Supabase RLS로 `super_admin` 역할만 접근

---

### 4. **담당자 시스템** (NEW)

#### 📄 담당자 페이지
```
partner-dashboard.html        # 제휴기관 담당자용 대시보드 (?org=jnu 등으로 구분)
```

**주요 기능**:
- ✅ **소속 외국인 체류 현황 모니터링**
  - 전체 외국인 수, 정상/주의/위험 상태 통계
  - 비자 만료일 임박자 알림 (30일/15일 이내)
- ✅ **불법체류 사전진단 현황** (연 2회 의무)
  - 진단 완료/미완료 현황
  - 미완료자 일괄 알림 발송
- ✅ **외국인 상세 정보**
  - 이름, 국적, 비자 종류, 만료일
  - 사전진단 이력
  - **제한**: 쓰레드, 결제 내역, 민감 개인정보 미공개
- ✅ **필터 및 검색**
  - 이름, 국적, 비자 종류, 체류 상태

**접근 권한**:
- @jnu.ac.kr, @snu.ac.kr 이메일로 접근 (개발 모드)
- 실제 환경: Supabase RLS로 `partner_admin` 역할, 자기 조직 멤버만 조회

---

### 5. **법적 문서** (NEW)

#### 📄 법적 필수 페이지
```
terms.html                    # 이용약관 (법무법인 로연 사업자 정보 반영)
privacy.html                  # 개인정보처리방침 (개인정보보호책임자: 안태민)
```

**이용약관 주요 내용**:
- 서비스 이용 계약
- 결제 및 환불 정책 (착수 전 100%, 진행 중 50%, 완료 후 불가)
- 개인정보 수집 동의
- 책임의 제한 (비자 승인 거부는 법무법인 책임 아님)
- 분쟁 해결 (서울중앙지방법원)

**개인정보처리방침 주요 내용**:
- 개인정보 수집 항목 및 목적 (비자 신청, 법률 자문)
- 제3자 제공 (법무부 출입국관리사무소, 결제대행사)
- 보유 및 이용 기간 (서비스 완료 후 5년)
- 안전성 확보 조치 (AES-256 암호화, HTTPS, RLS)
- 정보주체의 권리 (열람, 정정, 삭제, 처리 정지)

---

### 6. **편의 기능** (NEW)

#### 📄 추가 페이지
```
faq.html                      # 자주 묻는 질문 (4개 카테고리)
```

**FAQ 카테고리**:
1. **서비스 이용**: 비자 신청 기간, 절차, 서류 준비
2. **결제 및 환불**: 결제 방식, 환불 정책, 세금계산서
3. **문서 제출**: 필요 서류, 제출 방법, 제출 기한
4. **제휴 혜택**: 할인율, 적용 방법, 사전진단, 제휴 신청

---

## 🔧 기술 스택

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **Font**: Noto Sans KR (Google Fonts)
- **Icons**: Font Awesome 6.4.0

### Data Storage (현재)
- **LocalStorage**: 클라이언트 측 데이터 저장 (개발용)
  - `user`: Google 로그인 사용자 정보
  - `userProfile`: 회원 프로필 정보
  - `userThreads`: 사용자별 쓰레드 목록
  - `currentThreadId`: 현재 활성 쓰레드 ID
  - `pendingOrder`: 결제 대기 주문 정보

### Backend (실제 배포 시 구현 필요)
- **Supabase**: PostgreSQL 데이터베이스, 인증, 파일 저장소
  - `users` 테이블: 사용자 정보, 역할 (customer, partner_admin, super_admin)
  - `threads` 테이블: 쓰레드 정보, 상태, 메시지
  - `diagnosis_records` 테이블: 불법체류 사전진단 이력
  - `payments` 테이블: 결제 내역
  - **Row Level Security (RLS)**: 역할별 접근 제어
- **Netlify Functions**: 서버리스 백엔드 (결제 검증, 이메일 발송)
- **Resend**: 이메일 발송 서비스
- **Toss Payments / PayPal**: 결제 대행

### 보안
- **AES-256-GCM**: 클라이언트 측 문서 암호화 (여권, 외국인등록증)
- **HTTPS (TLS 1.3)**: 모든 데이터 전송 암호화
- **Row Level Security**: Supabase 데이터베이스 접근 제어
- **접근 로그**: 모든 문서 접근 기록 3년 보관

---

## 🔐 보안 가이드

프로젝트에는 다음 보안 문서가 포함되어 있습니다:

```
SETUP_GUIDE.md              # Supabase, Netlify, Email/Payment 설정 가이드
supabase-setup.sql          # Supabase 데이터베이스 스키마 및 RLS 정책
supabase-security-tables.sql # 보안 감사 테이블 (접근 로그, 문서 이력)
SECURITY_GUIDE.md           # 전자문서 보안 구현 가이드
js/secure-file-handler.js   # 클라이언트 측 파일 암호화/복호화 모듈
```

**주요 보안 조치**:
1. **클라이언트 측 암호화 (E2EE)**: 여권, 외국인등록증 등 민감 문서는 클라이언트에서 암호화 후 업로드
2. **Supabase Storage RLS**: 파일 업로드/다운로드 권한 제어
3. **접근 로그 기록**: 누가, 언제, 어떤 파일에 접근했는지 3년간 보관
4. **문서 이력 추적**: 문서 업로드, 다운로드, 삭제 이벤트 기록

**법적 준수**:
- 개인정보 보호법 제24조, 제29조 (암호화, 접근 통제)
- 전자문서법 제9조 (위·변조 방지)
- 정보통신망법 제28조 (암호화, 보안 프로그램)

---

## 📂 파일 구조

```
📦 프로젝트 루트
├── 📄 index.html                    # 메인 페이지
├── 📄 profile-setup.html            # 프로필 설정
├── 📄 profile-edit.html             # 프로필 수정 (NEW)
├── 📄 service-apply-general.html    # 서비스 신청/결제 (2단계)
├── 📄 payment-success.html          # 결제 완료
├── 📄 payment-fail.html             # 결제 실패
├── 📄 partnership-apply.html        # 제휴 신청
├── 📄 partnership-apply-success.html # 제휴 신청 완료 (NEW)
├── 📄 thread-archive.html           # 쓰레드 아카이브 (NEW)
├── 📄 faq.html                      # 자주 묻는 질문 (NEW)
├── 📄 terms.html                    # 이용약관 (NEW)
├── 📄 privacy.html                  # 개인정보처리방침 (NEW)
│
├── 📁 관리자/담당자 시스템 (NEW)
│   ├── admin-dashboard.html         # 법무법인 직원용 관리자 대시보드
│   └── partner-dashboard.html       # 제휴기관 담당자용 대시보드
│
├── 📁 전남대학교 (JNU)
│   ├── visa-login-jnu.html
│   ├── visa-profile-setup-jnu.html
│   ├── visa-dashboard-jnu.html
│   ├── visa-service-apply-jnu.html
│   ├── visa-thread-jnu.html
│   ├── payment-success-jnu.html
│   └── payment-fail-jnu.html
│
├── 📁 보안 가이드 (NEW)
│   ├── SETUP_GUIDE.md               # Supabase/Netlify 설정 가이드
│   ├── supabase-setup.sql           # DB 스키마 및 RLS 정책
│   ├── supabase-security-tables.sql # 보안 감사 테이블
│   └── SECURITY_GUIDE.md            # 전자문서 보안 구현 가이드
│
└── 📁 js/
    ├── secure-file-handler.js       # 파일 암호화/복호화 모듈 (NEW)
    ├── chat-widget.js               # 채팅 위젯
    └── payment-integration.js       # 결제 연동 (Toss, PayPal)
```

---

## ✅ 완료된 작업

### 2025-12-07 업데이트 (최신) ✨
- ✅ **법적 문서 작성**
  - `terms.html`: 이용약관 (사업자 정보 반영)
  - `privacy.html`: 개인정보처리방침 (개인정보보호책임자: 안태민)
- ✅ **관리자 시스템 구축**
  - `admin-dashboard.html`: 전체 쓰레드 관리, 통계, 필터, 상태 변경
- ✅ **담당자 시스템 구축**
  - `partner-dashboard.html`: 소속 외국인 체류 현황 모니터링, 사전진단 현황
- ✅ **사용자 편의 기능**
  - `profile-edit.html`: 프로필 수정 페이지
  - `partnership-apply-success.html`: 제휴 신청 완료 페이지
  - `faq.html`: 자주 묻는 질문 (4개 카테고리, 아코디언 방식)
  - `thread-archive.html`: 완료된 서비스 내역 조회 및 문서 다운로드
- ✅ **보안 문서 작성**
  - `SETUP_GUIDE.md`: Supabase/Netlify/Email/Payment 설정 가이드
  - `supabase-setup.sql`: DB 스키마 및 RLS 정책
  - `supabase-security-tables.sql`: 보안 감사 테이블
  - `SECURITY_GUIDE.md`: 전자문서 보안 구현 가이드
  - `js/secure-file-handler.js`: 클라이언트 암호화 모듈

### 2025-12-05 업데이트
- ✅ 서비스 신청 프로세스 4단계 → 2단계 간소화
- ✅ 쓰레드 시스템 구현 (신청 건마다 개별 쓰레드 생성)
- ✅ 사전진단은 쓰레드 내에서 진행 (추가 쓰레드 생성 없음)
- ✅ index.html "나의 신청 내역" 실제 동작 구현
- ✅ 정부 수수료 통합 징수 시스템
- ✅ Toss 스타일 결제 페이지 완전 재설계
- ✅ 용어 개선 ("무료 상담" → "견적 상담", 친근한 문구)
- ✅ 모바일 UX 대폭 개선 (Toss 스타일)
- ✅ **전용 페이지 완전 통일** (JNU 페이지를 index.html 기반으로 재작성)
- ✅ **협약 기관 30% 할인 시스템 구축** (천원 단위 반올림)
- ✅ **Google 로그인 통합** (학번 로그인 → Google 로그인)
- ✅ **전남대 전용 사이트 오렌지 테마** (긴급 구제 배너만 Orange)
- ✅ **전남대 전체 그린 그라디언트 통일** (모든 Toss 블루 → Green)

---

## 🚀 다음 작업 (TODO)

### 🔴 High Priority (백엔드 구현 필요)
- [ ] **Supabase 데이터베이스 설정**
  - `supabase-setup.sql` 실행하여 테이블 및 RLS 정책 생성
  - `supabase-security-tables.sql` 실행하여 보안 감사 테이블 생성
- [ ] **Netlify Functions 구현**
  - 결제 검증 API
  - 이메일 발송 API
  - 파일 업로드/다운로드 API
- [ ] **Google OAuth 2.0 실제 연동**
  - 소셜 로그인 실제 구현
  - 사용자 정보 Supabase 저장
- [ ] **Toss Payments / PayPal 실제 연동**
  - 실제 결제 처리
  - 결제 검증 서버 구현
- [ ] **쓰레드 메시지 시스템 구현**
  - 실시간 메시지 전송 (Supabase Realtime)
  - 파일 업로드 (암호화 후 Supabase Storage)
  - 문서 다운로드 (복호화)

### 🟡 Medium Priority
- [ ] **서울대학교 (SNU) 전용 페이지 완성**
  - JNU 페이지 복사 후 브랜드 색상 변경 (Blue)
  - 7개 페이지: login, dashboard, profile-setup, service-apply, thread, payment-success, payment-fail
- [ ] **이메일 알림 시스템**
  - 결제 완료 알림
  - 서류 요청 알림
  - 사전진단 알림 (담당자 → 외국인)
- [ ] **관리자 기능 강화**
  - 쓰레드 메시지 전송 (문서 요청)
  - 환불 처리 로직
  - 통계 리포팅
- [ ] **담당자 기능 강화**
  - 일괄 알림 발송 (Resend)
  - CSV 내보내기 (외국인 목록)

### 🟢 Low Priority
- [ ] **비자 사전진단 상세 페이지**
  - `visa-diagnosis.html` (일반 회원용)
  - `visa-diagnosis-jnu.html` (JNU 전용)
  - 체크리스트 기반 위험도 분석
  - 진단 결과를 쓰레드에 기록
- [ ] **UI/UX 개선**
  - 로딩 스피너
  - 토스트 알림
  - 애니메이션 효과
- [ ] **다국어 지원**
  - 영어, 중국어, 베트남어 등

---

## 🔗 주요 경로 (User Flow)

### 일반 회원
```
index.html 
  → (로그인) 
  → profile-setup.html 
  → index.html (메인)
  → service-apply-general.html (결제)
  → payment-success.html (완료)
  → thread-archive.html (완료된 서비스 조회)
```

### 협약 기관 (JNU)
```
index.html (메인 페이지)
  → "협약 단체 전용" → "대학교·어학원" → "전남대학교" 클릭
  → visa-login-jnu.html (대문 페이지, Google 로그인)
      - 전체 배경: Green 그라디언트
      - Google 로그인 → 프로필 확인
  → visa-profile-setup-jnu.html (최초 로그인 시, JNU Green 컬러)
      → visa-dashboard-jnu.html 완료 후 자동 이동
  → visa-dashboard-jnu.html (일반 index.html과 동일 구조, JNU 브랜딩)
      - 헤더: Green + Gold Border
      - 긴급 구제 배너: Orange (Toss 스타일)
  → visa-service-apply-jnu.html (30% 할인 자동 적용, Toss 스타일)
  → payment-success-jnu.html (결제 완료, 쓰레드 자동 생성, JNU Green 컬러)
  → visa-thread-jnu.html (쓰레드, JNU Green 컬러)
```

### 관리자 (법무법인 직원)
```
index.html
  → (admin@ 이메일로 로그인)
  → admin-dashboard.html
      - 전체 쓰레드 조회
      - 상태 변경 (payment → document → processing → completed → archived)
      - 우선순위 지정
      - 필터 및 검색
```

### 담당자 (제휴기관 담당자)
```
index.html
  → (@jnu.ac.kr 또는 @snu.ac.kr 이메일로 로그인)
  → partner-dashboard.html?org=jnu
      - 소속 외국인 체류 현황 조회
      - 사전진단 현황 확인
      - 미완료자 일괄 알림 발송
```

---

## 📞 연락처

**법무법인 로연 출입국이민지원센터**
- **대표변호사**: 민준우
- **사업자등록번호**: 391-85-03007
- **주소**: 서울특별시 강서구 공항대로 164, 503호(마곡동, 류마타워)
- **대표 전화**: 02-2039-0544
- **이메일**: taemin.ahn@lawyeon.com
- **개인정보보호책임자**: 안태민 (taemin.ahn@lawyeon.com)

---

## 📝 변경 이력

### 2025-12-07 (최신)
- ✅ **법적 문서 작성** (이용약관, 개인정보처리방침)
- ✅ **관리자 시스템 구축** (쓰레드 관리, 통계, 상태 변경)
- ✅ **담당자 시스템 구축** (외국인 체류 현황, 사전진단 모니터링)
- ✅ **사용자 편의 기능** (프로필 수정, 제휴 신청 완료, FAQ, 쓰레드 아카이브)
- ✅ **보안 가이드 작성** (Supabase, Netlify, 파일 암호화)

### 2025-12-05
- ✅ **쓰레드 시스템 개선** (신청 건마다 개별 쓰레드 생성)
- ✅ **사전진단 로직 변경** (쓰레드 내 진행, 추가 쓰레드 생성 없음)
- ✅ **서비스 신청 간소화** (4단계 → 2단계)
- ✅ **정부 수수료 시스템** (통합 징수, 명확한 금액 표시)
- ✅ **Toss 스타일 결제 페이지** (완전 재설계)
- ✅ **용어 및 UX 개선** (친근한 문구, 모바일 최적화)

### 2024-12-04
- ✅ 메인 사이트 전면 개편
- ✅ 프로필 설정 간소화
- ✅ 모바일 UI/UX 개선

---

## 📌 중요 사항

1. **서류 수집 시점**
   - ❌ 가입 시: 서류 제출 없음
   - ❌ 결제 전: 서류 제출 없음
   - ✅ 결제 후: 쓰레드에서 센터 담당자가 서류 요청

2. **쓰레드 운영**
   - 신청 건마다 개별 쓰레드 생성
   - 대행 완료 시 아카이빙
   - 사전진단은 쓰레드 내에서 진행 (추가 쓰레드 생성 없음)

3. **결제 시스템**
   - 센터 수수료 + 정부 수수료 통합
   - Toss Payments Global / PayPal
   - 견적 협의 서비스는 상담 후 결제

4. **용어 통일**
   - ✅ "센터 담당자" (일관 사용)
   - ✅ "견적 상담" (자문 서비스)
   - ✅ "쓰레드" (1:1 커뮤니케이션)

5. **보안 준수**
   - 개인정보보호법, 전자문서법, 정보통신망법 준수
   - AES-256 암호화, HTTPS, Row Level Security
   - 접근 로그 3년 보관

---

**Last Updated**: 2025-12-07
