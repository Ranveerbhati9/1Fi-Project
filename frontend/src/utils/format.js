export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateMonthlyEmi(
  mrp,
  sellingPrice,
  annualInterestRate,
  tenureMonths
) {
  if (tenureMonths <= 0) return sellingPrice;

  if (annualInterestRate === 0) {
    return Math.round(sellingPrice / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (sellingPrice * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}