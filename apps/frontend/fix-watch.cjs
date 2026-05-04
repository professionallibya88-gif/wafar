const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (filePath.endsWith('.vue')) results.push(filePath);
    }
  });
  return results;
}

const files = walkDir('c:/wafar-project/apps/frontend/src/views');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('watch(') && !content.match(/import\s+{[^}]*watch[^}]*}\s+from\s+['"]vue['"]/)) {
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]vue['"]/, (match, p1) => {
      return `import { ${p1}, watch } from "vue"`;
    });
    fs.writeFileSync(f, content);
    console.log('Added watch to', f);
  }
});
