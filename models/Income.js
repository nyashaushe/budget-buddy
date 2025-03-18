import { query } from '../config/db.js';
import { ApiError } from '../utils/errorHandler.js';

class Income {
  // Create a new income entry
  static async create(userId, incomeData) {
    const { source, amount, frequency, description, date, category_id } = incomeData;

    try {
      const result = await query(
        `INSERT INTO income (user_id, source, amount, frequency, description, date, category_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [userId, source, amount, frequency, description || null, date, category_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating income:', error);
      throw new ApiError('Failed to create income record', 500);
    }
  }

  // Get all income entries for a user
  static async findAllByUser(userId) {
    try {
      const result = await query(
        `SELECT i.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM income i
         LEFT JOIN categories c ON i.category_id = c.id
         WHERE i.user_id = $1 
         ORDER BY i.date DESC, i.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching income records:', error);
      throw new ApiError('Failed to fetch income records', 500);
    }
  }

  // Get a single income entry by ID
  static async findById(id, userId) {
    try {
      const result = await query(
        `SELECT i.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM income i
         LEFT JOIN categories c ON i.category_id = c.id
         WHERE i.id = $1 AND i.user_id = $2`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('Income record not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error fetching income record:', error);
      throw new ApiError('Failed to fetch income record', 500);
    }
  }

  // Update an income entry
  static async update(id, userId, updateData) {
    const { source, amount, frequency, description, date, category_id } = updateData;

    try {
      // First ensure the income exists and belongs to this user
      await this.findById(id, userId);

      const result = await query(
        `UPDATE income 
         SET source = $1, 
             amount = $2, 
             frequency = $3, 
             description = $4,
             date = $5,
             category_id = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [source, amount, frequency, description || null, date, category_id, id, userId]
      );

      // Get the category details
      let category = null;
      if (category_id) {
        const categoryResult = await query(
          'SELECT name, icon, color FROM categories WHERE id = $1',
          [category_id]
        );
        
        if (categoryResult.rows.length > 0) {
          category = categoryResult.rows[0];
        }
      }
      
      return {
        ...result.rows[0],
        category_name: category ? category.name : null,
        category_icon: category ? category.icon : null,
        category_color: category ? category.color : null
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error updating income record:', error);
      throw new ApiError('Failed to update income record', 500);
    }
  }

  // Delete an income entry
  static async delete(id, userId) {
    try {
      // First ensure the income exists and belongs to this user
      await this.findById(id, userId);

      const result = await query(
        `DELETE FROM income 
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error deleting income record:', error);
      throw new ApiError('Failed to delete income record', 500);
    }
  }

  // Get income by month
  static async getByMonth(userId, month, year) {
    try {
      const result = await query(
        `SELECT i.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM income i
         LEFT JOIN categories c ON i.category_id = c.id
         WHERE i.user_id = $1
           AND EXTRACT(MONTH FROM i.date) = $2
           AND EXTRACT(YEAR FROM i.date) = $3
         ORDER BY i.date DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Income.getByMonth:', err.message);
      throw err;
    }
  }
}

export default Income;
