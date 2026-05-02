const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/views/**/*.vue');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Many views have:
  // <div class="flex gap-3">
  //   <BaseSelect ...
  //   <div class="relative"> ... <input ...
  
  // We want to replace <div class="flex gap-3"> with <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
  // ONLY if it contains BaseSelect or input immediately inside
  content = content.replace(/<div\s+class=["']flex(?:\s+items-center)?\s+gap-[34]["']>\s*(?:<BaseSelect|<div\s+class=["']relative["']>\s*<input|<select)/g, (match) => {
    changed = true;
    return match.replace(/class=["']flex(?:\s+items-center)?\s+gap-([34])["']/, 'class="flex flex-col sm:flex-row sm:items-center gap-$1 w-full sm:w-auto"');
  });

  // also fix input width to w-full sm:w-64 instead of just w-64 or w-48
  content = content.replace(/class=["']([^"']*\bw-(?:64|48)\b[^"']*)["']/g, (match, classes) => {
    if (classes.includes('sm:w-')) return match; // already responsive
    const newClasses = classes.replace(/\bw-(64|48)\b/, 'w-full sm:w-$1');
    if (newClasses !== classes) {
      changed = true;
      return `class="${newClasses}"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed layout in', file);
  }
});
