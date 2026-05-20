const db = require('../db');

class CategoryService {
  async getAllByUserId(userId) {
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    return rows;
  }

  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  async create(userId, categoryData) {
    const { name, type, color, parent, budget } = categoryData;
    
    const { rows } = await db.query(
      `INSERT INTO categories (user_id, name, type, color, parent, budget)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, type, color || '#000000', parent, budget]
    );
    return rows[0];
  }

  async update(id, userId, updates) {
    const allowedFields = ['name', 'type', 'color', 'parent', 'budget'];
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
      `UPDATE categories
       SET ${updatePairs.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  }

  async delete(id, userId) {
    // Check if category has associated transactions
    const { rowCount: transactionCount } = await db.query(
      'SELECT COUNT(*) FROM transactions WHERE category = (SELECT name FROM categories WHERE id = $1 AND user_id = $2)',
      [id, userId]
    );
    
    if (parseInt(transactionCount) > 0) {
      throw new Error('Cannot delete category with associated transactions');
    }

    const { rowCount } = await db.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return rowCount > 0;
  }
}

module.exports = new CategoryService();
