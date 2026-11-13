// Keep GitHub Pages' existing main/root publishing setup and custom domain.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'frontend/dist');
const manifestPath = join(root, 'published-files.json');
const allowed = path => ['index.html', 'favicon.svg', '.nojekyll', 'CNAME', 'robots.txt', 'sitemap.xml', 'og-image.png'].includes(path)
  || /^(assets|openmail)\/[A-Za-z0-9_./ -]+$/.test(path) && !path.split('/').includes('..');
function files(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix + entry.name;
    return entry.isDirectory() ? files(join(dir, entry.name), relative + '/') : [relative];
  });
}
if (!existsSync(join(dist, 'index.html'))) throw new Error('Build frontend before preparing Pages.');
const current = files(dist).sort();
if (!current.every(allowed)) throw new Error('Unexpected file in the public build.');
if (readFileSync(join(dist, 'CNAME'), 'utf8').trim() !== 'piyushchavan.com') throw new Error('Custom domain must be preserved.');
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];
for (const relative of previous) {
  if (!allowed(relative)) throw new Error('Unsafe generated-file manifest.');
  if (!current.includes(relative)) rmSync(join(root, relative), { force: true });
}
for (const relative of current) {
  mkdirSync(dirname(join(root, relative)), { recursive: true });
  cpSync(join(dist, relative), join(root, relative));
}
writeFileSync(manifestPath, JSON.stringify(current, null, 2) + '\n');
console.log(`Prepared ${current.length} public files for GitHub Pages; CNAME preserved.`);
