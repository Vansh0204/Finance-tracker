const express = require('express');
const { createCategory, getCategories, deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createCategory);
router.get('/', getCategories);
router.delete('/:id', deleteCategory);

module.exports = router;
