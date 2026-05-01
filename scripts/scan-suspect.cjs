const fs = require('fs');
const path = require('path');

const suspectChars = /[&`\u001e\u001f]/;
const arabicRange = /[\u0600-\u06FF]/;

let files = [];
function scan(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      scan(p, prefix + e.name + '/');
    } else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.vue'))) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const hasSuspect = suspectChars.test(line);
        const hasArabic = arabicRange.test(line);
        if (hasSuspect && hasArabic) {
          files.push({ path: prefix + e.name, line: idx + 1, text: line.trim().slice(0, 80) });
        }
      });
    }
  }
}

scan(path.join(__dirname, 'src'), '');
console.log('Found ' + files.length + ' suspect lines');
files.slice(0, 40).forEach(f => console.log(f.path + ':' + f.line + ' | ' + f.text));
