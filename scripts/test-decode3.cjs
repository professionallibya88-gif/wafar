const iconv = require('iconv-lite');

// الاختبار الصحيح: نأخذ النص المشوه (Unicode string) ونحوله إلى bytes بـ win1252 ثم نفسره كـ UTF-8

const tests = [
  { input: '\u00D8\u00AE', expected: '\u062E' },  // Ø® => خ
  { input: '\u00D8\u00B1', expected: '\u0631' },  // Ø± => ر
  { input: '\u00D9\u201E', expected: '\u0644' },  // Ù„ => ل
  { input: '\u00D9\u02C6', expected: '\u0648' },  // Ùˆ => و
  { input: '\u00D9\u2021', expected: '\u0647' },  // Ù‡ => ه
  { input: '\u00D8\u00A7', expected: '\u0627' },  // Ø§ => ا
  { input: '\u00D8\u00AA', expected: '\u062A' },  // Øª => ت
  { input: '\u00D8\u00AC', expected: '\u062C' },  // Ø¬ => ج
  { input: '\u00D8\u00B9', expected: '\u0639' },  // Ø¹ => ع
  { input: '\u00D8\u00B1', expected: '\u0631' },  // Ø± => ر
  { input: '\u00D8\u00A8', expected: '\u0628' },  // Ø¨ => ب
  { input: '\u00D9\u0160', expected: '\u064A' },  // ÙŠ => ي
  { input: '\u00D8\u00B3', expected: '\u0633' },  // Ø³ => س
];

for (const t of tests) {
  try {
    const bytes = iconv.encode(t.input, 'win1252');
    const decoded = iconv.decode(bytes, 'utf8');
    const ok = decoded === t.expected ? 'OK' : 'MISMATCH';
    console.log(`${ok}: "${t.input}" => bytes [${Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(' ')}] => "${decoded}" (expected "${t.expected}")`);
  } catch (e) {
    console.log(`ERROR: "${t.input}" => ${e.message}`);
  }
}
