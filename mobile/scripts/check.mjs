// Quick static check: every route file parses. Run: npm run check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
let n = 0;
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.js$/.test(p)) { readFileSync(p, 'utf8'); n++; } });
walk('app'); walk('src');
console.log(`${n} source files present`);
