export const formatCurrency = (value, currency = "د.ل") => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const num = Number(value);
  if (isNaN(num)) {
    return "-";
  }

  const formattedNum = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(num);

  // If no currency is passed (e.g., currency is empty string), just return the number
  if (!currency) {
    return formattedNum;
  }

  return `${formattedNum} ${currency}`;
};
