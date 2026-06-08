-- migrations/20260608_reservations_admin_select.sql
-- 예약(reservations) 관리 권한 확장.
-- 최초 마이그레이션(20260608_create_reservations.sql)은 super_admin 만 조회/관리 가능했으나,
-- admin-dashboard 는 super_admin / admin / staff 세 역할을 관리자로 허용한다.
-- → 세 역할 모두 예약을 조회·관리(상태 변경)할 수 있도록 정책을 교체한다.

DROP POLICY IF EXISTS reservations_super_admin_all ON public.reservations;
DROP POLICY IF EXISTS reservations_admin_all ON public.reservations;

CREATE POLICY reservations_admin_all
  ON public.reservations
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
