import { query } from '../config/db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export class UserModel {
  // Create a new user
  static async create(userData: UserInput): Promise<UserOutput> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`,
      [userData.name, userData.email, hashedPassword, userData.role || 'user']
    );

    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<UserOutput | null> {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Update user
  static async update(id: string, userData: Partial<UserInput>): Promise<UserOutput | null> {
    // Start building the query
    let updateQuery = 'UPDATE users SET ';
    const values: any[] = [];
    let valueIndex = 1;

    // Add fields to update
    if (userData.name) {
      updateQuery += `name = $${valueIndex}, `;
      values.push(userData.name);
      valueIndex++;
    }

    if (userData.email) {
      updateQuery += `email = $${valueIndex}, `;
      values.push(userData.email);
      valueIndex++;
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      updateQuery += `password = $${valueIndex}, `;
      values.push(hashedPassword);
      valueIndex++;
    }

    // Add updated_at
    updateQuery += `updated_at = NOW() WHERE id = $${valueIndex} RETURNING id, name, email, role, created_at`;
    values.push(id);

    const result = await query(updateQuery, values);
    return result.rows[0] || null;
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}