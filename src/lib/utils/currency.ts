/**
 * Currency utility functions
 */

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * taxRate * 100) / 100;
}

export function calculateTip(amount: number, tipPercentage: number): number {
  return Math.round(amount * tipPercentage * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  taxRate: number,
  tipPercentage?: number,
  serviceCharge?: number
): {
  subtotal: number;
  tax: number;
  tip: number;
  serviceCharge: number;
  total: number;
} {
  const tax = calculateTax(subtotal, taxRate);
  const tip = tipPercentage ? calculateTip(subtotal, tipPercentage) : 0;
  const serviceChargeAmount = serviceCharge ? calculateTax(subtotal, serviceCharge) : 0;
  
  const total = subtotal + tax + tip + serviceChargeAmount;
  
  return {
    subtotal,
    tax,
    tip,
    serviceCharge: serviceChargeAmount,
    total: Math.round(total * 100) / 100,
  };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
}

export function roundToNearestCent(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculatePercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

export function calculateDiscount(originalPrice: number, discountPercentage: number): {
  discountAmount: number;
  finalPrice: number;
} {
  const discountAmount = Math.round(originalPrice * discountPercentage * 100) / 100;
  const finalPrice = originalPrice - discountAmount;
  
  return {
    discountAmount,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateAverageOrderValue(orders: Array<{ total: number }>): number {
  if (orders.length === 0) return 0;
  
  const sum = orders.reduce((acc, order) => acc + order.total, 0);
  return Math.round((sum / orders.length) * 100) / 100;
}

export function calculateRevenueGrowth(
  currentPeriod: number,
  previousPeriod: number
): number {
  if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
  
  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100 * 100) / 100;
}
