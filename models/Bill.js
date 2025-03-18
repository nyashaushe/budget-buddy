import { query } from '../config/db.js';

class Bill {
  // Get all bills for a user
  static async getAllByUser(userId) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM bills b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1
         ORDER BY b.due_date`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Bill.getAllByUser:', err.message);
      throw err;
    }
  }

  // Get bill by ID
  static async getById(id, userId) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM bills b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.id = $1 AND b.user_id = $2`,
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Bill.getById:', err.message);
      throw err;
    }
  }

  // Create a new bill
  static async create(billData) {
    const { name, amount, due_date, category_id, user_id, is_recurring, is_paid } = billData;
    
    try {
      const result = await query(
        `INSERT INTO bills (name, amount, due_date, category_id, user_id, is_recurring, is_paid)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [name, amount, due_date, category_id, user_id, is_recurring, is_paid || false]
      );
      return result.rows[0].id;
    } catch (err) {
      console.error('Error in Bill.create:', err.message);
      throw err;
    }
  }

  // Update a bill
  static async update(id, billData) {
    const { name, amount, due_date, category_id, user_id, is_recurring, is_paid } = billData;
    
    try {
      const result = await query(
        `UPDATE bills
         SET name = $1, amount = $2, due_date = $3, category_id = $4, is_recurring = $5, is_paid = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [name, amount, due_date, category_id, is_recurring, is_paid, id, user_id]
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
      console.error('Error in Bill.update:', err.message);
      throw err;
    }
  }

  // Mark a bill as paid
  static async markAsPaid(id, userId) {
    try {
      const result = await query(
        'UPDATE bills SET is_paid = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      console.error('Error in Bill.markAsPaid:', err.message);
      throw err;
    }
  }

  // Mark a bill as unpaid
  static async markAsUnpaid(id, userId) {
    try {
      const result = await query(
        'UPDATE bills SET is_paid = false WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      console.error('Error in Bill.markAsUnpaid:', err.message);
      throw err;
    }
  }

  // Delete a bill
  static async delete(id, userId) {
    try {
      const result = await query(
        'DELETE FROM bills WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in Bill.delete:', err.message);
      throw err;
    }
  }

  // Get upcoming bills
  static async getUpcoming(userId) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM bills b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.is_paid = false
         ORDER BY b.due_date`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Bill.getUpcoming:', err.message);
      throw err;
    }
  }

  // Get bills due this month
  static async getDueThisMonth(userId) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM bills b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.is_paid = false AND b.due_date <= $2
         ORDER BY b.due_date`,
        [userId, currentMonth]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Bill.getDueThisMonth:', err.message);
      throw err;
    }
  }

  // Get bills by month
  static async getByMonth(userId, month) {
    try {
      const result = await query(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM bills b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.user_id = $1 AND b.due_date = $2
         ORDER BY b.name`,
        [userId, month]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Bill.getByMonth:', err.message);
      throw err;
    }
  }

  // Reset recurring bills for a new month
  static async resetRecurringBills(userId) {
    try {
      const result = await query(
        'UPDATE bills SET is_paid = false WHERE user_id = $1 AND is_recurring = true RETURNING *',
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error in Bill.resetRecurringBills:', err.message);
      throw err;
    }
  }
}

export default Bill; 