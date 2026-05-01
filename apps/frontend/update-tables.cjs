const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('apps/frontend/src/**/*.vue', { cwd: 'c:/wafar-project' });
let count = 0;

files.forEach(file => {
  const fullPath = path.join('c:/wafar-project', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  // Replace <table class="w-full"> with <table class="w-full min-w-[800px]">
  content = content.replace(/<table class="w-full">/g, '<table class="w-full min-w-[800px]">');
  content = content.replace(/<table class="min-w-full">/g, '<table class="w-full min-w-[800px]">');
  content = content.replace(/<table class="w-full min-w-\[700px\]">/g, '<table class="w-full min-w-[800px]">');
  content = content.replace(/<table class="w-full min-w-\[980px\]">/g, '<table class="w-full min-w-[1000px]">');
  
  // Update button padding to be more touch friendly
  // class="... px-3 py-1.5 ..." -> "px-4 py-2"
  // Let's not blindly replace all px-3 py-1.5, because it might be on non-table elements.
  // Wait, I can just use another regex for buttons inside the table? 
  // It's safer to replace globally since touch-friendly buttons are generally better on mobile anyway,
  // but let's be careful.

  if (original !== content) {
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + fullPath);
    count++;
  }
});

console.log('Total tables updated: ' + count);
