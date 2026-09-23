import { readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = dirname(fileURLToPath(new URL('.', import.meta.url)));
const TARGETS = ['assets/themes', 'assets/tables', 'assets/videos', 'assets/brand/artstyle'];
const MEDIA_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov']);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_raw' || entry.name === '__pycache__') continue;
      walk(full, acc);
      continue;
    }
    if (MEDIA_EXT.has(extname(entry.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

const rows = [];
for (const target of TARGETS) {
  try {
    walk(join(APP, target), rows);
  } catch {
    // Missing folder is not a failure.
  }
}

const report = rows
  .map((file) => ({
    file: relative(APP, file).replaceAll('\\', '/'),
    bytes: statSync(file).size,
  }))
  .sort((left, right) => right.bytes - left.bytes);

const oversized = report.filter((row) => row.bytes > 900_000);
console.log(`audited ${report.length} runtime media files`);
console.log('largest 12:');
for (const row of report.slice(0, 12)) {
  console.log(`  ${(row.bytes / 1024).toFixed(0).padStart(6)} KB  ${row.file}`);
}
if (oversized.length) {
  console.log(
    `note: ${oversized.length} files over 900KB — do not auto-reencode without a phone visual check`
  );
}
