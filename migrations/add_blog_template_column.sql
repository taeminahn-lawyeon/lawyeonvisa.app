-- 블로그 템플릿 선택 컬럼 추가
-- 'toss' (기본, 기존 디자인) 또는 'navy_v4' (Design C · 검정 감소 · 네이비)
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'toss';

-- 기존 글은 모두 'toss'로 유지됨 (DEFAULT 적용)
-- 신규 Navy v4 글은 INSERT 시 template='navy_v4' 명시
