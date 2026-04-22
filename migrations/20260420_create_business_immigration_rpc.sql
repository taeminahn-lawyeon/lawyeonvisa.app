-- migrations/20260420_create_business_immigration_rpc.sql
-- 사업이민 상담 신청 원자성 보장 RPC 함수
-- consultation_requests + threads 이원 INSERT를 단일 트랜잭션으로 수행
-- 실패 시 전체 롤백으로 중복·반쪽 성공 방지
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-8-4

-- 사전 조건:
--   * 20260420_create_consultation_requests.sql
--   * 20260420_alter_threads_add_business_immigration.sql
-- 위 두 마이그레이션이 먼저 적용되어 있어야 함

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
SECURITY INVOKER  -- 호출자 권한으로 실행 → 각 INSERT는 RLS 적용
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

-- 실행 권한: authenticated 역할만 허용 (anon 차단)
REVOKE ALL ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) TO authenticated;
