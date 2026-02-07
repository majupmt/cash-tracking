export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(senha: string): boolean {
  return typeof senha === 'string' && senha.length >= 6;
}

export function isValidCurrency(value: unknown): boolean {
  const n = Number(value);
  return !isNaN(n) && isFinite(n) && n >= 0;
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function sanitizeString(str: string): string {
  return str.replace(/[<>"'&]/g, '').trim();
}
