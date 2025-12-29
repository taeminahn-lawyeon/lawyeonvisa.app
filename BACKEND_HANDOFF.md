# 🔧 Supabase 백엔드 연동 현황 및 작업 요청서

## 프로젝트 정보
- **사이트**: https://www.lawyeonvisa.app
- **Supabase 프로젝트**: `gqistzsergddnpcvuzba`
- **Supabase URL**: https://gqistzsergddnpcvuzba.supabase.co
- **작성일**: 2025-12-29

---

## 📊 현재 연동 상태 요약

### ✅ 완전히 작동하는 기능

| 기능 | 프론트엔드 | Supabase | 상태 |
|------|-----------|----------|------|
| Google OAuth 로그인 | `signInWithOAuth()` | Auth Provider | ✅ 작동 |
| 프로필 CRUD | `getUserProfile()`, `updateUserProfile()` | `profiles` 테이블 | ✅ 작동 |
| 쓰레드 생성/조회 | `createThread()`, `getUserThreads()` | `threads` 테이블 | ✅ 작동 |
| 메시지 전송/조회 | `createMessage()`, `getThreadMessages()` | `messages` 테이블 | ✅ 작동 |
| 파일 업로드 | `uploadThreadDocument()` | `thread_documents` 버킷 | ✅ 작동 |
| 결제 기록 저장 | `createPayment()` | `payments` 테이블 | ✅ 작동 |

### ⚠️ 부분 작동 / 데모 모드

| 기능 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| Toss 결제 | 데모 모드 (주석 처리) | 실제 결제 연동 활성화 |
| PayPal 결제 | "준비 중" alert | PayPal SDK 연동 |

### ❌ 미구현 기능

| 기능 | 설명 | 필요 작업 |
|------|------|----------|
| 실시간 메시지 | 새 메시지 자동 수신 | Supabase Realtime 구독 |
| 이메일 알림 | 결제/서류 요청 알림 | Resend 또는 Edge Function |
| 환불 처리 | 관리자 환불 기능 | Toss API + DB 업데이트 |

---

## 🗄️ 데이터베이스 테이블 현황

### 1. profiles
```sql
-- 사용자 프로필 (Google 로그인 후 생성)
id UUID PRIMARY KEY  -- auth.users.id와 동일
email VARCHAR
name VARCHAR
phone VARCHAR
nationality VARCHAR
visa_type VARCHAR
visa_expiry DATE
organization VARCHAR  -- 'jnu', 'korea', 'general' 등
role VARCHAR  -- 'customer', 'partner_admin', 'super_admin'
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 2. threads
```sql
-- 서비스 신청 쓰레드
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
service_name VARCHAR
status VARCHAR  -- 'payment', 'document', 'processing', 'completed', 'archived'
amount INTEGER
government_fee INTEGER
order_id VARCHAR
payment_id VARCHAR
organization VARCHAR
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 3. messages
```sql
-- 쓰레드 메시지
id UUID PRIMARY KEY
thread_id UUID REFERENCES threads
sender_id UUID
sender_type VARCHAR  -- 'user', 'admin'
sender_name VARCHAR
content TEXT
file_url TEXT
file_name TEXT
file_type TEXT
created_at TIMESTAMP
```

