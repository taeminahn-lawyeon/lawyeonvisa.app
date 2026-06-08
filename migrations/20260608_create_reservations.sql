-- migrations/20260608_create_reservations.sql
-- 방문 상담 예약(booking) 저장 테이블.
-- 방문 예약은 로그인 없이도 접수 가능하므로 anon INSERT 를 허용한다.
-- 조회/관리는 super_admin 만(또는 로그인 사용자 본인 레코드).

CREATE TABLE IF NOT EXISTS public.reservations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 로그인 상태로 예약했다면 user_id 기록(선택). 비로그인 예약은 NULL.
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  name          text NOT NULL,
  phone         text NOT NULL,
  office        text,            -- '서울사무소' / '광주사무소'
  topic         text,            -- 상담 분야
  reserve_date  date NOT NULL,   -- 방문 날짜
  reserve_time  text NOT NULL,   -- 방문 시간 'HH:MM'
  memo          text,            -- 상담 내용(선택)
  lang          text NOT NULL DEFAULT 'ko' CHECK (lang IN ('ko','en')),

  status        text NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','confirmed','cancelled','done')),

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_date    ON public.reservations(reserve_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status  ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 방문자 누구나(비로그인 포함) 예약 접수 가능
DROP POLICY IF EXISTS reservations_public_insert ON public.reservations;
CREATE POLICY reservations_public_insert
  ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 로그인 사용자는 자신의 예약만 조회 가능
DROP POLICY IF EXISTS reservations_owner_select ON public.reservations;
CREATE POLICY reservations_owner_select
  ON public.reservations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- super_admin: 전체 조회·관리
DROP POLICY IF EXISTS reservations_super_admin_all ON public.reservations;
CREATE POLICY reservations_super_admin_all
  ON public.reservations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));
