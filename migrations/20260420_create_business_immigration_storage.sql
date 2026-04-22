-- migrations/20260420_create_business_immigration_storage.sql
-- 사업이민 전용 Storage 버킷 + RLS 정책 (5개)
-- 경로 컨벤션: {user_id}/{document_type}/{timestamp}_{sanitizedFileName}
-- document_type: passport | criminal_record | education | family | funding | contracts
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-3

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


-- 2) RLS 정책 — 고객: 자기 파일만 전체 작업 (SELECT/INSERT/UPDATE/DELETE)
--    경로 첫 세그먼트(storage.foldername(name)[1])가 auth.uid()와 일치해야 허용
--    INSERT는 추가로 두 번째 세그먼트(document_type)를 허용 목록으로 제한

DROP POLICY IF EXISTS biz_docs_owner_select ON storage.objects;
CREATE POLICY biz_docs_owner_select
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS biz_docs_owner_insert ON storage.objects;
CREATE POLICY biz_docs_owner_insert
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] IN
        ('passport','criminal_record','education','family','funding','contracts')
  );

DROP POLICY IF EXISTS biz_docs_owner_update ON storage.objects;
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

DROP POLICY IF EXISTS biz_docs_owner_delete ON storage.objects;
CREATE POLICY biz_docs_owner_delete
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );


-- 3) RLS 정책 — super_admin: 전체 작업 허용
DROP POLICY IF EXISTS biz_docs_super_admin_all ON storage.objects;
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
