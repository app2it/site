// Checks that every internal link and #fragment in dist/ points at something real.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = 'dist';

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function pagePath(pathname) {
  const clean = decodeURIComponent(pathname);
  for (const candidate of [join(root, clean), join(root, clean, 'index.html')]) {
    if (existsSync(candidate) && candidate.includes('.') && !candidate.endsWith('/')) {
      if (candidate.endsWith('.html') || !readdirSafe(candidate)) return candidate;
    }
  }
  return null;
}

function readdirSafe(path) {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}

const idsIn = (html) => new Set([...html.matchAll(/\sid=["']?([^"'\s>]+)/g)].map((m) => m[1]));
const problems = [];
let checked = 0;

for (const file of htmlFiles(root)) {
  const html = readFileSync(file, 'utf8');
  const self = '/' + relative(root, file).replace(/index\.html$/, '');
  for (const [, href] of html.matchAll(/<a\s[^>]*href=["']([^"']+)["']/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    checked += 1;
    const url = new URL(href, `https://site.test${self}`);
    const target = pagePath(url.pathname);
    if (!target) {
      problems.push(`${file}: ${href} has no page`);
      continue;
    }
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (fragment && target.endsWith('.html') && !idsIn(readFileSync(target, 'utf8')).has(fragment)) {
      problems.push(`${file}: ${href} has no matching id`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Links: ${checked} internal links are fine.`);
