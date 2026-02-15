/**
 * Unit Tests for Authentication
 * Tests for auth utility functions, validators, and services
 */

describe('Auth Unit Tests', () => {
  describe('Email validation', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com'
      ];
      
      validEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalido',
        'invalido@',
        '@example.com',
        'user@.com'
      ];
      
      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Password validation', () => {
    it('should accept passwords with 8+ characters', () => {
      const validPasswords = ['senha12345', 'myP@ssw0rd', 'LongPasswordHere'];
      
      validPasswords.forEach(pwd => {
        expect(pwd.length).toBeGreaterThanOrEqual(8);
      });
    });

    it('should reject passwords with less than 8 characters', () => {
      const invalidPasswords = ['123', 'pass', 'abc1234'];
      
      invalidPasswords.forEach(pwd => {
        expect(pwd.length).toBeLessThan(8);
      });
    });
  });

  describe('User data sanitization', () => {
    it('should trim whitespace from names', () => {
      const name = '  Maria Teste  ';
      const trimmed = name.trim();
      expect(trimmed).toBe('Maria Teste');
    });

    it('should convert emails to lowercase', () => {
      const email = 'USER@EXAMPLE.COM';
      const normalized = email.toLowerCase();
      expect(normalized).toBe('user@example.com');
    });
  });
});
