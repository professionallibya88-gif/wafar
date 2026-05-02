const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.vue')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/views');
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(/<select([^>]*?)class=["']([^"']*)["']/g, (match, p1, p2) => {
    const classes = p2.split(/[ \n\t]+/);
    const keepClasses = classes.filter(c =>
      c === 'form-select' ||
      (c.startsWith('w-') && c !== 'w-full') ||
      c.startsWith('mb-') ||
      c.startsWith('mt-') ||
      c.startsWith('ml-') ||
      c.startsWith('mr-') ||
      c.startsWith('h-')
    );

    if (!keepClasses.includes('form-select')) {
      keepClasses.unshift('form-select');
    }

    const newClass = keepClasses.join(' ');
    if (newClass !== p2) {
      changed = true;
      return `<select${p1}class="${newClass}"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
    count++;
  }
}
console.log('Total files updated:', count);
