# Supabase 배포 절차 — 온라인 사전상담

사이트 코드는 이미 배포되어 있어도, **아래 2가지를 하지 않으면 사전상담 폼이 동작하지 않습니다.**
소요 시간 약 5분.

- 프로젝트: `gqistzsergddnpcvuzba`
- 대시보드: https://supabase.com/dashboard/project/gqistzsergddnpcvuzba

---

## 1단계. 테이블 만들기 (SQL 실행)

접수 내용을 저장할 `pre_consultations` 테이블이 없으면 폼 제출이 실패합니다.

1. https://supabase.com/dashboard/project/gqistzsergddnpcvuzba/sql/new 접속
2. 저장소의 **`migrations/20260730_create_pre_consultations.sql` 파일 내용을 전부 복사**해서 붙여넣기
3. 오른쪽 아래 **Run** (또는 `Ctrl`+`Enter`)
4. `Success. No rows returned` 가 나오면 완료

> 여러 번 실행해도 안전합니다 (`IF NOT EXISTS` / `DROP POLICY IF EXISTS` 로 작성되어 있음).

### 확인
같은 SQL Editor에서 아래를 실행합니다.

```sql
select count(*) from public.pre_consultations;
```

`0` 이 나오면 테이블이 정상적으로 만들어진 것입니다.

---

## 2단계. 메일 발송 함수 다시 배포하기

`send-admin-email` 함수에 **사전상담 분기와 Reply-To 처리**가 새로 들어갔습니다.
이걸 배포하지 않으면 접수는 저장되지만 **메일이 오지 않습니다.**

### 방법 A — 대시보드에서 (CLI 없이, 권장)

1. https://supabase.com/dashboard/project/gqistzsergddnpcvuzba/functions 접속
2. 목록에서 **`send-admin-email`** 클릭
3. **Code** 탭 선택
4. 편집기의 내용을 **전부 지우고**, 저장소의
   **`supabase/functions/send-admin-email/index.ts` 파일 내용을 전부 붙여넣기**
5. **Deploy** 클릭

### 방법 B — CLI 가 이미 설치되어 있다면

```bash
supabase functions deploy send-admin-email --project-ref gqistzsergddnpcvuzba
```

### 확인
Functions → `send-admin-email` → **Logs** 에 마지막 배포 시각이 갱신되어 있으면 완료.

---

## 3단계 (선택). 받는 사람 주소를 설정으로 빼기

지금은 코드에 `taemin.ahn@lawyeon.com` 이 기본값으로 박혀 있습니다.
담당자가 바뀔 때 코드를 고치지 않으려면 아래처럼 설정해 두면 됩니다. **지금 안 해도 됩니다.**

1. https://supabase.com/dashboard/project/gqistzsergddnpcvuzba/settings/functions
2. **Add new secret**
3. Name `ADMIN_EMAIL` / Value `taemin.ahn@lawyeon.com`
4. Save 후 2단계의 배포를 한 번 더 실행

---

## 마지막 확인 — 실제로 한 건 넣어 보기

1. https://www.lawyeonvisa.app/consultation 접속
2. 이름·이메일(**본인 메일 주소로**)·연락처·분야·체류 여부를 채우고 **사전상담 신청**
3. 아래 3가지를 확인합니다.

| 확인할 것 | 정상 결과 |
|---|---|
| 화면 | "신청이 접수되었습니다 ✓" 카드가 뜬다 |
| 메일 | `taemin.ahn@lawyeon.com` 으로 `[Lawyeon] 사전상담 신청 — 홍길동 (비자·체류)` 도착 |
| **답장 버튼** | 메일에서 **'답장'을 눌렀을 때 받는 사람이 신청자 이메일**로 자동 설정된다 |
| 대시보드 | `admin-dashboard.html` → **사전상담** 탭에 해당 건이 보이고 뱃지에 숫자가 뜬다 |

세 번째 항목이 이번 변경의 핵심입니다. 받는 사람이 `noreply@lawyeonvisa.app` 로 나오면
2단계 배포가 반영되지 않은 것이니 다시 배포해 주세요.

테스트로 넣은 건은 대시보드 사전상담 탭의 **삭제** 버튼으로 지우면 됩니다.

---

## 안 될 때

| 증상 | 원인과 조치 |
|---|---|
| "신청을 전송하지 못했습니다" 알림 | 1단계 SQL 미실행. 테이블이 없습니다 |
| 화면은 접수됐는데 메일이 안 옴 | 2단계 배포 미실행, 또는 `RESEND_API_KEY` 시크릿 누락. Functions → Logs 에서 오류 확인 |
| 메일은 오는데 답장 주소가 회사 주소 | 2단계 배포가 이전 버전. 다시 배포 |
| 대시보드 사전상담 탭이 비어 있음 | 로그인한 관리자 계정의 `profiles.role` 이 `super_admin`/`admin`/`staff` 중 하나여야 합니다 |

---

## 참고 — 보유기간 자동 파기 (선택)

접수 후 3년이 지난 건을 지우는 함수 `purge_old_pre_consultations()` 가 1단계에서 함께 만들어집니다.
자동 실행을 원하면 `pg_cron` 확장을 켠 뒤 SQL Editor 에서 한 번만 실행하세요.

```sql
select cron.schedule('purge-pre-consultations', '0 3 * * *',
                     $$select public.purge_old_pre_consultations()$$);
```

**개인정보 처리방침에 적을 보유기간과 이 3년이 일치해야 합니다.**
기간을 바꾸려면 함수 안의 `interval '3 years'` 를 수정하세요.
