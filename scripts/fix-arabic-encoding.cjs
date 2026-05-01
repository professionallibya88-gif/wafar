const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'src');
const EXTENSIONS = ['.js', '.vue', '.css', '.ts'];

// نمط التعرف على النص العربي المشوه (UTF-8 محفوظ كـ Latin-1)
const GARBLED_ARABIC_PATTERN = /Ø[§±\u00A0-\u00FF]|Ù[\u0080-\u00BF]/;

let fixedCount = 0;
let scannedCount = 0;
let errorCount = 0;

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!GARBLED_ARABIC_PATTERN.test(content)) {
      return; // لا يوجد نص مشوه
    }
    
    // إصلاح الترميز: اعتبار النص الحالي Latin-1 وإعادة فك تشفيره كـ UTF-8
    const fixed = Buffer.from(content, 'latin1').toString('utf8');
    
    // التحقق من أن الإصلاح نجح (لا يجب أن يحتوي على نمط مشوه جديد)
    if (GARBLED_ARABIC_PATTERN.test(fixed)) {
      console.warn(`  [تحذير] لا يزال يحتوي على نص مشوه بعد الإصلاح: ${filePath}`);
      errorCount++;
      return;
    }
    
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`  [تم] تم الإصلاح: ${path.relative(TARGET_DIR, filePath)}`);
    fixedCount++;
  } catch (err) {
    console.error(`  [خطأ] خطأ في ${filePath}: ${err.message}`);
    errorCount++;
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      scannedCount++;
      fixFile(fullPath);
    }
  }
}

console.log('[بدء] بدء إصلاح الترميز العربي...');
console.log(`[مسار] المجلد المستهدف: ${TARGET_DIR}`);
console.log('');

scanDirectory(TARGET_DIR);

console.log('');
console.log('[إحصائيات] النتائج:');
console.log(`   الملفات المفحوصة: ${scannedCount}`);
console.log(`   الملفات المصححة: ${fixedCount}`);
console.log(`   الأخطاء: ${errorCount}`);
console.log('');
console.log(fixedCount > 0 ? '[نجاح] اكتمل الإصلاح بنجاح!' : '[معلومة] لم يتم العثور على ملفات تحتاج إصلاح.');
