const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const categoryService = require('../services/categoryService');
const { categoryValidators } = require('../middleware/validators');

// GET all categories for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const categories = await categoryService.getAllByUserId(userId);
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
});

// POST create new category
router.post('/', 
  authMiddleware,
  categoryValidators.create,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { name, type, color, parent, budget } = req.body;
      
      const category = await categoryService.create(userId, {
        name,
        type,
        color,
        parent,
        budget
      });
      
      res.status(201).json(category);
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ message: 'Failed to create category', error: err.message });
    }
  }
);

// PUT update category
router.put('/:id', 
  authMiddleware,
  categoryValidators.update,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const updates = req.body;
      
      const category = await categoryService.update(id, userId, updates);
      
      if (!category) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      res.status(200).json(category);
    } catch (err) {
      console.error('Error updating category:', err);
      res.status(500).json({ message: 'Failed to update category', error: err.message });
    }
  }
);

// DELETE category
router.delete('/:id', 
  authMiddleware,
  categoryValidators.delete,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      
      const deleted = await categoryService.delete(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      if (err.message === 'Cannot delete category with associated transactions') {
        return res.status(400).json({ message: err.message });
      }
      console.error('Error deleting category:', err);
      res.status(500).json({ message: 'Failed to delete category', error: err.message });
    }
  }
);

module.exports = router;
