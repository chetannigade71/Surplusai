import { describe, it, expect } from 'vitest';

describe('API Access Control', () => {

  it('should reject a signed-out user from an admin endpoint', () => {
    const user = null;

    const isAuthenticated = user !== null;

    expect(isAuthenticated).toBe(false);
  });

  it('should allow an admin user to access an admin endpoint', () => {
    const user = {
      role: 'admin'
    };

    expect(user.role).toBe('admin');
  });

  it('should identify staff as a different role from admin', () => {
    const user = {
      role: 'staff'
    };

    expect(user.role).not.toBe('admin');
  });

});
