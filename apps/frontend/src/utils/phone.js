const ARABIC_DIGITS_PATTERN = /[٠-٩]/g;
const EXTENDED_ARABIC_DIGITS_PATTERN = /[۰-۹]/g;

/**
 * توحيد إدخال رقم الهاتف القادم من لوحة ملفاتيح عربية/إنجليزية
 */
export const normalizePhoneNumber = (value) => {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(ARABIC_DIGITS_PATTERN, (digit) =>
      String(digit.charCodeAt(0) - 1632),
    )
    .replace(EXTENDED_ARABIC_DIGITS_PATTERN, (digit) =>
      String(digit.charCodeAt(0) - 1776),
    )
    .replace(/\s+/g, "");
};
