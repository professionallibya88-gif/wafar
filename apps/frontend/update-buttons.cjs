const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('apps/frontend/src/**/*.vue', { cwd: 'c:/wafar-project' });
let count = 0;

files.forEach(file => {
  const fullPath = path.join('c:/wafar-project', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  // Replace button classes:
  // We want to find <button ... class="..."> and replace px-3 py-1.5 with px-3 py-2.5 min-h-[44px]
  // Or simply replace "px-3 py-1.5" with "px-3 py-2.5 min-h-[44px]" inside button tags.
  // Since regex on HTML is tricky, let's just do a string replacement for the specific classes used in buttons.

  // Let's replace 'px-3 py-1.5' with 'px-4 py-2 md:px-3 md:py-1.5' but that doesn't fix touch height.
  // How about 'px-3 py-2 min-h-[44px]' ?
  // Actually, I can just use regex to match <button ...>...</button> blocks and replace inside them.

  let newContent = content.replace(/<button[^>]*>[\s\S]*?<\/button>/g, (match) => {
    let replaced = match.replace(/px-3 py-1\.5/g, 'px-4 py-2 min-h-[44px]');
    replaced = replaced.replace(/px-2 py-1/g, 'px-3 py-2 min-h-[44px]');
    return replaced;
  });

  if (original !== newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log('Updated buttons in ' + fullPath);
    count++;
  }
});

console.log('Total files with button updates: ' + count);
