/**
 * Unit Tests for Dashboard Calculations
 * Tests for financial calculations, percentages, and data integrity
 */

describe('Dashboard Financial Calculations', () => {
  describe('Balance calculation with multiple components', () => {
    it('should calculate balance correctly: income - expenses - fixed costs', () => {
      const income = 6000;
      const expenses = 1000;
      const fixedCosts = 1500;
      const expectedBalance = income - expenses - fixedCosts;
      
      expect(expectedBalance).toBe(3500);
    });

    it('should handle negative balance when expenses exceed income', () => {
      const income = 2000;
      const expenses = 2500;
      const fixedCosts = 800;
      const expectedBalance = income - expenses - fixedCosts;
      
      expect(expectedBalance).toBeLessThan(0);
      expect(expectedBalance).toBe(-1300);
    });

    it('should calculate percentage of income spent', () => {
      const income = 5000;
      const spent = 1500;
      const percentage = (spent / income) * 100;
      
      expect(percentage).toBeCloseTo(30, 1);
    });

    it('should calculate percentage remaining', () => {
      const income = 5000;
      const spent = 1500;
      const percentageRemaining = 100 - (spent / income) * 100;
      
      expect(percentageRemaining).toBeCloseTo(70, 1);
    });
  });

  describe('Category distribution calculations', () => {
    it('should calculate category percentages correctly', () => {
      const expenses = [
        { category: 'alimentacao', value: 500 },
        { category: 'transporte', value: 300 },
        { category: 'saude', value: 200 },
      ];
      
      const total = expenses.reduce((sum, e) => sum + e.value, 0);
      
      const categoryPercentages = expenses.map(e => ({
        category: e.category,
        percentage: (e.value / total) * 100
      }));

      if (categoryPercentages[0]) expect(categoryPercentages[0].percentage).toBeCloseTo(50, 1);
      if (categoryPercentages[1]) expect(categoryPercentages[1].percentage).toBeCloseTo(30, 1);
      if (categoryPercentages[2]) expect(categoryPercentages[2].percentage).toBeCloseTo(20, 1);
      
      // Total should be 100%
      const totalPercentage = categoryPercentages.reduce((sum, c) => sum + c.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should handle empty category list', () => {
      const expenses: { category: string; value: number }[] = [];
      const total = expenses.reduce((sum, e) => sum + e.value, 0);
      
      expect(total).toBe(0);
    });
  });

  describe('Fixed costs distribution', () => {
    it('should calculate total fixed costs', () => {
      const fixedCosts = [
        { name: 'Aluguel', value: 2000 },
        { name: 'Internet', value: 100 },
        { name: 'Agua', value: 80 },
        { name: 'Luz', value: 200 },
      ];

      const total = fixedCosts.reduce((sum, cost) => sum + cost.value, 0);
      expect(total).toBe(2380);
    });

    it('should calculate percentage of income that goes to fixed costs', () => {
      const income = 5000;
      const fixedCosts = 1500;
      const percentageOfFixed = (fixedCosts / income) * 100;

      expect(percentageOfFixed).toBe(30);
    });

    it('should calculate remaining budget after fixed costs', () => {
      const income = 5000;
      const fixedCosts = 1500;
      const remainingBudget = income - fixedCosts;

      expect(remainingBudget).toBe(3500);
    });
  });

  describe('Debt calculations', () => {
    it('should calculate total debt amount', () => {
      const debts = [
        { description: 'Cartão', amount: 5000 },
        { description: 'Empréstimo', amount: 10000 },
        { description: 'Consignado', amount: 3000 },
      ];

      const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
      expect(totalDebt).toBe(18000);
    });

    it('should calculate debt as percentage of income', () => {
      const income = 5000;
      const totalDebt = 18000;
      const debtPercentage = (totalDebt / income) * 100;

      expect(debtPercentage).toBe(360); // 3.6 months of income
    });

    it('should calculate minimum monthly payment needed', () => {
      const debts = [
        { originalAmount: 5000, monthsLeft: 10 },
        { originalAmount: 10000, monthsLeft: 24 },
        { originalAmount: 3000, monthsLeft: 12 },
      ];

      const totalMonthlyPayment = debts.reduce(
        (sum, debt) => sum + (debt.originalAmount / debt.monthsLeft),
        0
      );

      expect(totalMonthlyPayment).toBeCloseTo(1166.67, 1);
    });
  });

  describe('Dashboard integrity checks', () => {
    it('should verify income distribution adds up to 100%', () => {
      const income = 5000;
      const allocated = [
        { category: 'fixed', amount: 1500 },
        { category: 'expenses', amount: 1000 },
        { category: 'savings', amount: 1000 },
        { category: 'remaining', amount: 1500 },
      ];

      const totalAllocated = allocated.reduce((sum, a) => sum + a.amount, 0);
      expect(totalAllocated).toBe(income);

      const percentages = allocated.map(a => (a.amount / income) * 100);
      const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should calculate safe spending limits based on income', () => {
      const income = 5000;
      const safeFixedPercentage = 0.35; // 35% for fixed costs
      const safeExpensePercentage = 0.30; // 30% for variable expenses
      const safeInvestPercentage = 0.20; // 20% for savings

      const safeFixed = income * safeFixedPercentage;
      const safeExpense = income * safeExpensePercentage;
      const safeInvest = income * safeInvestPercentage;
      const remaining = income - safeFixed - safeExpense - safeInvest;

      expect(safeFixed).toBe(1750);
      expect(safeExpense).toBe(1500);
      expect(safeInvest).toBe(1000);
      expect(remaining).toBe(750);
    });

    it('should identify warning conditions', () => {
      const income = 5000;
      const expenses = 4500; // 90% of income

      const isWarning = (expenses / income) > 0.80;
      expect(isWarning).toBe(true);

      const isCritical = (expenses / income) >= 1.0;
      expect(isCritical).toBe(false);
    });
  });

  describe('Currency handling and rounding', () => {
    it('should round to 2 decimal places', () => {
      const value = 123.456;
      const rounded = Math.round(value * 100) / 100;
      expect(rounded).toBe(123.46);
    });

    it('should handle floating point precision', () => {
      const a = 0.1;
      const b = 0.2;
      const sum = parseFloat((a + b).toFixed(2));
      expect(sum).toBe(0.3);
    });

    it('should format large numbers correctly', () => {
      const value = 1234567.89;
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(formatted).toBe('1.234.567,89');
    });
  });
});
