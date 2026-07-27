-- migrations/20260726_add_message_read_receipts.sql
-- 쓰레드 답글 읽음 확인(Read Receipt) 기능
--
-- 목적: 관리자가 보낸 답글을 고객이 실제로 열어봤는지 확인할 수 있도록 한다.
--       (반대 방향 — 고객 메시지를 관리자가 확인했는지 — 도 동일하게 기록된다.)
--
-- 구성:
--   1) messages.read_at 컬럼 추가 (NULL = 아직 안 읽음)
--   2) 기존(현재 열려있는) 모든 쓰레드 백필 — 상대방이 이후에 답장한 메시지는 읽은 것으로 간주
--   3) mark_thread_messages_read(uuid)  : 쓰레드 열람 시 상대방 메시지를 읽음 처리하는 RPC
--   4) get_thread_read_summary()        : 관리자 대시보드용 쓰레드별 읽음 요약 RPC
--
-- Supabase SQL Editor에서 실행하세요.

-- ============================================
-- STEP 1: read_at 컬럼
-- ============================================

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

COMMENT ON COLUMN public.messages.read_at IS
  '수신 상대방이 쓰레드를 열어 이 메시지를 확인한 시각 (NULL = 미확인)';

-- 쓰레드별 미확인 메시지 조회 최적화
CREATE INDEX IF NOT EXISTS idx_messages_thread_read_at
  ON public.messages(thread_id, read_at);

-- ============================================
-- STEP 2: 기존 쓰레드 백필
-- ============================================
-- 현재 열려있는 쓰레드에도 기능이 바로 적용되도록 과거 메시지를 정리한다.
--
--  (1) "상대방이 그 뒤에 답장을 남겼다" = "그 이전 메시지는 확실히 읽었다"
--      → 가장 빠른 상대방 답장 시각을 읽음 시각으로 채운다.
--  (2) 그래도 남는 메시지(각 쓰레드의 마지막 발언 등)는 읽었는지 알 수 없다.
--      → read_tracked = false 로 표시해 화면에서 "안 읽음"이 아니라
--        "확인 기록 없음"으로 구분 표시한다. 잘못된 미열람 표시를 막기 위함.
--
-- 이후 새로 생성되는 메시지는 read_tracked 기본값 true → 정상 추적 대상.
-- 관리자 발신 판정: sender_type in ('admin','staff','system') 또는 sender_id IS NULL(시스템 메시지)
--
-- read_tracked 컬럼이 없을 때만 실행 → 재실행해도 최신 메시지가 훼손되지 않음(멱등).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name   = 'messages'
       AND column_name  = 'read_tracked'
  ) THEN
    RAISE NOTICE '백필 생략 — read_tracked 컬럼이 이미 존재합니다(적용 완료된 마이그레이션).';
    RETURN;
  END IF;

  ALTER TABLE public.messages
    ADD COLUMN read_tracked boolean NOT NULL DEFAULT true;

  -- (1) 상대방 답장이 있는 메시지 → 읽음으로 확정
  WITH flagged AS (
      SELECT
          id,
          thread_id,
          created_at,
          (sender_type IN ('admin', 'staff', 'system') OR sender_id IS NULL) AS from_admin
      FROM public.messages
  ),
  first_reply AS (
      SELECT
          m.id,
          MIN(r.created_at) AS replied_at
      FROM flagged m
      JOIN flagged r
        ON r.thread_id = m.thread_id
       AND r.created_at > m.created_at
       AND r.from_admin <> m.from_admin   -- 상대방이 보낸 메시지
      GROUP BY m.id
  )
  UPDATE public.messages m
     SET read_at = f.replied_at
    FROM first_reply f
   WHERE m.id = f.id
     AND m.read_at IS NULL;

  -- (2) 남은 과거 메시지 → 읽음 여부 확인 불가로 표시
  UPDATE public.messages
     SET read_tracked = false
   WHERE read_at IS NULL;
END;
$$;

COMMENT ON COLUMN public.messages.read_tracked IS
  '읽음 추적 대상 여부 (false = 읽음 확인 기능 도입 이전 메시지 → 미열람 단정 불가)';

-- ============================================
-- STEP 3: 읽음 처리 RPC
-- ============================================
-- 쓰레드를 연 사람이 "상대방이 보낸" 미확인 메시지를 읽음 처리한다.
-- SECURITY DEFINER: 고객에게 messages UPDATE 권한을 직접 열어주지 않기 위함.
--   · 관리자(admins 테이블 등록자) → 고객 메시지를 읽음 처리
--   · 쓰레드 소유 고객            → 관리자 메시지를 읽음 처리
--   · 그 외                       → 거부

