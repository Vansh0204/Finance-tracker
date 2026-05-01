const prisma = require('../utils/prisma');

const setBudget = async (req, res) => {
  try {
    const { categoryId, amount, month, year } = req.body;
    const userId = req.user.id;

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      update: { amount },
      create: {
        userId,
        categoryId,
        amount,
        month,
        year,
      },
    });

    res.status(201).send(budget);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
      },
      include: {
        category: true,
      },
    });

    // Calculate progress for each budget
    const report = await Promise.all(budgets.map(async (budget) => {
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0);

      const expenses = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = expenses._sum.amount || 0;
      return {
        ...budget,
        spent: Number(spent),
        remaining: Number(budget.amount) - Number(spent),
        percentUsed: (Number(spent) / Number(budget.amount)) * 100,
      };
    }));

    res.send(report);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  setBudget,
  getBudgets,
};
