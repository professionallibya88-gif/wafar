const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.vue');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We will find all <select>...</select>
  // Since some selects might have complex v-for, we'll try to handle them carefully.
  content = content.replace(/<select([\s\S]*?)>([\s\S]*?)<\/select>/g, (match, selectAttrs, optionsHtml) => {
    // extract v-model
    const vModelMatch = selectAttrs.match(/v-model(?:(?:\.[a-zA-Z]+)+)?=["']([^"']+)["']/);
    const vModel = vModelMatch ? vModelMatch[0] : '';
    
    // extract class
    const classMatch = selectAttrs.match(/class=["']([^"']+)["']/);
    const classes = classMatch ? classMatch[1] : '';
    
    // extract @change
    const changeMatch = selectAttrs.match(/@change=["']([^"']+)["']/);
    const change = changeMatch ? changeMatch[0] : '';
    
    // extract required, disabled etc
    const required = selectAttrs.includes('required') ? 'required' : '';
    const disabled = selectAttrs.includes('disabled') ? 'disabled' : '';

    // parse options
    const optionRegex = /<option\s+([^>]*)>([\s\S]*?)<\/option>/g;
    let optMatch;
    let optionsArray = "[\n";
    let isComplex = false;
    
    while ((optMatch = optionRegex.exec(optionsHtml)) !== null) {
      const optAttrs = optMatch[1];
      const optText = optMatch[2].trim().replace(/\s+/g, ' '); // remove newlines in text
      
      // check for v-for
      if (optAttrs.includes('v-for=')) {
        const vForMatch = optAttrs.match(/v-for=["'](?:(?:\(([^,]+),\s*[^)]+\))|([^\s]+))\s+in\s+([^"']+)["']/);
        if (vForMatch) {
          const itemVar = vForMatch[1] || vForMatch[2];
          const listVar = vForMatch[3];
          
          const valMatch = optAttrs.match(/:value=["']([^"']+)["']/);
          const valCode = valMatch ? valMatch[1] : itemVar;
          
          let textCode = optText;
          if (textCode.startsWith('{{') && textCode.endsWith('}}')) {
             textCode = textCode.slice(2, -2).trim();
          } else {
             textCode = `\`${textCode.replace(/\{\{/g, '${').replace(/\}\}/g, '}')}\``;
          }
          
          optionsArray += `    ...(${listVar} || []).map(${itemVar} => ({ label: ${textCode}, value: ${valCode} })),\n`;
        } else {
          isComplex = true;
        }
      } else {
        // normal option
        let val = '';
        const valMatch = optAttrs.match(/value=["']([^"']*)["']/);
        if (valMatch) {
          val = valMatch[1];
        } else {
          // might be :value="true"
          const bindValMatch = optAttrs.match(/:value=["']([^"']*)["']/);
          if (bindValMatch) {
            val = bindValMatch[1];
          }
        }
        
        let valStr = `'${val}'`;
        if (optAttrs.includes(':value="')) {
          const bindValMatch = optAttrs.match(/:value=["']([^"']*)["']/);
          if (bindValMatch) valStr = bindValMatch[1];
        }

        optionsArray += `    { label: '${optText}', value: ${valStr} },\n`;
      }
    }
    optionsArray += "  ]";
    
    if (isComplex) {
      console.log(`Skipping complex select in ${file}`);
      return match;
    }

    changed = true;
    
    let result = `<BaseSelect\n`;
    if (vModel) result += `  ${vModel}\n`;
    if (classes) result += `  select-class="${classes}"\n`;
    if (change) result += `  ${change}\n`;
    if (required) result += `  required\n`;
    if (disabled) result += `  disabled\n`;
    result += `  :options="${optionsArray}"\n/>`;
    
    return result;
  });

  if (changed) {
    // Add BaseSelect to imports if needed
    if (!content.includes('BaseSelect')) {
      if (content.includes('import {') && content.includes('@/components/base')) {
        content = content.replace(/import\s+{([^}]+)}\s+from\s+["']@\/components\/base["']/, (m, p1) => {
          return `import {${p1}, BaseSelect } from "@/components/base"`;
        });
      } else {
        // Find script setup and add import
        content = content.replace(/<script\s+setup>/, `<script setup>\nimport { BaseSelect } from "@/components/base";`);
      }
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
