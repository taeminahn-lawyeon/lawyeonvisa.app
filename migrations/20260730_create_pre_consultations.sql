-- migrations/20260730_create_pre_consultations.sql
-- 온라인 사전상담(Pre-consultation) 접수 테이블.
--
-- 배경: 온라인 상담이 "비공개 쓰레드 개설"에서 "폼 접수 → 담당 변호사 메일 발송"
-- 으로 바뀌었다. 접수 건은 이 테이블에 한 행으로 남고, 확인은 어드민 대시보드에서 한다.
-- 로그인이 없어졌으므로 user_id 컬럼을 두지 않고, anon INSERT 를 허용한다.
-- 조회/관리는 어드민(super_admin/admin/staff)만 — corporate_inquiries 와 동일한 구조.

CREATE TABLE IF NOT EXISTS public.pre_consultations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  name          text NOT NULL,
  email         text NOT NULL,   -- 회신 주소. 메일의 Reply-To 로 사용되므로 필수.
  phone         text NOT NULL,
  category      text,            -- 사안 분야(비자·체류 / 형사 / …)

  in_korea      boolean NOT NULL DEFAULT false,
  visa          text,            -- 국내 체류 중인 경우의 체류자격
  visa_expiry   date,            -- 국내 체류 중인 경우의 체류 만료일
  country       text,            -- 해외 거주인 경우의 국가

  message       text,
  lang          text NOT NULL DEFAULT 'ko' CHECK (lang IN ('ko','en')),

  status        text NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','contacted','closed')),

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pre_consultations_status  ON public.pre_consultations(status);
CREATE INDEX IF NOT EXISTS idx_pre_consultations_created ON public.pre_consultations(created_at DESC);

ALTER TABLE public.pre_consultations ENABLE ROW LEVEL SECURITY;

-- 방문자 누구나(비로그인 포함) 접수 가능. 되읽기는 허용하지 않으므로
-- 클라이언트가 id 를 만들어 넣고, 메일 발송은 service role 로 재조회한다.
DROP POLICY IF EXISTS pre_consultations_public_insert ON public.pre_consultations;
CREATE POLICY pre_consultations_public_insert
  ON public.pre_consultations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 보유기간: 접수 후 3년이 지난 건은 파기한다.
-- 개인정보 처리방침에 명시한 보유기간과 반드시 일치시킬 것.
-- pg_cron 이 설치된 프로젝트에서는 아래 주석의 스케줄을 등록해 자동 실행한다.
--   SELECT cron.schedule('purge-pre-consultations', '0 3 * * *',
--                        $$SELECT public.purge_old_pre_consultations()$$);
-- 설치되어 있지 않다면 어드민이 주기적으로 직접 호출하면 된다.
CREATE OR REPLACE FUNCTION public.purge_old_pre_consultations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.pre_consultations
  WHERE created_at < now() - interval '3 years';
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_pre_consultations() FROM PUBLIC, anon;

-- 어드민: 전체 조회·관리 (reservations_admin_all 과 동일한 역할 집합)
--
-- 역할 비교는 반드시 role::text 로 한다. 문자열을 'staff'::user_role 처럼
-- enum 으로 캐스팅하면 해당 값이 enum 에 없을 때 문장 자체가 에러를 내고,
-- Supabase SQL 편집기는 전체를 한 트랜잭션으로 실행하므로 테이블 생성까지
-- 함께 롤백된다. 20260608_reservations_admin_select.sql 과 같은 형태를 쓴다.
DROP POLICY IF EXISTS pre_consultations_admin_all ON public.pre_consultations;
CREATE POLICY pre_consultations_admin_all
  ON public.pre_consultations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role::text IN ('super_admin','admin','staff')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role::text IN ('super_admin','admin','staff')
  ));

-- PostgREST 스키마 캐시 갱신. 이걸 하지 않으면 테이블이 실제로 만들어져 있어도
-- 잠시 동안 PGRST205 (Could not find the table ... in the schema cache) 가 난다.
NOTIFY pgrst, 'reload schema';
