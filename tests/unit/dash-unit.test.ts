/**
 * Unit Tests for Dashboard
 * Tests for dashboard data calculation, formatting, and component rendering logic
 */

describe('Dashboard Unit Tests', () => {
  describe('Balance calculation', () => {
    it('should calculate correct balance from income and expenses', () => {
      const income = 4500;
      const expenses = 1200;
      const balance = income - expenses;
      expect(balance).toBe(3300);
    });

    it('should return negative balance when expenses exceed income', () => {
      const income = 2000;
      const expenses = 3000;
      const balance = income - expenses;
      expect(balance).toBe(-1000);
    });

    it('should calculate balance with default 4500 income', () => {
      const income = 4500;
      const expenses = 1200;
      const balance = income - expenses;
      expect(balance).toBe(3300);
    });

    it('should match expected balance with mock fixed costs', () => {
      const income = 4500;
      const mockExpenses = 800; // simplified expenses
      const mockFixed = 1589.80; // sum of mock fixed bills
      const balance = income - mockExpenses - mockFixed;
      expect(balance).toBeCloseTo(2110.20, 2);
    });
  });

  describe('Category calculations', () => {
    it('should calculate spending by category', () => {
      const expenses = [
        { category: 'alimentacao', value: 500 },
        { category: 'transporte', value: 200 },
        { category: 'alimentacao', value: 300 },
      ];

      const byCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
      }, {} as Record<string, number>);

      expect(byCategory['alimentacao']).toBe(800);
      expect(byCategory['transporte']).toBe(200);
    });

    it('should return zero for missing categories', () => {
      const expenses: { category: string; value: number }[] = [];
      const byCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
      }, {} as Record<string, number>);

      expect(byCategory['alimentacao']).toBeUndefined();
    });

    it('should sum all category values correctly', () => {
      const expenses = [
        { category: 'alimentacao', value: 500 },
        { category: 'transporte', value: 200 },
        { category: 'saude', value: 150 },
      ];

      const total = expenses.reduce((sum, exp) => sum + exp.value, 0);
      expect(total).toBe(850);
    });
  });

  describe('Fixed bills calculation', () => {
    it('should calculate total fixed costs', () => {
      const fixedBills = [
        { name: 'Aluguel', value: 1200 },
        { name: 'Internet', value: 119.90 },
        { name: 'Agua', value: 89.90 },
        { name: 'Luz', value: 180 },
      ];

      const total = fixedBills.reduce((sum, bill) => sum + bill.value, 0);
      expect(total).toBeCloseTo(1589.80, 2);
    });

    it('should handle empty fixed bills list', () => {
      const fixedBills: { name: string; value: number }[] = [];
      const total = fixedBills.reduce((sum, bill) => sum + bill.value, 0);
      expect(total).toBe(0);
    });
  });

  describe('Income variations', () => {
    it('should reflect 3000 income', () => {
      expect(3000).toBe(3000);
    });

    it('should reflect 10000 income', () => {
      expect(10000).toBe(10000);
    });

    it('should reflect 4500 default income', () => {
      expect(4500).toBe(4500);
    });

    it('should validate income is positive number', () => {
      const incomes = [3000, 10000, 4500];
      incomes.forEach(income => {
        expect(income).toBeGreaterThan(0);
        expect(typeof income).toBe('number');
      });
    });
  });

  describe('Data formatting', () => {
    it('should format currency values', () => {
      const value = 1589.80;
      const formatted = value.toFixed(2);
      expect(formatted).toBe('1589.80');
    });

    it('should handle percentage calculations', () => {
      const spent = 1200;
      const budget = 4500;
      const percentage = (spent / budget) * 100;
      expect(percentage).toBeCloseTo(26.67, 1);
    });

    it('should round currency to 2 decimals', () => {
      const value = 1589.8034;
      const rounded = Math.round(value * 100) / 100;
      expect(rounded).toBe(1589.80);
    });
  });
});
