const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.vue');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<BaseSelect') && !content.includes('BaseSelect"')) {
    if (content.includes('@/components/base')) {
      content = content.replace(/import\s+{([^}]+)}\s+from\s+["']@\/components\/base["'];?/, (m, p1) => {
        if (p1.includes('BaseSelect')) return m;
        return `import { ${p1.trim()}, BaseSelect } from "@/components/base";`;
      });
    } else {
      content = content.replace(/<script\s+setup>/, `<script setup>\nimport { BaseSelect } from "@/components/base";`);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added import to', file);
  }
});
