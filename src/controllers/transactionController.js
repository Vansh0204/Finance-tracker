const prisma = require('../utils/prisma');

const createTransaction = async (req, res) => {
  try {
    const { amount, description, date, type, categoryId, currency } = req.body;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        currency: currency || 'USD',
        description,
        date: date ? new Date(date) : new Date(),
        type,
        userId: req.user.id,
        categoryId,
        receiptUrl
      },
    });


    res.status(201).send(transaction);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
    res.send(transactions);
  } catch (e) {
    res.status(500).send();
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const transaction = await prisma.transaction.update({
      where: { id, userId: req.user.id },
      data: {
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
      },
    });
    res.send(transaction);
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({
      where: { id, userId: req.user.id },
    });
    res.send({ message: 'Transaction deleted' });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
