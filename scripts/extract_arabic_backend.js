const fs = require('fs');
const path = require('path');

const arabicRegex = /[\u0600-\u06FF]+/;
const linesWithArabic = new Set();

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (arabicRegex.test(lines[i])) {
          linesWithArabic.add(lines[i].trim());
        }
      }
    }
  }
}

walkSync(path.join(__dirname, 'apps', 'backend', 'src'));

fs.writeFileSync('arabic_lines_backend.txt', Array.from(linesWithArabic).sort().join('\n'), 'utf8');
console.log('Done!');
