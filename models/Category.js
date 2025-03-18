import { query } from '../config/db.js';

class Category {
  // Get all categories for a user (including default categories)
  static async getAllByUser(userId) {
    try {
      const result = await query(
        'SELECT * FROM categories WHERE user_id = $1 OR is_default = true ORDER BY name',
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Category.getAllByUser:', err.message);
      throw err;
    }
  }

  // Get category by ID
  static async getById(id, userId) {
    try {
      const result = await query(
        'SELECT * FROM categories WHERE id = $1 AND (user_id = $2 OR is_default = true)',
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Category.getById:', err.message);
      throw err;
    }
  }

  // Create a new category
  static async create(categoryData) {
    const { name, icon, color, user_id } = categoryData;
    
    try {
      const result = await query(
        'INSERT INTO categories (name, icon, color, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, icon, color, user_id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Category.create:', err.message);
      throw err;
    }
  }

  // Update a category
  static async update(id, categoryData) {
    const { name, icon, color, user_id } = categoryData;
    
    try {
      // Check if the category is a default one
      const categoryCheck = await query(
        'SELECT is_default FROM categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length > 0 && categoryCheck.rows[0].is_default) {
        throw new Error('Cannot update default category');
      }
      
      const result = await query(
        'UPDATE categories SET name = $1, icon = $2, color = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [name, icon, color, id, user_id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      console.error('Error in Category.update:', err.message);
      throw err;
    }
  }

  // Delete a category
  static async delete(id, userId) {
    try {
      // Check if the category is a default one
      const categoryCheck = await query(
        'SELECT is_default FROM categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length > 0 && categoryCheck.rows[0].is_default) {
        throw new Error('Cannot delete default category');
      }
      
      // Check if the category is being used by expenses
      const expenseCheck = await query(
        'SELECT COUNT(*) FROM expenses WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(expenseCheck.rows[0].count) > 0) {
        throw new Error('Category is being used by expenses');
      }
      
      // Check if the category is being used by budgets
      const budgetCheck = await query(
        'SELECT COUNT(*) FROM budgets WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(budgetCheck.rows[0].count) > 0) {
        throw new Error('Category is being used by budgets');
      }
      
      const result = await query(
        'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Error in Category.delete:', err.message);
      throw err;
    }
  }

  // Get categories with expense totals
  static async getWithExpenseTotals(userId, year, month) {
    try {
      let query = `
        SELECT 
          c.id, c.name, c.icon, c.color, c.is_default,
          COALESCE(SUM(e.amount), 0) as total_amount,
          COUNT(e.id) as transaction_count
        FROM categories c
        LEFT JOIN expenses e ON 
          c.id = e.category_id AND 
          e.user_id = $1
      `;
      
      const queryParams = [userId];
      
      // Add date filtering if year and month are provided
      if (year && month) {
        query += ` AND EXTRACT(YEAR FROM e.date) = $2 
                   AND EXTRACT(MONTH FROM e.date) = $3`;
        queryParams.push(year, month);
      }
      
      query += `
        WHERE c.user_id = $1 OR c.is_default = true
        GROUP BY c.id
        ORDER BY total_amount DESC
      `;
      
      const result = await query(query, queryParams);
      return result.rows;
    } catch (err) {
      console.error('Error in Category.getWithExpenseTotals:', err.message);
      throw err;
    }
  }

  // Create default categories for a new user
  static async createDefaults(userId) {
    try {
      const defaultCategories = [
        { name: 'Food & Dining', icon: 'restaurant', color: '#FF5722' },
        { name: 'Transportation', icon: 'directions_car', color: '#2196F3' },
        { name: 'Housing', icon: 'home', color: '#4CAF50' },
        { name: 'Entertainment', icon: 'movie', color: '#9C27B0' },
        { name: 'Shopping', icon: 'shopping_cart', color: '#F44336' },
        { name: 'Utilities', icon: 'power', color: '#FFC107' },
        { name: 'Health', icon: 'local_hospital', color: '#00BCD4' },
        { name: 'Travel', icon: 'flight', color: '#3F51B5' },
        { name: 'Education', icon: 'school', color: '#795548' },
        { name: 'Other', icon: 'more_horiz', color: '#607D8B' }
      ];
      
      for (const category of defaultCategories) {
        await query(
          'INSERT INTO categories (name, icon, color, user_id, is_default) VALUES ($1, $2, $3, $4, $5)',
          [category.name, category.icon, category.color, userId, true]
        );
      }
      
      return true;
    } catch (err) {
      console.error('Error in Category.createDefaults:', err.message);
      throw err;
    }
  }
}

export default Category; 