const fs = require('fs');
const path = require('path');
const iconIndex = fs.readFileSync('c:/wafar-project/apps/frontend/src/components/icons/index.js', 'utf-8');
const IconsMatch = iconIndex.match(/export const Icons = \{([\s\S]*?)\};/);
const IconsStr = IconsMatch[1];
const exportedIcons = Array.from(IconsStr.matchAll(/([a-zA-Z0-9_]+)\s*:/g)).map(m => m[1]);
const IconAliasesMatch = iconIndex.match(/export const IconAliases = \{([\s\S]*?)\};/);
const IconAliasesStr = IconAliasesMatch[1];
const aliasIcons = Array.from(IconAliasesStr.matchAll(/['"]?([a-zA-Z0-9_\-]+)['"]?\s*:/g)).map(m => m[1]);

const availableNames = new Set([...exportedIcons, ...aliasIcons]);

function checkFile(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach(file => checkFile(path.join(filePath, file)));
  } else if (filePath.endsWith('.vue')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.matchAll(/(?:<AppIcon[^>]+name=["']([^"']+)["'])|(?:name=["']([^"']+)["'][^>]*<AppIcon)/g);
    for (const match of matches) {
      const name = match[1] || match[2];
      if (!name) continue;
      let cleanName = name.endsWith('Icon') ? name.slice(0, -4) : name;
      
      const pascalCaseName = cleanName.split(/[-_\s]/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
      
      if (!availableNames.has(name) && !availableNames.has(cleanName) && !availableNames.has(pascalCaseName)) {
        console.log('Missing:', name, 'in', filePath);
      }
    }
  }
}

checkFile('c:/wafar-project/apps/frontend/src');
