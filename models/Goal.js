import { query } from '../config/db.js';

class Goal {
  // Get all goals for a user
  static async getAllByUser(userId) {
    try {
      const result = await query(
        `SELECT g.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM goals g
         LEFT JOIN categories c ON g.category_id = c.id
         WHERE g.user_id = $1
         ORDER BY g.is_completed, g.target_date`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Goal.getAllByUser:', err.message);
      throw err;
    }
  }

  // Get a goal by ID
  static async getById(id, userId) {
    try {
      const result = await query(
        `SELECT g.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM goals g
         LEFT JOIN categories c ON g.category_id = c.id
         WHERE g.id = $1 AND g.user_id = $2`,
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Goal.getById:', err.message);
      throw err;
    }
  }

  // Create a new goal
  static async create(goalData) {
    const { name, target_amount, current_amount, target_date, category_id, user_id } = goalData;
    
    try {
      const result = await query(
        `INSERT INTO goals (name, target_amount, current_amount, target_date, category_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, target_amount, current_amount || 0, target_date, category_id, user_id]
      );
      return result.rows[0].id;
    } catch (err) {
      console.error('Error in Goal.create:', err.message);
      throw err;
    }
  }

  // Update a goal
  static async update(id, goalData) {
    const { name, target_amount, current_amount, target_date, category_id, is_completed, user_id } = goalData;
    
    try {
      const result = await query(
        `UPDATE goals
         SET name = $1, target_amount = $2, current_amount = $3, target_date = $4, 
             category_id = $5, is_completed = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [name, target_amount, current_amount, target_date, category_id, is_completed, id, user_id]
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
      console.error('Error in Goal.update:', err.message);
      throw err;
    }
  }

  // Delete a goal
  static async delete(id, userId) {
    try {
      const result = await query(
        'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Goal.delete:', err.message);
      throw err;
    }
  }

  // Update goal progress
  static async updateProgress(id, amount, userId) {
    try {
      // Get the current goal
      const goalResult = await query(
        'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (goalResult.rows.length === 0) {
        return null;
      }
      
      const goal = goalResult.rows[0];
      const newAmount = parseFloat(goal.current_amount) + parseFloat(amount);
      const isCompleted = newAmount >= goal.target_amount;
      
      // Update the goal
      const result = await query(
        'UPDATE goals SET current_amount = $1, is_completed = $2 WHERE id = $3 RETURNING *',
        [newAmount, isCompleted, id]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Error in Goal.updateProgress:', err.message);
      throw err;
    }
  }

  // Get goal progress summary
  static async getProgressSummary(userId) {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals,
          SUM(target_amount) as total_target_amount,
          SUM(current_amount) as total_current_amount,
          CASE 
            WHEN SUM(target_amount) > 0 
            THEN ROUND((SUM(current_amount) / SUM(target_amount)) * 100, 2)
            ELSE 0
          END as overall_progress
        FROM goals
        WHERE user_id = $1`,
        [userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Goal.getProgressSummary:', err.message);
      throw err;
    }
  }

  // Get active goals
  static async getActive(userId) {
    try {
      const result = await query(
        `SELECT g.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM goals g
         LEFT JOIN categories c ON g.category_id = c.id
         WHERE g.user_id = $1 AND g.is_completed = false
         ORDER BY g.target_date`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Goal.getActive:', err.message);
      throw err;
    }
  }

  // Get completed goals
  static async getCompleted(userId) {
    try {
      const result = await query(
        `SELECT g.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM goals g
         LEFT JOIN categories c ON g.category_id = c.id
         WHERE g.user_id = $1 AND g.is_completed = true
         ORDER BY g.target_date DESC`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Goal.getCompleted:', err.message);
      throw err;
    }
  }
}

export default Goal; 