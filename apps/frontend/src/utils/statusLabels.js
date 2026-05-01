export const getFileStatusLabel = (status) =>
  ({
    pending: "قيد الانتظار",
    processing: "جاري المعالجة",
    completed: "مكتمل",
    failed: "فشل",
  })[status] || status;

export const getFileStatusVariant = (status) =>
  ({
    pending: "warning",
    processing: "info",
    completed: "success",
    failed: "error",
  })[status] || "default";

export const getPaymentStatusLabel = (status) =>
  ({
    pending: "معلق",
    approved: "مقبول",
    rejected: "مرفوض",
  })[status] || status;

export const getPaymentStatusVariant = (status) =>
  ({
    pending: "warning",
    approved: "success",
    rejected: "error",
  })[status] || "default";

export const getPaymentMethodLabel = (method) =>
  ({
    recharge_madar: "كرت مدار",
    recharge_libyana: "كرت ليبيانا",
    bank_transfer: "تحويل بنكي",
    money_transfer_sarad: "سراد",
    money_transfer_tadawul: "تداول",
    money_transfer_egypt: "معرفة",
    money_transfer_other: "أخرى",
  })[method] || method;

export const getProcessingMethodLabel = (method) =>
  ({
    node_pdf: "Node.js",
    python_pypdf: "بايثون PyPDF",
    python_ai: "Python AI",
    aws_textract: "AWS Textract",
  })[method] || method;
