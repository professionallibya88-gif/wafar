const text = `
:التاريخ04/02/2026
لبيع قطع غيار السيارات الحديثة
BOURG ALKHAIR
محلات برج الخير
`;

function extractDocumentDate(text) {
    const lines = text.split('\n').map((line) => line.trim());
    const labeledDatePattern =
      /(?:issue\s+date|document\s+date|catalog\s+date|date|تاريخ\s+الإصدار|تاريخ\s+الملف|تاريخ|التاريخ)\s*[:\-–]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/i;

    for (const line of lines.slice(0, 20)) {
      const match = line.match(labeledDatePattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    const fallbackPatterns = [
      /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,
      /\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/g,
    ];

    for (const pattern of fallbackPatterns) {
      const matches = text.match(pattern) || [];
      for (const candidate of matches) {
        return candidate;
      }
    }

    return '';
}

function extractSupplierName(text) {
    const lines = text.split('\n').filter(Boolean);
    const labeledPatterns = [
      /(?:اسم\s+الشركة|اسم\s+المورد|الشركة\s+الموردة|المورد|شركة|محلات|Supplier|Company|Vendor|Manufacturer)\s*[:\-–]?\s*(.+)$/i,
      /^(?:for|by)\s+(.+)$/i,
    ];

    for (const line of lines.slice(0, 20)) {
      for (const pattern of labeledPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          return match[1].trim();
        }
      }
    }

    for (const line of lines.slice(0, 12)) {
      if (line.length > 3 && !line.includes('تاريخ') && !line.match(/\d/)) {
        return line;
      }
    }
    return '';
}

console.log("Date:", extractDocumentDate(text));
console.log("Supplier:", extractSupplierName(text));
