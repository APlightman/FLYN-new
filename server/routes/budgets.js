const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const budgetService = require('../services/budgetService');

// GET all budgets for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const budgets = await budgetService.getAllByUserId(userId);
    res.status(200).json(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ message: 'Failed to fetch budgets', error: err.message });
  }
});

// POST create new budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { categoryId, amount, period, spent } = req.body;
    
    const budget = await budgetService.create(userId, {
      categoryId,
      amount,
      period,
      spent
    });
    
    res.status(201).json(budget);
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).json({ message: 'Failed to create budget', error: err.message });
  }
});

// PUT update budget
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const updates = req.body;
    
    const budget = await budgetService.update(id, userId, updates);
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.status(200).json(budget);
  } catch (err) {
    console.error('Error updating budget:', err);
    res.status(500).json({ message: 'Failed to update budget', error: err.message });
  }
});

// DELETE budget
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const deleted = await budgetService.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ message: 'Failed to delete budget', error: err.message });
  }
});

module.exports = router;
