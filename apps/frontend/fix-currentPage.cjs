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
  if (content.includes('const currentPage = ref(1)') && !content.includes('watch(currentPage')) {
    // figure out load function name
    let loadFn = '';
    if (content.includes('loadUsers()')) loadFn = 'loadUsers()';
    else if (content.includes('loadSuppliers()')) loadFn = 'loadSuppliers()';
    else if (content.includes('loadParts()')) loadFn = 'loadParts()';
    else if (content.includes('loadFiles()')) loadFn = 'loadFiles()';
    else if (content.includes('loadPayments()')) loadFn = 'loadPayments()';
    else if (content.includes('fetchData()')) loadFn = 'fetchData()';
    else if (content.includes('searchParts()')) loadFn = 'searchParts()';
    else if (content.includes('fetchCatalogs()')) loadFn = 'fetchCatalogs()';
    else if (content.includes('loadHistory()')) loadFn = 'loadHistory()';
    
    if (loadFn) {
        content = content.replace('const currentPage = ref(1);', `const currentPage = ref(1);\nwatch(currentPage, () => { ${loadFn}; });`);
        fs.writeFileSync(f, content);
        console.log('Added watch(currentPage) to', f);
    }
  }
});
