import { query } from '../config/db';

export interface Product {
  id: string;
  supplier_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  images: string[];
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProductCreationParams {
  supplier_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  is_active?: boolean;
}

export class ProductModel {
  static async create(product: ProductCreationParams): Promise<Product> {
    const { supplier_id, category_id, name, description, price, stock, images, is_active } = product;

    // Check if category exists? Handled by FK constraint in DB, but good to know errors.

    const result = await query(
      `INSERT INTO products 
      (supplier_id, category_id, name, description, price, stock, images, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [supplier_id, category_id, name, description, price, stock, images, is_active ?? true]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1 AND is_deleted = false', [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters: { supplier_id?: string; category_id?: string; search?: string } = {}): Promise<any[]> {
    let sql = `
      SELECT p.*, u.name as supplier_name, u.business_name, c.name as category_name
      FROM products p 
      LEFT JOIN users u ON p.supplier_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_deleted = false
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters.supplier_id) {
      sql += ` AND p.supplier_id = $${idx++}`;
      params.push(filters.supplier_id);
    }
    if (filters.category_id) {
      sql += ` AND p.category_id = $${idx++}`;
      params.push(filters.category_id);
    }
    if (filters.search) {
      sql += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx})`;
      params.push(`%${filters.search}%`);
      idx++;
    }

    sql += ' ORDER BY p.created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      // Allow updating these fields
      if (['name', 'description', 'price', 'stock', 'images', 'is_active', 'category_id'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  static async findFeatured(limit: number = 8): Promise<any[]> {
    const sql = `
      SELECT p.*, u.name as supplier_name, c.name as category_name
      FROM products p 
      LEFT JOIN users u ON p.supplier_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.is_deleted = false
      ORDER BY p.price DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  static async findNewArrivals(limit: number = 8): Promise<any[]> {
    const sql = `
      SELECT p.*, u.name as supplier_name, c.name as category_name
      FROM products p 
      LEFT JOIN users u ON p.supplier_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.is_deleted = false
      ORDER BY p.created_at DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  static async findOnSale(limit: number = 8): Promise<any[]> {
    const sql = `
      SELECT p.*, u.name as supplier_name, c.name as category_name
      FROM products p 
      LEFT JOIN users u ON p.supplier_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.is_deleted = false AND p.original_price IS NOT NULL AND p.original_price > p.price
      ORDER BY (p.original_price - p.price) DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('UPDATE products SET is_deleted = true, is_active = false, updated_at = NOW() WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