CREATE OR REPLACE FUNCTION public.mark_thread_messages_read(p_thread_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid := auth.uid();
  v_owner    uuid;
  v_is_admin boolean;
  v_count    integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT user_id INTO v_owner FROM public.threads WHERE id = p_thread_id;
  IF v_owner IS NULL THEN
    RETURN 0;  -- 존재하지 않는 쓰레드는 조용히 무시
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM public.admins a
      JOIN auth.users u ON u.email = a.email
     WHERE u.id = v_user_id
       AND a.role IN ('super_admin', 'admin', 'staff')
  ) INTO v_is_admin;

  IF NOT v_is_admin AND v_owner <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  IF v_is_admin THEN
    -- 관리자 열람 → 고객이 보낸 메시지를 확인 처리
    UPDATE public.messages
       SET read_at = now()
     WHERE thread_id = p_thread_id
       AND read_at IS NULL
       AND NOT (sender_type IN ('admin', 'staff', 'system') OR sender_id IS NULL);
  ELSE
    -- 고객 열람 → 관리자(로연)가 보낸 답글을 읽음 처리
    UPDATE public.messages
       SET read_at = now()
     WHERE thread_id = p_thread_id
       AND read_at IS NULL
       AND (sender_type IN ('admin', 'staff', 'system') OR sender_id IS NULL);
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_thread_messages_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_thread_messages_read(uuid) TO authenticated;

COMMENT ON FUNCTION public.mark_thread_messages_read(uuid) IS
  '쓰레드 열람 시 상대방이 보낸 미확인 메시지를 읽음 처리하고 처리 건수를 반환';

-- ============================================
-- STEP 4: 관리자 대시보드용 읽음 요약 RPC
-- ============================================
-- 쓰레드 목록에서 (a) 고객의 미확인 답변 여부, (b) 내 답글을 고객이 읽었는지를
-- 한 번의 호출로 가져온다. 클라이언트에서 messages 전체를 내려받던 방식의
-- 1000행 기본 제한 문제도 함께 해소한다.

DROP FUNCTION IF EXISTS public.get_thread_read_summary();

CREATE OR REPLACE FUNCTION public.get_thread_read_summary()
RETURNS TABLE (
  thread_id                uuid,
  last_message_at          timestamptz,
  last_message_from_admin  boolean,
  last_admin_message_at    timestamptz,
  last_admin_read_at       timestamptz,
  last_admin_read_tracked  boolean,
  unread_admin_count       integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.admins a
      JOIN auth.users u ON u.email = a.email
     WHERE u.id = auth.uid()
       AND a.role IN ('super_admin', 'admin', 'staff')
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH flagged AS (
      SELECT
          m.thread_id,
          m.created_at,
          m.read_at,
          m.read_tracked,
          (m.sender_type IN ('admin', 'staff', 'system') OR m.sender_id IS NULL) AS from_admin
      FROM public.messages m
      WHERE m.thread_id IS NOT NULL
  )
  SELECT
      f.thread_id,
      MAX(f.created_at)                                                       AS last_message_at,
      (array_agg(f.from_admin ORDER BY f.created_at DESC))[1]                 AS last_message_from_admin,
      MAX(f.created_at) FILTER (WHERE f.from_admin)                           AS last_admin_message_at,
      (array_agg(f.read_at ORDER BY f.created_at DESC)
         FILTER (WHERE f.from_admin))[1]                                      AS last_admin_read_at,
      (array_agg(f.read_tracked ORDER BY f.created_at DESC)
         FILTER (WHERE f.from_admin))[1]                                      AS last_admin_read_tracked,
      COUNT(*) FILTER (WHERE f.from_admin
                         AND f.read_at IS NULL
                         AND f.read_tracked)::integer                         AS unread_admin_count
  FROM flagged f
  GROUP BY f.thread_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_thread_read_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_thread_read_summary() TO authenticated;

COMMENT ON FUNCTION public.get_thread_read_summary() IS
  '관리자 전용 — 쓰레드별 최신 메시지 발신자 / 관리자 답글 읽음 여부 요약';

-- ============================================
-- STEP 5: Realtime UPDATE 이벤트 확인
-- ============================================
-- 쓰레드 화면은 read_at 변경을 Realtime UPDATE 이벤트로 즉시 반영한다.
-- messages 테이블이 이미 supabase_realtime 퍼블리케이션에 있으면(INSERT 구독이
-- 동작 중이므로 보통 등록되어 있음) 추가 작업이 필요 없다. 없을 때만 등록한다.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime'
       AND schemaname = 'public'
       AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    RAISE NOTICE 'messages 테이블을 supabase_realtime 퍼블리케이션에 추가했습니다.';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime 퍼블리케이션이 없어 건너뜁니다.';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '퍼블리케이션 변경 권한이 없어 건너뜁니다. Dashboard > Database > Replication 에서 확인하세요.';
END;
$$;

-- ============================================
-- 확인 쿼리 (선택)
-- ============================================
-- SELECT count(*) FILTER (WHERE read_at IS NOT NULL) AS 읽음,
--        count(*) FILTER (WHERE read_at IS NULL)     AS 미확인
--   FROM public.messages;
