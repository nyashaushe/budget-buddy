import { query } from '../config/db.js';

class Budget {
  // Get all budgets for a user
  static async getAllByUser(userId) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1
         ORDER BY b.year DESC, b.month DESC`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Budget.getAllByUser:', err.message);
      throw err;
    }
  }

  // Get budgets for a specific month
  static async getAllByUserAndMonth(userId, month, year) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
         ORDER BY b.amount DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Budget.getAllByUserAndMonth:', err.message);
      throw err;
    }
  }

  // Get budget by ID
  static async getById(id, userId) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.id = $1 AND b.user_id = $2`,
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Budget.getById:', err.message);
      throw err;
    }
  }

  // Get budget by category for a specific month
  static async getByCategory(userId, categoryId, month, year) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.category_id = $2 AND b.month = $3 AND b.year = $4`,
        [userId, categoryId, month, year]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Budget.getByCategory:', err.message);
      throw err;
    }
  }

  // Create a new budget
  static async create(budgetData) {
    const { amount, category_id, user_id, month, year } = budgetData;
    
    try {
      // Check if a budget already exists for this category, month, and year
      const existingBudget = await query(
        'SELECT * FROM budgets WHERE category_id = $1 AND month = $2 AND year = $3 AND user_id = $4',
        [category_id, month, year, user_id]
      );
      
      if (existingBudget.rows.length > 0) {
        throw new Error('Budget already exists for this category and period');
      }
      
      const result = await query(
        `INSERT INTO budgets (amount, category_id, user_id, month, year)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [amount, category_id, user_id, month, year]
      );
      
      return result.rows[0].id;
    } catch (err) {
      console.error('Error in Budget.create:', err.message);
      throw err;
    }
  }

  // Update a budget
  static async update(id, budgetData) {
    const { amount, category_id, user_id, month, year } = budgetData;
    
    try {
      // Check if a budget already exists for this category, month, and year (excluding this one)
      const existingBudget = await query(
        'SELECT * FROM budgets WHERE category_id = $1 AND month = $2 AND year = $3 AND user_id = $4 AND id != $5',
        [category_id, month, year, user_id, id]
      );
      
      if (existingBudget.rows.length > 0) {
        throw new Error('Budget already exists for this category and period');
      }
      
      const result = await query(
        `UPDATE budgets
         SET amount = $1, category_id = $2, month = $3, year = $4
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [amount, category_id, month, year, id, user_id]
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
      console.error('Error in Budget.update:', err.message);
      throw err;
    }
  }

  // Delete a budget
  static async delete(id, userId) {
    try {
      const result = await query(
        'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Budget.delete:', err.message);
      throw err;
    }
  }

  // Get budget vs actual spending
  static async getBudgetVsActual(userId, month, year) {
    try {
      const result = await query(
        `SELECT 
          c.id as category_id,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          b.amount as budget_amount,
          COALESCE(SUM(e.amount), 0) as actual_amount,
          CASE 
            WHEN COALESCE(SUM(e.amount), 0) > b.amount THEN true 
            ELSE false 
          END as is_over_budget,
          CASE 
            WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(e.amount), 0) / b.amount) * 100, 2)
            ELSE 0
          END as percentage_used
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN expenses e ON 
          b.category_id = e.category_id AND 
          e.user_id = $1 AND 
          EXTRACT(MONTH FROM e.date) = $2 AND 
          EXTRACT(YEAR FROM e.date) = $3
        WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
        GROUP BY c.id, c.name, c.icon, c.color, b.amount
        ORDER BY percentage_used DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Budget.getBudgetVsActual:', err.message);
      throw err;
    }
  }

  // Get budgets by month and year
  static async getByMonth(userId, month, year) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
         ORDER BY b.amount DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Budget.getByMonth:', err.message);
      throw err;
    }
  }

  // Get budget summary with spending for a month
  static async getSummaryByMonth(userId, month, year) {
    try {
      const result = await query(
        `SELECT 
          b.id, 
          b.amount as budget_amount, 
          b.category_id,
          c.name as category_name, 
          c.icon as category_icon,
          c.color as category_color,
          COALESCE(SUM(e.amount), 0) as spent_amount
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         LEFT JOIN expenses e ON 
           b.category_id = e.category_id AND 
           b.user_id = e.user_id AND 
           EXTRACT(MONTH FROM e.date) = b.month AND 
           EXTRACT(YEAR FROM e.date) = b.year
         WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
         GROUP BY b.id, b.amount, b.category_id, c.name, c.icon, c.color
         ORDER BY b.amount DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Budget.getSummaryByMonth:', err.message);
      throw err;
    }
  }
}

export default Budget; 