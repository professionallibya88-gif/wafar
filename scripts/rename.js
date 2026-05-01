const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', '.nx', 'coverage', 'uploads', '.trae', '.windsurf', '__pycache__'];
const EXTENSIONS = ['.js', '.ts', '.vue', '.json', '.md', '.html', '.txt', '.cjs', '.py', '.css'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      const dirname = path.basename(file);
      if (!IGNORE_DIRS.includes(dirname)) {
        results = results.concat(walk(file));
      }
    } else {
      const ext = path.extname(file);
      const basename = path.basename(file);
      if (EXTENSIONS.includes(ext) || basename === '.env' || basename === '.env.example' || basename === 'Dockerfile') {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(process.cwd());
let changedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
      .replace(/وفر/g, 'وفر')
      .replace(/waffer/g, 'waffer')
      .replace(/Waffer/g, 'Waffer')
      .replace(/WAFFER/g, 'WAFFER');
      
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedCount++;
      console.log('Changed:', file);
    }
  } catch (err) {
    console.error('Error reading/writing file:', file, err.message);
  }
});

console.log('Total files changed:', changedCount);
