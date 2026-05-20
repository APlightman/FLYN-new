const db = require('../db');

class BudgetService {
  async getAllByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [userId]
    );
    return rows;
  }

  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  async create(userId, budgetData) {
    const { categoryId, amount, period, spent } = budgetData;
    
    const { rows } = await db.query(
      `INSERT INTO budgets (user_id, category_id, amount, period, spent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, categoryId, amount, period, spent]
    );
    return rows[0];
  }

  async update(id, userId, updates) {
    const { categoryId, amount, period, spent } = updates;
    
    const { rows } = await db.query(
      `UPDATE budgets
       SET category_id = $1, amount = $2, period = $3, spent = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [categoryId, amount, period, spent, id, userId]
    );

    return rows[0] || null;
  }

  async delete(id, userId) {
    const { rowCount } = await db.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  }
}

module.exports = new BudgetService();
