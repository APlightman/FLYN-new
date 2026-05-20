const db = require('../db');

class GoalService {
  async getAllByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM goals WHERE user_id = $1',
      [userId]
    );
    return rows;
  }

  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  async create(userId, goalData) {
    const { name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description } = goalData;
    
    const { rows } = await db.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description]
    );
    return rows[0];
  }

  async update(id, userId, updates) {
    const { name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description } = updates;
    
    const { rows } = await db.query(
      `UPDATE goals
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, 
           monthly_contribution = $5, priority = $6, description = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, targetAmount, currentAmount, deadline, monthlyContribution, priority, description, id, userId]
    );

    return rows[0] || null;
  }

  async delete(id, userId) {
    const { rowCount } = await db.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  }
}

module.exports = new GoalService();
