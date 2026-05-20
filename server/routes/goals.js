const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const goalService = require('../services/goalService');

// GET all goals for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const goals = await goalService.getAllByUserId(userId);
    res.status(200).json(goals);
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ message: 'Failed to fetch goals', error: err.message });
  }
});

// POST create new goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description } = req.body;
    
    const goal = await goalService.create(userId, {
      name,
      targetAmount,
      currentAmount,
      deadline,
      monthlyContribution,
      priority,
      description
    });
    
    res.status(201).json(goal);
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ message: 'Failed to create goal', error: err.message });
  }
});

// PUT update goal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const updates = req.body;
    
    const goal = await goalService.update(id, userId, updates);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.status(200).json(goal);
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(500).json({ message: 'Failed to update goal', error: err.message });
  }
});

// DELETE goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const deleted = await goalService.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting goal:', err);
    res.status(500).json({ message: 'Failed to delete goal', error: err.message });
  }
});

module.exports = router;
