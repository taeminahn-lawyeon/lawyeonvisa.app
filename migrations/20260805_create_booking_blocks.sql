-- migrations/20260805_create_booking_blocks.sql
-- 방문 상담 예약의 (1) 최소 리드타임과 (2) 관리자 지정 차단 시간대.
--
-- 배경:
--  (1) 지금까지는 당일 예약이 열려 있었고, 이미 지난 시간(오늘 오전 10시)도
--      선택할 수 있었다. 앞으로는 오늘·내일을 받지 않고 "신청일 + 2일" 부터
--      받는다. 예) 8월 5일에 신청 → 가장 빠른 방문일은 8월 7일.
--  (2) 그 밖에 사정이 있는 날짜·시간대(예: 8월 6일 10:00~13:00)는 관리자가
--      어드민 대시보드 '예약 차단' 탭에서 직접 막을 수 있다.
--
-- 판정은 브라우저와 DB 양쪽에서 한다. 브라우저 쪽은 안내용이고, 실제 차단은
-- 아래 트리거가 한다(스크립트를 끄고 직접 INSERT 하는 경우까지 막기 위함).
--
-- SQL Editor: https://supabase.com/dashboard/project/gqistzsergddnpcvuzba/sql/new


-- ============================================================
-- 1. 차단 시간대 테이블
-- ============================================================
-- 기간(start_date ~ end_date, 양끝 포함) × 시간대(start_time ~ end_time)로 적는다.
-- start_time / end_time 이 둘 다 NULL 이면 그 기간 전체(종일) 차단이다.
-- end_time 은 '열린 끝'이다. 10:00~14:00 은 10:00·11:00·13:00 슬롯을 막고
-- 14:00 슬롯은 막지 않는다. (어드민 화면은 "13:00 까지"로 고르면 14:00 을 저장한다)

CREATE TABLE IF NOT EXISTS public.booking_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  start_date  date NOT NULL,
  end_date    date NOT NULL,          -- 하루만 막을 때는 start_date 와 같은 값
  start_time  time,                   -- NULL = 종일
  end_time    time,                   -- 열린 끝(이 시각의 슬롯은 막히지 않음)

  reason      text,                   -- 내부 메모. 공개 조회 결과에는 포함하지 않는다.
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT booking_blocks_date_order CHECK (end_date >= start_date),
  CONSTRAINT booking_blocks_time_pair CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

CREATE INDEX IF NOT EXISTS idx_booking_blocks_range
  ON public.booking_blocks(start_date, end_date);

ALTER TABLE public.booking_blocks ENABLE ROW LEVEL SECURITY;

-- 어드민만 조회·등록·삭제. 방문자용 공개 조회는 아래 RPC 로만 연다.
-- 역할 비교는 role::text 로 한다(enum 캐스팅은 값이 없으면 문장 전체가 실패한다).
DROP POLICY IF EXISTS booking_blocks_admin_all ON public.booking_blocks;
CREATE POLICY booking_blocks_admin_all
  ON public.booking_blocks
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


-- ============================================================
-- 2. 방문자용 공개 조회 (날짜·시간만)
-- ============================================================
-- 예약 페이지의 달력이 어느 칸을 잠글지 알아야 하므로 비로그인 방문자도 읽어야 한다.
-- 다만 reason 은 내부 메모이므로 테이블을 통째로 열지 않고, 날짜·시간만
-- 돌려주는 함수를 통해서만 노출한다.

CREATE OR REPLACE FUNCTION public.get_booking_blocks(p_from date, p_to date)
RETURNS TABLE (start_date date, end_date date, start_time time, end_time time)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.start_date, b.end_date, b.start_time, b.end_time
  FROM public.booking_blocks b
  WHERE b.end_date >= p_from
    AND b.start_date <= p_to;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_blocks(date, date) TO anon, authenticated;


-- ============================================================
-- 3. 실제 차단 (reservations INSERT 트리거)
-- ============================================================
-- 리드타임 기준일은 반드시 한국 시간의 '오늘'이다. DB 기본 시간대는 UTC 라서
-- 그냥 current_date 를 쓰면 한국 시간 오전 9시 이전에 하루 밀린다.
--
-- 어드민(super_admin/admin/staff)은 통과시킨다. 전화로 잡은 예약을 대신
-- 넣어야 하는 경우가 있고, 그때까지 막으면 운영이 불가능하다.
--
-- 오류 메시지 앞의 BOOKING_LEAD_TIME / BOOKING_SLOT_UNAVAILABLE 는 프런트엔드가
-- 안내 문구를 고르는 표식이다. 문구를 바꿔도 이 표식은 남겨 둘 것.

CREATE OR REPLACE FUNCTION public.reservations_check_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kst_today date := (now() AT TIME ZONE 'Asia/Seoul')::date;
  slot      time := NEW.reserve_time::time;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role::text IN ('super_admin','admin','staff')
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.reserve_date < kst_today + 2 THEN
    RAISE EXCEPTION
      'BOOKING_LEAD_TIME: 방문 예약은 신청일로부터 2일 뒤부터 가능합니다(가장 빠른 방문일 %).',
      kst_today + 2;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.booking_blocks b
    WHERE NEW.reserve_date BETWEEN b.start_date AND b.end_date
      AND (b.start_time IS NULL OR (slot >= b.start_time AND slot < b.end_time))
  ) THEN
    RAISE EXCEPTION
      'BOOKING_SLOT_UNAVAILABLE: 선택하신 날짜·시간은 예약을 받지 않습니다.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_check_availability ON public.reservations;
CREATE TRIGGER trg_reservations_check_availability
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.reservations_check_availability();


-- PostgREST 스키마 캐시 갱신. 하지 않으면 테이블·함수가 실제로 만들어져 있어도
-- 한동안 PGRST202/PGRST205 (Could not find the ... in the schema cache) 가 난다.
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- 확인용 (선택)
-- ============================================================
-- 8월 6일 10:00~13:00 을 막는 예:
--   INSERT INTO public.booking_blocks (start_date, end_date, start_time, end_time, reason)
--   VALUES ('2026-08-06', '2026-08-06', '10:00', '14:00', '외부 일정');
--   → 10:00 · 11:00 · 13:00 슬롯이 막힌다(12:00 은 원래 점심).
--
-- 현재 등록된 차단:
--   SELECT * FROM public.booking_blocks ORDER BY start_date, start_time;
--
-- 방문자 화면이 보는 것과 같은 결과:
--   SELECT * FROM public.get_booking_blocks(current_date, current_date + 60);
