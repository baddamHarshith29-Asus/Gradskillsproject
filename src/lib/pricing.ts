/**
 * lib/pricing.ts
 * Computes dynamic pricing rates based on historical utilization.
 */

export function calculatePrice(baseRate: number, historicalBookingRate: number): number {
  if (historicalBookingRate > 0.7) {
    return Math.round(baseRate * 1.15); // Peak pricing +15%
  }
  if (historicalBookingRate < 0.3) {
    return Math.round(baseRate * 0.85); // Off-peak discount -15%
  }
  return baseRate;
}

export function isPeakPricing(historicalBookingRate: number): boolean {
  return historicalBookingRate > 0.7;
}

export function isDiscountPricing(historicalBookingRate: number): boolean {
  return historicalBookingRate < 0.3;
}
