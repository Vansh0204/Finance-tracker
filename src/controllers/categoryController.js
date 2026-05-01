const prisma = require('../utils/prisma');

const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: req.user.id,
      },
    });
    res.status(201).send(category);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
    });
    res.send(categories);
  } catch (e) {
    res.status(500).send();
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).send({ error: 'Cannot delete category with existing transactions. Reassign or delete transactions first.' });
    }

    await prisma.category.delete({
      where: { id, userId: req.user.id },
    });
    res.send({ message: 'Category deleted' });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};
