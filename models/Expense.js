import { query } from '../config/db.js';

class Expense {
  // Get all expenses for a user
  static async getAllByUser(userId) {
    try {
      const result = await query(
        `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
         ORDER BY e.date DESC`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Expense.getAllByUser:', err.message);
      throw err;
    }
  }

  // Get expense by ID
  static async getById(id, userId) {
    try {
      const result = await query(
        `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.id = $1 AND e.user_id = $2`,
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Expense.getById:', err.message);
      throw err;
    }
  }

  // Create a new expense
  static async create(expenseData) {
    const { amount, description, date, category_id, user_id } = expenseData;
    
    try {
      const result = await query(
        `INSERT INTO expenses (amount, description, date, category_id, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [amount, description, date, category_id, user_id]
      );
      return result.rows[0].id;
    } catch (err) {
      console.error('Error in Expense.create:', err.message);
      throw err;
    }
  }

  // Update an expense
  static async update(id, expenseData) {
    const { amount, description, date, category_id, user_id } = expenseData;
    
    try {
      const result = await query(
        `UPDATE expenses
         SET amount = $1, description = $2, date = $3, category_id = $4
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [amount, description, date, category_id, id, user_id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
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
    } catch (err) {
      console.error('Error in Expense.update:', err.message);
      throw err;
    }
  }

  // Delete an expense
  static async delete(id, userId) {
    try {
      const result = await query(
        'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Expense.delete:', err.message);
      throw err;
    }
  }

  // Get expense summary by category
  static async getSummaryByCategory(userId, month, year) {
    try {
      const result = await query(
        `SELECT 
          c.id as category_id, 
          c.name as category_name, 
          c.icon as category_icon,
          c.color as category_color,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count
         FROM expenses e
         JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
           AND EXTRACT(MONTH FROM e.date) = $2
           AND EXTRACT(YEAR FROM e.date) = $3
         GROUP BY c.id, c.name, c.icon, c.color
         ORDER BY total_amount DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Expense.getSummaryByCategory:', err.message);
      throw err;
    }
  }

  // Get expenses by month
  static async getByMonth(userId, month, year) {
    try {
      const result = await query(
        `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
           AND EXTRACT(MONTH FROM e.date) = $2
           AND EXTRACT(YEAR FROM e.date) = $3
         ORDER BY e.date DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Expense.getByMonth:', err.message);
      throw err;
    }
  }
}

export default Expense; 