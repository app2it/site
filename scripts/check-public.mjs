// Stops private details reaching this public repo.
//
// Every run uses generic patterns. With FORBIDDEN_LIST set to a file, or the
// default ../internal/forbidden-strings.txt present, it also checks that private
// list, which stays outside this repo. Matches are reported by file and line,
// and the matching text is never printed. REQUIRE_LIST=1 fails if the list is missing.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const textTypes = new Set(['.astro', '.css', '.html', '.js', '.json', '.md', '.mdx', '.mjs', '.svg', '.ts', '.txt', '.xml', '.yml', '.yaml', '']);
const generic = [
  ['an AWS account ID', /(?<![\d.-])\d{12}(?![\d.-])/],
  ['an AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['an AWS ARN with an account', /arn:aws[a-z-]*:[a-z0-9-]*:[a-z0-9-]*:\d{12}:/],
  ['a Route 53 zone ID', /\bZ0[0-9A-Z]{18,}\b/],
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
const files = [...new Set([...tracked, ...(existsSync('dist') ? walk('dist') : [])])]
  .filter((file) => existsSync(file) && textTypes.has(extname(file)) && !/(^|\/)(package-lock\.json|LICENSE)$/.test(file));

const listPath = process.env.FORBIDDEN_LIST ?? '../internal/forbidden-strings.txt';
const hasList = existsSync(listPath);
if (!hasList && process.env.REQUIRE_LIST === '1') {
  console.error(`The private list is missing: ${listPath}`);
  process.exit(1);
}
const forbidden = hasList
  ? readFileSync(listPath, 'utf8').split('\n').map((line) => line.trim().toLowerCase()).filter((line) => line && !line.startsWith('#'))
  : [];

const problems = [];
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    const where = `${file}:${index + 1}`;
    for (const [name, pattern] of generic) {
      if (pattern.test(line)) problems.push(`${where}: looks like ${name}`);
    }
    const lower = line.toLowerCase();
    if (forbidden.some((text) => lower.includes(text))) problems.push(`${where}: matches the private list`);
  });
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Public check: ${files.length} files are clean (private list: ${hasList ? `${forbidden.length} strings` : 'not available here'}).`);
