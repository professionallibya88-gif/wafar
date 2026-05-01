const ARABIC_DIGITS_PATTERN = /[٠-٩]/g;
const EXTENDED_ARABIC_DIGITS_PATTERN = /[۰-۹]/g;

/**
 * تطبيع رقم الهاتف لتوحيد الإدخال القادم من الواجهات المختلفة
 */
export const normalizePhoneNumber = (value: string): string => {
  return value
    .trim()
    .replace(ARABIC_DIGITS_PATTERN, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(EXTENDED_ARABIC_DIGITS_PATTERN, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/\s+/g, '');
};
