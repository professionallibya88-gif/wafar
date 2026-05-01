const iconv = require('iconv-lite');

const sample = 'اج!ة استخدال& ال\u001eأ`\u001a ات ال\u001e&حدة';

const encodings = ['win1252', 'win1256', 'iso88596', 'cp720', 'cp864', 'macarabic', 'latin1'];

for (const enc of encodings) {
  try {
    const buf = iconv.encode(sample, 'utf8');
    // Actually we need to decode the file bytes differently
    // The file is already utf8, but some bytes were misinterpreted
    // Let's try treating each character as a byte and re-decode
    const bytes = Buffer.from(sample, 'binary');
    const decoded = iconv.decode(bytes, enc);
    console.log(enc + ': ' + decoded);
  } catch (e) {
    console.log(enc + ': ERROR - ' + e.message);
  }
}
