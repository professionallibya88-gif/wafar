const fs = require('fs');
const path = require('path');

const map = {};
function scan(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      scan(p, prefix + e.name + '/');
    } else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.vue'))) {
      const content = fs.readFileSync(p, 'utf8');
      const matches = content.match(/[\u0600-\u06FF][&`!\u001e\u001a]{1,3}[\u0600-\u06FF]/g);
      if (matches) {
        matches.forEach(x => {
          map[x] = (map[x] || 0) + 1;
        });
      }
    }
  }
}

scan(path.join(__dirname, 'src'), '');
const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
arr.slice(0, 60).forEach(([k, v]) => console.log(v.toString().padStart(4) + ' | ' + k));
console.log('Total unique patterns: ' + arr.length);
