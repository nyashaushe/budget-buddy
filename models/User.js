import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
  // Get user by ID
  static async getById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in User.getById:', err.message);
      throw err;
    }
  }

  // Get user by email
  static async getByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in User.getByEmail:', err.message);
      throw err;
    }
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password } = userData;
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const result = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );
      return result.rows[0].id;
    } catch (err) {
      console.error('Error in User.create:', err.message);
      throw err;
    }
  }

  // Update user
  static async update(id, userData) {
    const { name, email } = userData;
    
    try {
      const result = await query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in User.update:', err.message);
      throw err;
    }
  }

  // Update password
  static async updatePassword(id, password) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      return true;
    } catch (err) {
      console.error('Error in User.updatePassword:', err.message);
      throw err;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      await query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error in User.delete:', err.message);
      throw err;
    }
  }
}

export default User; 