### 4. payments
```sql
-- 결제 기록
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
order_id VARCHAR UNIQUE
service_name VARCHAR
amount INTEGER
agency_fee INTEGER
govt_fee INTEGER
payment_method VARCHAR
payment_key VARCHAR  -- Toss에서 받은 키
status VARCHAR  -- 'pending', 'completed', 'refunded', 'failed'
organization VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 5. admins
```sql
-- 관리자/담당자 계정
id UUID PRIMARY KEY
email VARCHAR UNIQUE
role VARCHAR  -- 'super_admin', 'admin', 'partner_jnu', 'partner_korea'
name VARCHAR
phone VARCHAR
department VARCHAR
status VARCHAR  -- 'active', 'inactive'
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 6. jnu_students / korea_students
```sql
-- 협약 기관 학생 정보
id UUID PRIMARY KEY
student_number VARCHAR UNIQUE
name VARCHAR
department VARCHAR
nationality VARCHAR
phone VARCHAR
email VARCHAR
visa_type VARCHAR
visa_expiry_date DATE
stay_expiry DATE
diagnosis_completed BOOLEAN
diagnosis_date DATE
user_id UUID REFERENCES auth.users
status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## 🔐 보안 설정 필요 사항

### 1. RLS (Row Level Security) 활성화 필수!

**⚠️ 현재 일부 테이블에 RLS가 비활성화되어 있습니다!**

```sql
-- 즉시 실행 필요: sql/PRODUCTION_SETUP_COMPLETE.sql

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
```

### 2. RLS 정책 요약

| 테이블 | 정책 |
|--------|------|
| profiles | 본인만 조회/수정, super_admin 전체 접근 |
| threads | 본인 쓰레드만 조회/생성, admin 전체 접근 |
| messages | 본인 쓰레드 메시지만 조회/생성 |
| payments | 본인 결제만 조회, super_admin 전체 접근 |

---

## 🚀 백엔드 작업 요청 목록

### 🔴 즉시 필요 (P0)

#### 1. RLS 활성화
```bash
# Supabase SQL Editor에서 실행
sql/PRODUCTION_SETUP_COMPLETE.sql
```

#### 2. 실시간 메시지 수신 구현
프론트엔드에 추가할 코드:
```javascript
// thread-general.html에 추가 필요
const channel = supabaseClient
  .channel('thread-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`
  }, (payload) => {
    // 새 메시지 UI에 추가
    appendMessage(payload.new);
  })
  .subscribe();
```

#### 3. Toss 실결제 활성화
`service-apply-general.html`에서 주석 해제 필요:
```javascript
// 현재 주석 처리된 부분 활성화
await tossPayments.requestPayment('카드', {
    amount: orderInfo.amount,
    orderId: orderInfo.orderId,
    orderName: orderInfo.orderName,
    customerName: orderInfo.customerName,
    customerEmail: orderInfo.customerEmail,
    successUrl: currentUrl + '/payment-success.html',
    failUrl: currentUrl + '/payment-fail.html',
});
```

### 🟡 단기 필요 (P1)

#### 4. 결제 검증 Edge Function
```javascript
// supabase/functions/verify-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { paymentKey, orderId, amount } = await req.json()
  
  // Toss API로 결제 검증
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(TOSS_SECRET_KEY + ':')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ paymentKey, orderId, amount })
  })
  
  // DB 업데이트
  // ...
})
```

#### 5. 이메일 알림 Edge Function
```javascript
// supabase/functions/send-notification/index.ts
// Resend API를 사용한 이메일 발송
```

### 🟢 중기 필요 (P2)

#### 6. 환불 처리 API
#### 7. PayPal 결제 연동
#### 8. CSV 내보내기 기능

---

## 📁 관련 파일 위치

### SQL 파일 (Supabase SQL Editor에서 실행)
```
sql/
├── PRODUCTION_SETUP_COMPLETE.sql  ⭐ 즉시 실행 필요
├── supabase-setup.sql
├── supabase-security-tables.sql
├── setup-admins-table.sql
├── setup-korea-university.sql
└── korea-students-extended.sql
```

### 프론트엔드 Supabase 클라이언트
```
js/supabase-client.js  -- 모든 Supabase 함수 정의
```

### 결제 관련
```
service-apply-general.html  -- Toss 결제 (데모 모드)
service-apply-jnu.html      -- JNU 30% 할인 적용
service-apply-korea.html    -- Korea 30% 할인 적용
payment-success.html        -- 결제 완료 처리
payment-fail.html           -- 결제 실패 처리
```

---

## ✅ 체크리스트

### Supabase Dashboard 설정
- [ ] RLS 활성화 확인 (모든 테이블)
- [ ] Google OAuth Provider 설정 확인
- [ ] Storage Buckets 확인 (`thread_documents`, `user_avatars`)
- [ ] Realtime 활성화 확인
- [ ] Edge Functions 배포 (결제 검증, 이메일)

### 프론트엔드 수정
- [ ] Realtime 구독 코드 추가
- [ ] Toss 실결제 코드 주석 해제
- [ ] 테스트 키 → 실제 키 교체

### 테스트
- [ ] 회원가입 → 프로필 설정 → 서비스 신청 → 결제 → 쓰레드 전체 플로우
- [ ] 관리자 로그인 및 쓰레드 관리
- [ ] 담당자 로그인 및 학생 현황 조회

---

## 📞 문의

**프로젝트 관리자**: 안태민  
**이메일**: taemin.ahn@lawyeon.com  
**GitHub**: https://github.com/taeminahn-lawyeon/lawyeonvisa.app

---

**작성일**: 2025-12-29
