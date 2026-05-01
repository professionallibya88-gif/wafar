const iconv = require('iconv-lite');

const testStrings = [
  '\u00D8\u00AE\u00D8\u00B1\u00D9\u0160\u00D8\u00B7\u00D8\u00A9 \u00D8\u00A7\u00D9\u201E\u00D8\u00AE\u00D8\u00B7\u00D9\u02C6\u00D8\u00B7',
  '\u00D8\u00AA\u00D8\u00AC\u00D9\u02C6\u00D8\u00A7\u00D9\u201E',
  '\u00D9\u2021\u00D9\u02C6\u00D8\u00AA\u00D9\u02C6 \u00D8\u00B3\u00D8\u00A7\u00D9\u2021\u00D8\u00B3 \u00D8\u00B9\u00D8\u00B1\u00D8\u00A8\u00D9\u0160',
  '\u00D8\u00B4\u00D9\u2021\u00D8\u00B1\u00D8\u00B2\u00D8\u00A7\u00D8\u00AF',
  '\u00D8\u00A7\u00D9\u201E\u00D9\u201A\u00D8\u00A7\u00D9\u2021\u00D8\u00B1\u00D8\u00A9'
];

for (const s of testStrings) {
  try {
    const bytes = iconv.encode(s, 'win1252');
    const decoded = iconv.decode(bytes, 'utf8');
    console.log('Input length: ' + s.length + ' => ' + decoded);
  } catch (e) {
    console.log('Error: ' + e.message + ' for input length ' + s.length);
  }
}
