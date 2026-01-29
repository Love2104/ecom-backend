import { query } from '../config/db';
import bcrypt from 'bcryptjs';

export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'SUPPLIER' | 'BUYER';
export type SupplierStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
  otp_code?: string;
  otp_expires_at?: Date;
  supplier_status?: SupplierStatus;
  business_name?: string;
  gst_number?: string;
  manager_key_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  is_verified?: boolean;
  otp_code?: string;
  otp_expires_at?: Date;
  supplier_status?: SupplierStatus;
  business_name?: string;
  gst_number?: string;
  manager_key_id?: string;
}

export class UserModel {
  // Create a new user
  static async create(userData: UserInput): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const result = await query(
      `INSERT INTO users (
        email, password_hash, name, role, is_verified, 
        otp_code, otp_expires_at, 
        supplier_status, business_name, gst_number, 
        manager_key_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        userData.email,
        hashedPassword,
        userData.name,
        userData.role || 'BUYER',
        userData.is_verified || false,
        userData.otp_code || null,
        userData.otp_expires_at || null,
        userData.supplier_status || 'NONE',
        userData.business_name || null,
        userData.gst_number || null,
        userData.manager_key_id || null
      ]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async getSupplierRequests(): Promise<User[]> {
    const result = await query(
      "SELECT id, name, email, business_name, gst_number, supplier_status, created_at FROM users WHERE supplier_status = 'PENDING' ORDER BY created_at DESC"
    );
    return result.rows;
  }

  static async updateSupplierStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<User | null> {
    const role = status === 'APPROVED' ? 'SUPPLIER' : 'BUYER';
    const result = await query(
      "UPDATE users SET supplier_status = $1, role = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [status, role, id]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, userData: Partial<UserInput>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Standard fields
    if (userData.name) { fields.push(`name = $${valueIndex++}`); values.push(userData.name); }
    if (userData.email) { fields.push(`email = $${valueIndex++}`); values.push(userData.email); }
    if (userData.role) { fields.push(`role = $${valueIndex++}`); values.push(userData.role); }

    // Auth fields
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      fields.push(`password_hash = $${valueIndex++}`);
      values.push(hashedPassword);
    }
    if (userData.is_verified !== undefined) { fields.push(`is_verified = $${valueIndex++}`); values.push(userData.is_verified); }
    if (userData.otp_code !== undefined) { fields.push(`otp_code = $${valueIndex++}`); values.push(userData.otp_code); }
    if (userData.otp_expires_at !== undefined) { fields.push(`otp_expires_at = $${valueIndex++}`); values.push(userData.otp_expires_at); }

    // Supplier fields
    if (userData.supplier_status) { fields.push(`supplier_status = $${valueIndex++}`); values.push(userData.supplier_status); }
    if (userData.business_name) { fields.push(`business_name = $${valueIndex++}`); values.push(userData.business_name); }
    if (userData.gst_number) { fields.push(`gst_number = $${valueIndex++}`); values.push(userData.gst_number); }

    if (fields.length === 0) return null;

    values.push(id);
    const queryText = `UPDATE users SET ${fields.join(', ')} WHERE id = $${valueIndex} RETURNING *`;

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  static async findAll(role?: string): Promise<User[]> {
    let sql = 'SELECT id, name, email, role, is_verified, supplier_status, created_at, business_name FROM users';
    const params: any[] = [];

    if (role) {
      sql += ' WHERE role = $1';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}