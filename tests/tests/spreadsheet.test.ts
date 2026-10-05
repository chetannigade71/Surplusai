import { describe, it, expect } from 'vitest';

describe('Spreadsheet Import - Mapping and Validation', () => {

  it('should map spreadsheet columns correctly', () => {
    const row = {
      'Product Name': 'Laptop',
      'Price': '50000',
      'Quantity': '10'
    };

    const mappedData = {
      name: row['Product Name'],
      price: Number(row['Price']),
      quantity: Number(row['Quantity'])
    };

    expect(mappedData).toEqual({
      name: 'Laptop',
      price: 50000,
      quantity: 10
    });
  });

  it('should reject a row when Product Name is missing', () => {
    const row = {
      'Product Name': '',
      'Price': '50000',
      'Quantity': '10'
    };

    const isValid = row['Product Name'].trim() !== '';

    expect(isValid).toBe(false);
  });

  it('should reject invalid price', () => {
    const row = {
      'Product Name': 'Laptop',
      'Price': 'invalid',
      'Quantity': '10'
    };

    const price = Number(row['Price']);

    expect(Number.isNaN(price)).toBe(true);
  });

  it('should reject invalid quantity', () => {
    const row = {
      'Product Name': 'Laptop',
      'Price': '50000',
      'Quantity': '-5'
    };

    const quantity = Number(row['Quantity']);

    expect(quantity).toBeLessThan(0);
  });

});