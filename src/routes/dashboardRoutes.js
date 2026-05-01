const express = require('express');
const { getSummary, getMonthlyReport } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/summary', getSummary);
router.get('/report', getMonthlyReport);

module.exports = router;
