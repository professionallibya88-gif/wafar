const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('import ') && !content.includes('export ')) {
    content = 'export {};\n' + content;
  }

  content = content.replace(/async \((req, res)\)/g, 'async (req: any, res: any)');
  content = content.replace(/async \((_req, res)\)/g, 'async (_req: any, res: any)');
  content = content.replace(/async \((req, res, next)\)/g, 'async (req: any, res: any, next: any)');

  content = content.replace(/([a-zA-Z0-9_]+)\((req, res)\)/g, '$1(req: any, res: any)');
  content = content.replace(/\(err\)/g, '(err: any)');
  content = content.replace(/\(error\)/g, '(error: any)');
  content = content.replace(/\(data\)/g, '(data: any)');
  content = content.replace(/\(id\)/g, '(id: any)');
  content = content.replace(/\(userId\)/g, '(userId: any)');
  content = content.replace(/\(filters\)/g, '(filters: any)');
  content = content.replace(/\(limit, offset\)/g, '(limit: any, offset: any)');

  content = content.replace(/([a-zA-Z0-9_]+)\(([^)]+)\) {/g, (match, name, args) => {
    if (['if', 'for', 'while', 'catch', 'switch', 'function'].includes(name)) return match;
    const newArgs = args.split(',').map(a => {
      let trimmed = a.trim();
      if (trimmed && !trimmed.includes(':') && !trimmed.includes('=')) {
        return trimmed + ': any';
      }
      return a;
    }).join(', ');
    return `${name}(${newArgs}) {`;
  });

  fs.writeFileSync(filePath, content);
}

function walk(d){
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(f=>{
    const p=path.join(d,f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.ts')) processFile(p);
  });
}

walk('src/controllers');
walk('src/services');
walk('src/routes');
console.log('Done');
