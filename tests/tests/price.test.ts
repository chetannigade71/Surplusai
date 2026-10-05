
import { describe, it, expect } from 'vitest';

describe('Price and Discount Calculation', () => {

  it('should calculate 10% discount correctly', () => {
    const price = 1000;
    const discount = 10;

    const finalPrice = price - (price * discount) / 100;

    expect(finalPrice).toBe(900);
  });

  it('should return original price when discount is 0%', () => {
    const price = 1000;
    const discount = 0;

    const finalPrice = price - (price * discount) / 100;

    expect(finalPrice).toBe(1000);
  });

  it('should return 0 when discount is 100%', () => {
    const price = 1000;
    const discount = 100;

    const finalPrice = price - (price * discount) / 100;

    expect(finalPrice).toBe(0);
  });

});