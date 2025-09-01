// replace_moment_decls.js
// Reemplaza imports y alias viejos de moment por `import moment from 'moment';`

const fs = require('fs');
const path = require('path');

const roots = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
const defaultRoots = ['src', 'projects'];
const visitRoots = roots.length ? roots : defaultRoots;

const rxImportNS = /^\s*import\s+\*\s+as\s+\w+\s+from\s+['"]moment['"];\s*$/m;
const rxConstAlias = /^\s*const\s+moment\s*=\s*.*(?:_moment|moment_|momentNS).*;\s*$/m;
const rxTypeAlias = /^\s*(?:export\s+)?type\s+Moment\s*=\s*(?:_moment|moment_|momentNS)\.Moment;\s*$/m;

let changed = 0;
let scanned = 0;
const touched = [];

function shouldSkip(p) {
  return p.includes(`${path.sep}node_modules${path.sep}`) ||
    p.includes(`${path.sep}dist${path.sep}`) ||
    p.endsWith('.d.ts');
}

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (shouldSkip(p)) continue;
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.ts')) processFile(p);
  }
}

function processFile(file) {
  scanned++;
  const src = fs.readFileSync(file, 'utf8');
  let lines = src.split(/\r?\n/);
  let modified = false;

  lines = lines.filter(line => {
    if (rxImportNS.test(line) || rxConstAlias.test(line) || rxTypeAlias.test(line)) {
      modified = true;
      return false; // eliminar la línea
    }
    return true;
  });

  // Si borramos algo y no hay ya import moment, lo agregamos al principio
  if (modified && !/import\s+moment\s+from\s+['"]moment['"]/.test(lines.join('\n'))) {
    lines.unshift(`import moment from 'moment';`);
  }

  const out = lines.join('\n');
  if (out !== src) {
    touched.push(file);
    changed++;
    if (!dryRun) fs.writeFileSync(file, out, 'utf8');
  }
}

for (const r of visitRoots) walk(path.resolve(r));

console.log(`📂 Escaneados: ${scanned} archivos .ts`);
console.log(`🔄 ${dryRun ? 'Archivos que se modificarían' : 'Archivos modificados'}: ${changed}`);
if (touched.length) {
  for (const f of touched) console.log('  •', f);
}
if (dryRun) {
  console.log('\nEjecutá SIN "--dry-run" para aplicar los cambios.');
}
