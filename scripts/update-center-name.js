// One-time, content-only brand migration. The normal site build commits its results.
const fs = require('fs');
const path = require('path');

module.exports = function updateCenterName() {
  const root = path.resolve(__dirname, '..');
  const skip = new Set(['.git', 'node_modules', 'migrations', 'sql', 'supabase']);
  const types = new Set(['.html', '.js', '.json', '.md', '.txt', '.xml', '.svg']);
  let changed = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || skip.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!entry.isFile() || file === __filename || !types.has(path.extname(file))) continue;
      const original = fs.readFileSync(file, 'utf8');
      let updated = original
        .replace(/출입국[ \t·ㆍ]*이민[ \t]*지원[ \t]*센터/g, '출입국이민법센터')
        .replace(/\bVisa\s*(?:&amp;|&|and)\s*Immigration\s+Cent(?:er|re)\b/gi, 'Immigration Law Center')
        .replace(/\bLawyeon Immigration Center\b/gi, 'Lawyeon Immigration Law Center')
        .replace(/>Immigration Center</g, '>Immigration Law Center<')
        .replace(/brandSub: 'Immigration Center'/g, "brandSub: 'Immigration Law Center'");
      if (file === path.join(root, 'js/translations.js')) {
        updated = updated
          .replace(/'site.visa': 'Visa'/g, "'site.visa': 'Immigration'")
          .replace(/'site.immigration': '& Immigration Center'/g, "'site.immigration': 'Law Center'")
          .replace('/ Immigration Center Registration:', '/ Immigration Law Center Registration:');
      }
      if (file === path.join(root, 'thread-general-v2.html')) {
        updated = updated.replace('>&amp; Immigration Center</div>', '>Immigration Law Center</div>');
      }
      if (path.extname(file) === '.html') {
        updated = updated.replace(/(src="(?:\.\.\/)?js\/translations\.js)(?:\?[^"\s]*)?(\")/g, '$1?v=20260918-law-center$2');
      }
      if (updated !== original) { fs.writeFileSync(file, updated, 'utf8'); changed++; }
    }
  }
  walk(root);
  console.log(`Updated center name in ${changed} files.`);
};
