/**
 * EP01 English — Insert / Update blog_posts row (Navy v4 template).
 *
 * This script does NOT auto-run. Execute it manually when ready to publish:
 *   node scripts/insert-ep01-en-blog-post.js
 *
 * Default: is_published = false so the post is visible only via direct URL
 *   (/blog/start-a-business-in-korea-as-a-foreigner-2026.html)
 *   for verification. Flip to true when ready to list on blog.html
 *   (news & insight).
 *
 * Requires: migrations/add_blog_template_column.sql applied to Supabase.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SLUG = 'start-a-business-in-korea-as-a-foreigner-2026';
const CONTENT_FILE = path.resolve(__dirname, '..', 'blog', 'content_ep1_en.js');
const IS_PUBLISHED = false; // ← Flip to true to make it appear in news & insight

function loadPost(file) {
  const src = fs.readFileSync(file, 'utf-8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.POST;
}

async function run() {
  const post = loadPost(CONTENT_FILE);

  const row = {
    title: post.title,
    slug: SLUG,
    category: post.category, // 'business'
    excerpt: post.disclaimer,
    meta_description: post.disclaimer,
    thumbnail_url: null,
    is_published: IS_PUBLISHED,
    template: 'navy_v4',
    related_services: JSON.stringify([]),
    content: JSON.stringify(post), // Navy v4 stores the whole POST object
    updated_at: new Date().toISOString(),
  };

  // Upsert by slug so re-runs update in place
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', SLUG)
    .maybeSingle();

  let result;
  if (existing) {
    console.log(`Updating existing row id=${existing.id}`);
    result = await supabase.from('blog_posts').update(row).eq('id', existing.id).select();
  } else {
    console.log('Inserting new row');
    row.created_at = new Date().toISOString();
    result = await supabase.from('blog_posts').insert(row).select();
  }

  if (result.error) {
    console.error('✗ Failed:', result.error);
    process.exit(1);
  }
  console.log(`✓ OK — is_published=${IS_PUBLISHED}, template=navy_v4`);
  console.log(`  Direct URL: https://www.lawyeonvisa.app/blog/${SLUG}.html`);
  if (!IS_PUBLISHED) {
    console.log('  To publish: set IS_PUBLISHED=true at top of this file and re-run.');
  }
}

run().catch(err => { console.error(err); process.exit(1); });
