import { test, expect, describe } from 'bun:test';
import { isValidEmail, isValidPassword, isValidCurrency, isValidDate, sanitizeString } from '../validators';

describe('isValidEmail', () => {
  test('aceita emails validos', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
  });

  test('rejeita emails invalidos', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('abc')).toBe(false);
    expect(isValidEmail('a@')).toBe(false);
    expect(isValidEmail('@b.com')).toBe(false);
  });
});

describe('isValidPassword', () => {
  test('aceita senhas com 6+ chars', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('abcdefgh')).toBe(true);
  });

  test('rejeita senhas curtas', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isValidCurrency', () => {
  test('aceita valores numericos >= 0', () => {
    expect(isValidCurrency(0)).toBe(true);
    expect(isValidCurrency(100.50)).toBe(true);
    expect(isValidCurrency('99.99')).toBe(true);
  });

  test('rejeita valores invalidos', () => {
    expect(isValidCurrency(-1)).toBe(false);
    expect(isValidCurrency('abc')).toBe(false);
    expect(isValidCurrency(NaN)).toBe(false);
  });
});

describe('isValidDate', () => {
  test('aceita datas no formato YYYY-MM-DD', () => {
    expect(isValidDate('2026-02-07')).toBe(true);
    expect(isValidDate('2025-12-31')).toBe(true);
  });

  test('rejeita datas invalidas', () => {
    expect(isValidDate('07/02/2026')).toBe(false);
    expect(isValidDate('abc')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('sanitizeString', () => {
  test('remove caracteres perigosos', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    expect(sanitizeString('normal text')).toBe('normal text');
  });

  test('faz trim', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });
});
