import { describe, it, expect } from 'vitest';

function validateEnquiry(enquiry: {
  name: string;
  email: string;
  message: string;
}) {
  const errors: string[] = [];

  if (!enquiry.name.trim()) {
    errors.push('Name is required');
  }

  if (!enquiry.email.trim()) {
    errors.push('Email is required');
  } else if (!enquiry.email.includes('@')) {
    errors.push('Invalid email');
  }

  if (!enquiry.message.trim()) {
    errors.push('Message is required');
  }

  return errors;
}

describe('Enquiry Validation', () => {

  it('should accept a valid enquiry', () => {
    const enquiry = {
      name: 'Chetan',
      email: 'chetan@example.com',
      message: 'I am interested in this product.'
    };

    expect(validateEnquiry(enquiry)).toEqual([]);
  });

  it('should reject enquiry when name is missing', () => {
    const enquiry = {
      name: '',
      email: 'chetan@example.com',
      message: 'I am interested in this product.'
    };

    expect(validateEnquiry(enquiry)).toContain('Name is required');
  });

  it('should reject enquiry when email is missing', () => {
    const enquiry = {
      name: 'Chetan',
      email: '',
      message: 'I am interested in this product.'
    };

    expect(validateEnquiry(enquiry)).toContain('Email is required');
  });

  it('should reject invalid email', () => {
    const enquiry = {
      name: 'Chetan',
      email: 'invalid-email',
      message: 'I am interested in this product.'
    };

    expect(validateEnquiry(enquiry)).toContain('Invalid email');
  });

  it('should reject enquiry when message is missing', () => {
    const enquiry = {
      name: 'Chetan',
      email: 'chetan@example.com',
      message: ''
    };

    expect(validateEnquiry(enquiry)).toContain('Message is required');
  });

});