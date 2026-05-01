const fs = require('fs');
const path = require('path');

const replacements = [
  ['ا\uFFFDبحث', 'البحث'],
  ['ا\uFFFDملف', 'الملف'],
  ['ا\uFFFDمستخد', 'المستخدم'],
  ['ا\uFFFDمدير', 'المدير'],
  ['ر\uFFFDقم', 'رقم'],
  ['\uFFFDرسال', 'إرسال'],
  ['\uFFFDرسا', 'إرسا'],
  ['\uFFFDرشاء', 'إرشاء'],
  ['\uFFFDر', 'إر'],
  ['\uFFFDجراءات', 'إجراءات'],
  ['\uFFFDجراء', 'إجراء'],
  ['\uFFFDجرا', 'إجرا'],
  ['\uFFFDجر', 'إجر'],
  ['\uFFFDحصائ', 'إحصائ'],
  ['\uFFFDحصا', 'إحصا'],
  ['\uFFFDحص', 'إحص'],
  ['\uFFFDعدادات', 'إعدادات'],
  ['\uFFFDعداد', 'إعداد'],
  ['\uFFFDعدا', 'إعدا'],
  ['\uFFFDعد', 'إعد'],
  ['\uFFFDعلام', 'إعلام'],
  ['\uFFFDعلا', 'إعلا'],
  ['\uFFFDعل', 'إعل'],
  ['\uFFFDعادة', 'إعادة'],
  ['\uFFFDعاد', 'إعاد'],
  ['\uFFFDعا', 'إعا'],
  ['\uFFFDع', 'إع'],
  ['\uFFFDلغ', 'إلغ'],
  ['\uFFFDلتزام', 'إلتزام'],
  ['\uFFFDلت', 'إلت'],
  ['\uFFFDل', 'إل'],
  ['\uFFFDتصالح', 'إتصالح'],
  ['\uFFFDتصال', 'إتصال'],
  ['\uFFFDتص', 'إتص'],
  ['\uFFFDت', 'إت'],
  ['\uFFFDضاف', 'إضاف'],
  ['\uFFFDضا', 'إضا'],
  ['\uFFFDض', 'إض'],
  ['\uFFFDشعارات', 'إشعارات'],
  ['\uFFFDشعار', 'إشعار'],
  ['\uFFFDشعا', 'إشعا'],
  ['\uFFFDشع', 'إشع'],
  ['\uFFFDش', 'إش'],
  ['\uFFFDغلاق', 'إغلاق'],
  ['\uFFFDغل', 'إغل'],
  ['\uFFFDغ', 'إغ'],
  ['\uFFFDن', 'إن'],
  ['\uFFFDنشئ', 'إنشئ'],
  ['\uFFFDنشاء', 'إنشاء'],
  ['\uFFFDنش', 'إنش'],
  ['\uFFFDن', 'إن'],
  ['\uFFFDصالح', 'إصالح'],
  ['\uFFFDصال', 'إصال'],
  ['\uFFFDصا', 'إصا'],
  ['\uFFFDصلاح', 'إصلاح'],
  ['\uFFFDصل', 'إصل'],
  ['\uFFFDص', 'إص'],
  ['\uFFFDدخ', 'إدخ'],
  ['\uFFFDدارة', 'إدارة'],
  ['\uFFFDد', 'إد'],
  ['ا\uFFFD', 'ال'],
  ['\uFFFD', ''],
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const before = (content.match(/\uFFFD/g) || []).length;
  if (before === 0) return 0;

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  const after = (content.match(/\uFFFD/g) || []).length;
  return before - after;
}

function scanAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      totalFixed += scanAndFix(p);
    } else if (e.isFile() && (p.endsWith('.js') || p.endsWith('.vue'))) {
      const fixed = fixFile(p);
      if (fixed > 0) {
        console.log('Fixed ' + fixed + ' in ' + p.replace(dir, ''));
        totalFixed += fixed;
      }
    }
  }
  return totalFixed;
}

const total = scanAndFix(path.join(__dirname, 'src'));
console.log('Total replacements: ' + total);
