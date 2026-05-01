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
    } else if (file.endsWith('.js') || file.endsWith('.vue') || file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const r = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]/gu;
        if (r.test(line)) {
          results.push({ file, line: index + 1, text: line.trim() });
        }
      });
    }
  });
  return results;
}

const frontendMatches = walk('apps/frontend/src');
const backendMatches = walk('apps/backend/src');

console.log(JSON.stringify([...frontendMatches, ...backendMatches], null, 2));