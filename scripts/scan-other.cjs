const fs = require('fs');
const path = require('path');

const files = [];
function scan(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      scan(p, prefix + e.name + '/');
    } else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.vue'))) {
      const content = fs.readFileSync(p, 'utf8');
      const count = (content.match(/[\u001e\u001a&`!▲→]/g) || []).length;
      if (count > 0) {
        files.push({ path: prefix + e.name, count });
      }
    }
  }
}

scan(path.join(__dirname, 'src'), '');
files.sort((a, b) => a.count - b.count);
for (const f of files) {
  console.log(f.count.toString().padStart(5) + ' | ' + f.path);
}
console.log('Total files: ' + files.length);
