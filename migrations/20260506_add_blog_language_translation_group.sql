-- Add multilingual support to blog_posts
-- 1) language column: 'en' / 'ko' / 'vi' / 'th' / 'zh' / 'ja' / 'mn'
-- 2) translation_group column: shared identifier across language versions
--    of the same article (typically the canonical English slug)
--
-- After running this migration, the next publish-script run will populate
-- the language + translation_group fields. This SQL also backfills existing
-- rows so the live site keeps working immediately.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS translation_group TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_lang_group
  ON public.blog_posts (translation_group, language);

CREATE INDEX IF NOT EXISTS idx_blog_posts_language
  ON public.blog_posts (language);

-- Backfill: existing 5 EN posts each become their own translation_group
-- (using the canonical EN slug as the group id). When other-language
-- versions are added later, they'll set translation_group to the same
-- value so the language switcher and blog-list fallback work.
UPDATE public.blog_posts SET language = 'en', translation_group = 'biz-immigration-ep1'
  WHERE slug = 'start-a-business-in-korea-as-a-foreigner-2026';
UPDATE public.blog_posts SET language = 'en', translation_group = 'biz-immigration-ep2'
  WHERE slug = 'korea-business-visa-investment-and-family-guide-2026';
UPDATE public.blog_posts SET language = 'en', translation_group = 'biz-immigration-ep3'
  WHERE slug = 'how-to-open-a-store-in-korea-as-a-foreigner-2026';
UPDATE public.blog_posts SET language = 'en', translation_group = 'biz-immigration-ep4'
  WHERE slug = 'how-to-stay-in-korea-long-term-as-a-business-owner-2026';
UPDATE public.blog_posts SET language = 'en', translation_group = 'd10-job-seeker-2026'
  WHERE slug = 'd10-visa-korea-new-graduate-points-exemption-guide-2026';

-- Sanity check (run separately, not part of migration):
--   SELECT translation_group, language, slug, is_published FROM blog_posts ORDER BY translation_group, language;
