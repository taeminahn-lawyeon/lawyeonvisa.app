/**
 * Publish EP01~EP04 Chinese (zh) business-immigration blog posts to Supabase.
 *
 * Inserts/updates four rows in blog_posts with:
 *   template = 'navy_v4'
 *   is_published = true
 *   language = 'zh'
 *   translation_group = 'biz-immigration-epN'
 *   content = full content_ep*_zh.js POST object (JSON)
 *
 * Run: node scripts/publish-business-immigration-zh-series.js
 * Dry: node scripts/publish-business-immigration-zh-series.js --dry
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const POSTS = [
  { file: 'blog/content_ep1_zh.js', slug: '外国人在韩国创业-D-9-4-D-9-5签证完全指南-2026', translation_group: 'biz-immigration-ep1' },
  { file: 'blog/content_ep2_zh.js', slug: '外国人在韩国开加盟店-行业品牌指南-2026', translation_group: 'biz-immigration-ep2' },
  { file: 'blog/content_ep3_zh.js', slug: '外国人在韩国开店流程-五阶段完整指南-2026', translation_group: 'biz-immigration-ep3' },
  { file: 'blog/content_ep4_zh.js', slug: '外国企业主韩国永久居留-F-2-99到F-5指南-2026', translation_group: 'biz-immigration-ep4' },
];

const DRY = process.argv.includes('--dry');
const IS_PUBLISHED = true;

function loadPost(file) {
  const src = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf-8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.POST;
}

async function upsertOne(entry) {
  const post = loadPost(entry.file);
  const row = {
    title: post.title,
    slug: entry.slug,
    category: post.category,
    excerpt: post.disclaimer,
    meta_description: post.metaDescription || post.disclaimer,
    thumbnail_url: null,
    is_published: IS_PUBLISHED,
    template: 'navy_v4',
    language: post.lang || 'zh',
    translation_group: entry.translation_group,
    related_services: JSON.stringify([]),
    content: JSON.stringify(post),
    updated_at: new Date().toISOString(),
  };

  if (DRY) {
    console.log(`[DRY] ${entry.slug} — title: ${post.title.slice(0, 60)}...`);
    return;
  }

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', entry.slug)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase.from('blog_posts').update(row).eq('id', existing.id).select();
    console.log(`✓ Updated   EP${post.episodeNo}  id=${existing.id}  ${entry.slug}`);
  } else {
    row.created_at = new Date().toISOString();
    result = await supabase.from('blog_posts').insert(row).select();
    const newId = result.data?.[0]?.id;
    console.log(`✓ Inserted  EP${post.episodeNo}  id=${newId}  ${entry.slug}`);
  }
  if (result.error) {
    console.error(`✗ Failed EP${post.episodeNo}:`, result.error);
    throw result.error;
  }
}

async function run() {
  console.log(`${DRY ? '[DRY RUN] ' : ''}Publishing ${POSTS.length} ZH posts (is_published=${IS_PUBLISHED}, template=navy_v4, language=zh)\n`);
  for (const p of POSTS) await upsertOne(p);
  console.log(`\n✓ Done. Verify at https://www.lawyeonvisa.app/blog.html (switch UI to Chinese)`);
}

run().catch(err => { console.error(err); process.exit(1); });
