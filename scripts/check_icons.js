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
    } else if (file.endsWith('.vue') || file.endsWith('.js')) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Match <AppIcon name="xxx"
      const regex = /<AppIcon[^>]+name=["']([^"']+)["']/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        results.push({ file, type: 'name', value: match[1] });
      }

      // Match iconName: "xxx"
      const regex2 = /iconName:\s*["']([^"']+)["']/g;
      while ((match = regex2.exec(content)) !== null) {
        results.push({ file, type: 'iconName', value: match[1] });
      }

      // Match :name="xxx"
      const regex3 = /<AppIcon[^>]+:name=["']([^"']+)["']/g;
      while ((match = regex3.exec(content)) !== null) {
        results.push({ file, type: 'dynamic', value: match[1] });
      }
    }
  });
  return results;
}

const allIcons = walk('apps/frontend/src');

// Read the valid keys from index.js manually
const indexContent = fs.readFileSync('apps/frontend/src/components/icons/index.js', 'utf8');

const iconsRegex = /export const Icons = {([\s\S]+?)\};/;
const iconsMatch = iconsRegex.exec(indexContent);
const validIcons = [];
if (iconsMatch) {
  const lines = iconsMatch[1].split('\n');
  lines.forEach(line => {
    const m = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (m) validIcons.push(m[1]);
  });
}

const aliasesRegex = /export const IconAliases = {([\s\S]+?)\};/;
const aliasesMatch = aliasesRegex.exec(indexContent);
const validAliases = [];
if (aliasesMatch) {
  const lines = aliasesMatch[1].split('\n');
  lines.forEach(line => {
    const m = line.match(/^\s*"?([a-zA-Z0-9_\-]+)"?:/);
    if (m) validAliases.push(m[1]);
  });
}

function checkIcon(name) {
  if (name.includes('getThemeIcon')) return true; // dynamic
  if (name.includes('action.iconName')) return true;
  if (name.includes('stat.iconName')) return true;
  if (name.includes('item.icon')) return true;
  
  const aliasName = validAliases.includes(name) ? name : null;
  const iconName = validAliases.includes(name) ? null : name; // simplistic but fine
  const pascalCaseName = name
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
    
  return validIcons.includes(name) || validAliases.includes(name) || validIcons.includes(pascalCaseName);
}

const missing = [];
allIcons.forEach(item => {
  if (!checkIcon(item.value)) {
    missing.push(item);
  }
});

console.log(JSON.stringify(missing, null, 2));
