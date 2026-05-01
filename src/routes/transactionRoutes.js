const express = require('express');
const { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

const router = express.Router();

router.use(auth);

router.post('/', upload.single('receipt'), createTransaction);

router.get('/', getTransactions);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
