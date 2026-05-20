const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const transactionService = require('../services/transactionService');
const { transactionValidators } = require('../middleware/validators');

// GET all transactions for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const transactions = await transactionService.getAllByUserId(userId);
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
});

// POST create new transaction
router.post('/', 
  authMiddleware,
  transactionValidators.create,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { type, amount, category, description, date, tags } = req.body;
      
      const transaction = await transactionService.create(userId, {
        type,
        amount,
        category,
        description,
        date,
        tags
      });
      
      res.status(201).json(transaction);
    } catch (err) {
      console.error('Error creating transaction:', err);
      res.status(500).json({ message: 'Failed to create transaction', error: err.message });
    }
  }
);

// PUT update transaction
router.put('/:id', 
  authMiddleware,
  transactionValidators.update,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const updates = req.body;
      
      const transaction = await transactionService.update(id, userId, updates);
      
      if (!transaction) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      res.status(200).json(transaction);
    } catch (err) {
      console.error('Error updating transaction:', err);
      res.status(500).json({ message: 'Failed to update transaction', error: err.message });
    }
  }
);

// DELETE transaction
router.delete('/:id', 
  authMiddleware,
  transactionValidators.delete,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      
      const deleted = await transactionService.delete(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
    }
  }
);

module.exports = router;
