const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/views/**/*.vue');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // replace <div class="flex gap-3"> with <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
  const newContent = content
    .replace(/<div\s+class=["']flex\s+gap-3["']>/g, '<div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">')
    .replace(/<div\s+class=["']flex\s+gap-4["']>/g, '<div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">')
    .replace(/<div\s+class=["']flex\s+items-center\s+gap-3["']>/g, '<div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">')
    .replace(/<div\s+class=["']flex\s+items-center\s+gap-4["']>/g, '<div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">');
  
  // also fix input classes to be full width on mobile
  const finalContent = newContent.replace(/class=["']([^"']*\bw-(?:64|48)\b[^"']*)["']/g, (match, classes) => {
    if (classes.includes('sm:w-')) return match; // already responsive
    const newClasses = classes.replace(/\bw-(64|48)\b/, 'w-full sm:w-$1');
    return `class="${newClasses}"`;
  });

  if (finalContent !== content) {
    fs.writeFileSync(file, finalContent, 'utf8');
    console.log('Fixed flex in', file);
  }
});
