const fs = require('fs');
const path = require('path');

const replacements = [
  ['&', 'م'],
  ['هshow', '!show'],
  ['هis', '!is'],
  ['هauth', '!auth'],
  ['هdeleted', '!deleted'],
  ['هn.', '!n.'],
  ['<ه--', '<!--'],
  ['▲', ''],
  ['→', ''],
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const before = (content.match(/[▲&`!\u001e\u001a→]/g) || []).length;
  if (before === 0) return 0;

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  const after = (content.match(/[▲&`!\u001e\u001a→]/g) || []).length;
  return before - after;
}

function scanAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      totalFixed += scanAndFix(p);
    } else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.vue'))) {
      const fixed = fixFile(p);
      if (fixed > 0) {
        console.log('Fixed ' + fixed + ' in ' + p.replace(dir, ''));
        totalFixed += fixed;
      }
    }
  }
  return totalFixed;
}

const total = scanAndFix(path.join(__dirname, 'src'));
console.log('Total replacements: ' + total);
