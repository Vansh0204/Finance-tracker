const prisma = require('../utils/prisma');

const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    res.send({
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (e) {
    res.status(500).send();
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    transactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (t.type === 'INCOME') {
        monthlyData[month].income += Number(t.amount);
      } else {
        monthlyData[month].expense += Number(t.amount);
      }
    });

    res.send(monthlyData);
  } catch (e) {
    res.status(500).send();
  }
};

module.exports = {
  getSummary,
  getMonthlyReport,
};
