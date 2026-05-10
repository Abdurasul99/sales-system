export function convertToBase(amount: number, rateToBase: number): number {
  return Number((amount * rateToBase).toFixed(2));
}

export function convertFromBase(baseAmount: number, rateToBase: number): number {
  if (rateToBase <= 0) {
    throw new Error("Exchange rate must be positive");
  }

  return Number((baseAmount / rateToBase).toFixed(2));
}

export function calculateExchangeDifference(expectedBaseAmount: number, actualBaseAmount: number): number {
  return Number((actualBaseAmount - expectedBaseAmount).toFixed(2));
}
