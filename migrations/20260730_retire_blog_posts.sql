-- migrations/20260730_retire_blog_posts.sql
-- 구 블로그 발행 체계 종료에 따른 blog_posts 데이터 정리.
--
-- 배경: 인사이트는 git 의 content/<slug>.<lang>.html 에서 build-site.js 로 생성된다.
-- blog_posts 는 별도 체계(build-blog.js → blog/*.html)의 원본이었고, 산출물 25개는
-- 전부 noindex + canonical 이 인사이트 기사를 가리키고 있었다. 2026-07-30 자로
-- blog/ 산출물과 빌더·워크플로를 모두 삭제했으므로 이 테이블을 읽는 코드는 없다.
--
-- 2026-07-30 확인 결과: 프로덕션(gqistzsergddnpcvuzba)에는 public.blog_posts 가
-- 존재하지 않는다("relation does not exist"). 이미 정리된 것으로 보이며 실행할
-- 것이 없다. 이 파일은 기록용으로 남긴다. 혹시 다른 환경에서 테이블이 남아 있다면
-- 아래 절차를 그대로 쓰면 된다.
--
-- 한 번에 실행하지 말고 1 → 2 → 3 순서로 확인하며 진행할 것.
-- SQL Editor: https://supabase.com/dashboard/project/gqistzsergddnpcvuzba/sql/new


-- ============================================================
-- 1단계. 무엇이 있는지 먼저 본다 (삭제 없음)
-- ============================================================
SELECT count(*) AS 전체건수 FROM public.blog_posts;

SELECT language, count(*) AS 건수
FROM public.blog_posts
GROUP BY language
ORDER BY 건수 DESC;

SELECT id, language, slug, title, is_published, created_at
FROM public.blog_posts
ORDER BY created_at DESC;

-- 다른 테이블이 blog_posts 를 참조하고 있는지 확인.
-- 결과가 0행이면 매달린 데이터가 없다는 뜻이다.
SELECT tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'blog_posts';


-- ============================================================
-- 2단계. 백업 후 삭제
-- ============================================================
-- 원문을 통째로 복사해 두고 지운다. 되돌리려면 3단계-B 를 쓰면 된다.
-- 백업 테이블은 RLS 를 켜고 정책을 주지 않아, service role 외에는 접근할 수 없다.

CREATE TABLE IF NOT EXISTS public.blog_posts_backup_20260730
  AS TABLE public.blog_posts;

ALTER TABLE public.blog_posts_backup_20260730 ENABLE ROW LEVEL SECURITY;

-- 백업이 원본과 같은 건수인지 반드시 확인하고 다음 줄로 넘어갈 것.
SELECT
  (SELECT count(*) FROM public.blog_posts)                     AS 원본,
  (SELECT count(*) FROM public.blog_posts_backup_20260730)      AS 백업;

-- 위 두 숫자가 같을 때만 실행한다.
DELETE FROM public.blog_posts;

SELECT count(*) AS 삭제후_남은건수 FROM public.blog_posts;   -- 0 이어야 한다


-- ============================================================
-- 3단계. 이후 (둘 중 하나만)
-- ============================================================

-- A) 테이블까지 없앤다 — 블로그를 다시 할 계획이 없을 때.
--    백업 테이블은 남으므로 원문은 보존된다.
--
-- DROP TABLE public.blog_posts;

-- B) 되돌린다 — 삭제가 잘못됐을 때.
--
-- INSERT INTO public.blog_posts SELECT * FROM public.blog_posts_backup_20260730;

-- C) 백업까지 정리한다 — 충분히 시간이 지나 원문이 필요 없어졌을 때.
--    이 시점 이후로는 복구할 수 없다.
--
-- DROP TABLE public.blog_posts_backup_20260730;
