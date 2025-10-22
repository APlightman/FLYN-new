const express = require('express');
const cors = require('cors');
const path = require('path');

const authMiddleware = require('./authMiddleware');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // In a real app, configure this with your frontend's origin
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Example of a protected route
app.get('/api/protected-data', authMiddleware, async (req, res) => {
  // req.user contains the decoded Firebase token (e.g., req.user.uid)
  res.send({ message: `Hello user ${req.user.uid}, you are accessing protected data!` });
});

// Transactions endpoints
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send({ message: 'Failed to fetch transactions', error: err.message });
  }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { type, amount, category, description, date, tags } = req.body;
    
    const { rows } = await db.query(
      `INSERT INTO transactions (user_id, type, amount, category, description, date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, type, amount, category, description, date, tags]
    );
    
    res.status(201).send(rows[0]);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).send({ message: 'Failed to create transaction', error: err.message });
  }
});

app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { type, amount, category, description, date, tags } = req.body;
    
    const { rows } = await db.query(
      `UPDATE transactions
       SET type = $1, amount = $2, category = $3, description = $4, date = $5, tags = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [type, amount, category, description, date, tags, id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Transaction not found' });
    }
    
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).send({ message: 'Failed to update transaction', error: err.message });
  }
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const { rowCount } = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).send({ message: 'Transaction not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).send({ message: 'Failed to delete transaction', error: err.message });
  }
});

// Categories endpoints
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send({ message: 'Failed to fetch categories', error: err.message });
  }
});

app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, type, color, parent, budget } = req.body;
    
    const { rows } = await db.query(
      `INSERT INTO categories (user_id, name, type, color, parent, budget)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, type, color, parent, budget]
    );
    
    res.status(201).send(rows[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).send({ message: 'Failed to create category', error: err.message });
  }
});

app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, type, color, parent, budget } = req.body;
    
    const { rows } = await db.query(
      `UPDATE categories
       SET name = $1, type = $2, color = $3, parent = $4, budget = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, type, color, parent, budget, id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Category not found' });
    }
    
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).send({ message: 'Failed to update category', error: err.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    // Проверяем, есть ли транзакции с этой категорией
    const { rowCount: transactionCount } = await db.query(
      'SELECT COUNT(*) FROM transactions WHERE category = (SELECT name FROM categories WHERE id = $1 AND user_id = $2)',
      [id, userId]
    );
    
    if (transactionCount > 0) {
      return res.status(400).send({ message: 'Cannot delete category with associated transactions' });
    }
    
    const { rowCount } = await db.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).send({ message: 'Category not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).send({ message: 'Failed to delete category', error: err.message });
  }
});

// Budgets endpoints
app.get('/api/budgets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { rows } = await db.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [userId]
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).send({ message: 'Failed to fetch budgets', error: err.message });
  }
});

app.post('/api/budgets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { categoryId, amount, period, spent } = req.body;
    
    const { rows } = await db.query(
      `INSERT INTO budgets (user_id, category_id, amount, period, spent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, categoryId, amount, period, spent]
    );
    
    res.status(201).send(rows[0]);
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).send({ message: 'Failed to create budget', error: err.message });
  }
});

app.put('/api/budgets/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { categoryId, amount, period, spent } = req.body;
    
    const { rows } = await db.query(
      `UPDATE budgets
       SET category_id = $1, amount = $2, period = $3, spent = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [categoryId, amount, period, spent, id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Budget not found' });
    }
    
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error('Error updating budget:', err);
    res.status(500).send({ message: 'Failed to update budget', error: err.message });
  }
});

app.delete('/api/budgets/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const { rowCount } = await db.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).send({ message: 'Budget not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).send({ message: 'Failed to delete budget', error: err.message });
  }
});

// Goals endpoints
app.get('/api/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { rows } = await db.query(
      'SELECT * FROM goals WHERE user_id = $1',
      [userId]
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).send({ message: 'Failed to fetch goals', error: err.message });
  }
});

app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description } = req.body;
    
    const { rows } = await db.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description]
    );
    
    res.status(201).send(rows[0]);
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).send({ message: 'Failed to create goal', error: err.message });
  }
});

app.put('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description } = req.body;
    
    const { rows } = await db.query(
      `UPDATE goals
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, monthly_contribution = $5, priority = $6, description = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description, id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Goal not found' });
    }
    
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(500).send({ message: 'Failed to update goal', error: err.message });
  }
});

app.delete('/api/goals/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const { rowCount } = await db.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).send({ message: 'Goal not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting goal:', err);
    res.status(500).send({ message: 'Failed to delete goal', error: err.message });
  }
});

// Recurring payments endpoints
app.get('/api/recurring-payments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { rows } = await db.query(
      'SELECT * FROM recurring_payments WHERE user_id = $1',
      [userId]
    );
    res.status(200).send(rows);
  } catch (err) {
    console.error('Error fetching recurring payments:', err);
    res.status(500).send({ message: 'Failed to fetch recurring payments', error: err.message });
  }
});

app.post('/api/recurring-payments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, amount, category, frequency, cronExpression, nextDate, isActive, description } = req.body;
    
    const { rows } = await db.query(
      `INSERT INTO recurring_payments (user_id, name, amount, category, frequency, cron_expression, next_date, is_active, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, name, amount, category, frequency, cronExpression, nextDate, isActive, description]
    );
    
    res.status(201).send(rows[0]);
  } catch (err) {
    console.error('Error creating recurring payment:', err);
    res.status(500).send({ message: 'Failed to create recurring payment', error: err.message });
  }
});

app.put('/api/recurring-payments/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, amount, category, frequency, cronExpression, nextDate, isActive, description } = req.body;
    
    const { rows } = await db.query(
      `UPDATE recurring_payments
       SET name = $1, amount = $2, category = $3, frequency = $4, cron_expression = $5, next_date = $6, is_active = $7, description = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, amount, category, frequency, cronExpression, nextDate, isActive, description, id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Recurring payment not found' });
    }
    
    res.status(200).send(rows[0]);
  } catch (err) {
    console.error('Error updating recurring payment:', err);
    res.status(500).send({ message: 'Failed to update recurring payment', error: err.message });
  }
});

app.delete('/api/recurring-payments/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const { rowCount } = await db.query(
      'DELETE FROM recurring_payments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (rowCount === 0) {
      return res.status(404).send({ message: 'Recurring payment not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting recurring payment:', err);
    res.status(500).send({ message: 'Failed to delete recurring payment', error: err.message });
  }
});

// A simple test route to check DB connection
app.get('/api/db-test', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.status(200).send({ message: 'Database connection successful!', time: rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send({ message: 'Database connection failed.', error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
