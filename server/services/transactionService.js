const db = require('../db');

class TransactionService {
  async getAllByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return rows;
  }

  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  async create(userId, transactionData) {
    const { type, amount, category, description, date, tags } = transactionData;
    const transactionDate = date || new Date().toISOString();
    
    const { rows } = await db.query(
      `INSERT INTO transactions (user_id, type, amount, category, description, date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, type, amount, category, description, transactionDate, tags]
    );
    return rows[0];
  }

  async update(id, userId, updates) {
    const allowedFields = ['type', 'amount', 'category', 'description', 'date', 'tags'];
    const fieldsToUpdate = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate[field] = updates[field];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return null;
    }

    const updatePairs = [];
    const values = [];
    let paramIndex = 1;

    for (const [field, value] of Object.entries(fieldsToUpdate)) {
      updatePairs.push(`${field} = $${paramIndex++}`);
      values.push(value);
    }

    values.push(id, userId);

    const { rows } = await db.query(
      `UPDATE transactions
       SET ${updatePairs.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  }

  async delete(id, userId) {
    const { rowCount } = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  }
}

module.exports = new TransactionService();
