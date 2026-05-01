const iconv = require('iconv-lite');

// اختبار فك تشفير نص مشوه - باستخدام Buffer مباشرة من النص المشوه
// الـ bytes على القرص هي UTF-8 encoding للنص المشوه
// النص المشوه هو: Arabic UTF-8 bytes تم تفسيرها كـ Windows-1252

// نختبر بـ Buffer مباشرة يمثل bytes النص المشوه على القرص
// مثال: "Ø®" = U+00D8 U+00AE = UTF-8 bytes: C3 98 C2 AE
const b1 = Buffer.from([0xC3, 0x98, 0xC2, 0xAE]); // "Ø®" 
console.log('b1 as utf8 string:', b1.toString('utf8')); // should be "Ø®"

// الآن نفك تشفير هذه الـ bytes كـ Windows-1252 ثم نفسرها كـ UTF-8
const decoded1 = iconv.decode(b1, 'win1252');
console.log('b1 decoded via win1252 then utf8:', decoded1);

// اختبار حالة "Ù„" = U+00D9 U+201E = UTF-8 bytes: C3 99 E2 80 9E
const b2 = Buffer.from([0xC3, 0x99, 0xE2, 0x80, 0x9E]);
console.log('b2 as utf8 string:', b2.toString('utf8')); // should be "Ù„"
const decoded2 = iconv.decode(b2, 'win1252');
console.log('b2 decoded via win1252 then utf8:', decoded2);

// اختبار حالة "Ùˆ" = U+00D9 U+02C6 = UTF-8 bytes: C3 99 CB 86
const b3 = Buffer.from([0xC3, 0x99, 0xCB, 0x86]);
console.log('b3 as utf8 string:', b3.toString('utf8')); // should be "Ùˆ"
const decoded3 = iconv.decode(b3, 'win1252');
console.log('b3 decoded via win1252 then utf8:', decoded3);

// اختبار حالة "Ù‡" = U+00D9 U+2021 = UTF-8 bytes: C3 99 E2 80 A1
const b4 = Buffer.from([0xC3, 0x99, 0xE2, 0x80, 0xA1]);
console.log('b4 as utf8 string:', b4.toString('utf8')); // should be "Ù‡"
const decoded4 = iconv.decode(b4, 'win1252');
console.log('b4 decoded via win1252 then utf8:', decoded4);
