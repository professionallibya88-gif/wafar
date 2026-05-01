/**
 * تحويل قيمة غير معروفة إلى كائن Error
 * يُستخدم في معالجة الأخطاء بشكل موحد
 */
export const toError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  return new Error(String(err));
};
