const express = require('express');
const { setBudget, getBudgets } = require('../controllers/budgetController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', setBudget);
router.get('/', getBudgets);

module.exports = router;
