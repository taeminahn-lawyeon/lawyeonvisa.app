-- 2026.05 SEO rework — EP2 / EP4 slug update + translation_group + language backfill
-- This SQL was run on 2026-05-06 against the production blog_posts table to align
-- DB rows with the new slugs introduced in this branch (claude/blog-en-seo-rework-PR-B).
--
-- Migration is idempotent and safe to re-run. After running, the
-- publish-business-immigration-en-series.js script can be executed to update the
-- content (sections, title, etc.) for each row matched by the new slugs.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS translation_group TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_lang_group
  ON public.blog_posts (translation_group, language);
CREATE INDEX IF NOT EXISTS idx_blog_posts_language
  ON public.blog_posts (language);

-- EP1 — slug unchanged
UPDATE public.blog_posts
SET translation_group = 'biz-immigration-ep1',
    language = 'en'
WHERE slug = 'start-a-business-in-korea-as-a-foreigner-2026';

-- EP2 — slug changed: korea-business-visa-investment-and-family-guide-2026
--   → korea-franchise-business-foreign-entrepreneur-2026
UPDATE public.blog_posts
SET slug = 'korea-franchise-business-foreign-entrepreneur-2026',
    translation_group = 'biz-immigration-ep2',
    language = 'en'
WHERE slug IN (
        'korea-business-visa-investment-and-family-guide-2026',
        'korea-franchise-business-foreign-entrepreneur-2026'
      )
   OR translation_group = 'biz-immigration-ep2';

-- EP3 — slug unchanged
UPDATE public.blog_posts
SET translation_group = 'biz-immigration-ep3',
    language = 'en'
WHERE slug = 'how-to-open-a-store-in-korea-as-a-foreigner-2026';

-- EP4 — slug changed: how-to-stay-in-korea-long-term-as-a-business-owner-2026
--   → permanent-residency-korea-foreign-business-owner-2026
UPDATE public.blog_posts
SET slug = 'permanent-residency-korea-foreign-business-owner-2026',
    translation_group = 'biz-immigration-ep4',
    language = 'en'
WHERE slug IN (
        'how-to-stay-in-korea-long-term-as-a-business-owner-2026',
        'permanent-residency-korea-foreign-business-owner-2026'
      )
   OR translation_group = 'biz-immigration-ep4';

-- D-10 — slug unchanged
UPDATE public.blog_posts
SET translation_group = 'd10-job-seeker-2026',
    language = 'en'
WHERE slug = 'd10-visa-korea-new-graduate-points-exemption-guide-2026';

-- Sanity check
SELECT slug, translation_group, language, is_published, updated_at
FROM public.blog_posts
ORDER BY translation_group;
