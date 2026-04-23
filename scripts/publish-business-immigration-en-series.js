/**
 * Publish EP01~EP04 English business-immigration blog posts to Supabase.
 *
 * Inserts/updates four rows in blog_posts with:
 *   template = 'navy_v4'
 *   is_published = true (publishes to /blog.html listing)
 *   content = full content_ep*_en.js POST object (JSON)
 *
 * Prerequisite: migrations/add_blog_template_column.sql must have been
 * applied to Supabase once (adds the 'template' column).
 *
 * Run: node scripts/publish-business-immigration-en-series.js
 * Dry run (no writes): node scripts/publish-business-immigration-en-series.js --dry
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const POSTS = [
  { file: 'blog/content_ep1_en.js', slug: 'start-a-business-in-korea-as-a-foreigner-2026' },
  { file: 'blog/content_ep2_en.js', slug: 'korea-business-visa-investment-and-family-guide-2026' },
  { file: 'blog/content_ep3_en.js', slug: 'how-to-open-a-store-in-korea-as-a-foreigner-2026' },
  { file: 'blog/content_ep4_en.js', slug: 'how-to-stay-in-korea-long-term-as-a-business-owner-2026' },
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
    meta_description: post.disclaimer,
    thumbnail_url: null,
    is_published: IS_PUBLISHED,
    template: 'navy_v4',
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
  console.log(`${DRY ? '[DRY RUN] ' : ''}Publishing ${POSTS.length} EN posts (is_published=${IS_PUBLISHED}, template=navy_v4)\n`);
  for (const p of POSTS) await upsertOne(p);
  console.log(`\n✓ Done. Verify at https://www.lawyeonvisa.app/blog.html`);
}

run().catch(err => { console.error(err); process.exit(1); });
