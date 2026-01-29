import { query } from '../config/db';

export interface Product {
  id: string;
<<<<<<< HEAD
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  discount: number;
  rating: number;
  stock: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ProductInput {
=======
  supplier_id: string;
  category_id: string;
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  name: string;
  description: string;
  price: number;
  original_price?: number;
<<<<<<< HEAD
  image: string;
  category: string;
  discount?: number;
  stock: number;
  tags?: string[];
}

export class ProductModel {
  static async create(productData: ProductInput): Promise<Product> {
    const result = await query(
      `INSERT INTO products (name, description, price, original_price, image, category, discount, stock, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        productData.name,
        productData.description,
        productData.price,
        productData.original_price || null,
        productData.image,
        productData.category,
        productData.discount || 0,
        productData.stock,
        productData.tags || []
      ]
    );

    return result.rows[0];
  }

  static async findAll(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    let queryText = 'SELECT * FROM products';
    let countText = 'SELECT COUNT(*) FROM products';
    const filterParams: any[] = [];
    const conditions: string[] = [];
    let sortClause = '';
    let limitOffsetClause = '';

    if (filters) {
      if (filters.search) {
        filterParams.push(`%${filters.search}%`);
        conditions.push(`(name ILIKE $${filterParams.length} OR description ILIKE $${filterParams.length})`);
      }

      if (filters.category) {
        filterParams.push(filters.category);
        conditions.push(`category = $${filterParams.length}`);
      }

      if (filters.minPrice !== undefined) {
        filterParams.push(filters.minPrice);
        conditions.push(`price >= $${filterParams.length}`);
      }

      if (filters.maxPrice !== undefined) {
        filterParams.push(filters.maxPrice);
        conditions.push(`price <= $${filterParams.length}`);
      }
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          sortClause = ' ORDER BY price ASC';
          break;
        case 'price-desc':
          sortClause = ' ORDER BY price DESC';
          break;
        case 'newest':
          sortClause = ' ORDER BY created_at DESC';
          break;
        case 'featured':
        default:
          sortClause = ' ORDER BY (rating * 10 + discount) DESC';
          break;
      }
    } else {
      sortClause = ' ORDER BY created_at DESC';
    }

    const paginationParams: any[] = [];
    if (filters?.limit !== undefined) {
      paginationParams.push(filters.limit);
      limitOffsetClause = ` LIMIT $${filterParams.length + paginationParams.length}`;
    }

    if (filters?.offset !== undefined) {
      paginationParams.push(filters.offset);
      limitOffsetClause += ` OFFSET $${filterParams.length + paginationParams.length}`;
    }

    queryText += whereClause + sortClause + limitOffsetClause;
    countText += whereClause;

    const [productsResult, countResult] = await Promise.all([
      query(queryText, [...filterParams, ...paginationParams]),
      query(countText, filterParams)
    ]);

    return {
      products: productsResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, productData: Partial<ProductInput>): Promise<Product | null> {
    let updateQuery = 'UPDATE products SET ';
    const values: any[] = [];
    let valueIndex = 1;

    for (const [key, value] of Object.entries(productData)) {
      if (value !== undefined) {
        updateQuery += `${key} = $${valueIndex}, `;
        values.push(value);
        valueIndex++;
      }
    }

    updateQuery += `updated_at = NOW() WHERE id = $${valueIndex} RETURNING *`;
    values.push(id);

    const result = await query(updateQuery, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  static async getFeatured(limit: number = 4): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products ORDER BY (rating * 10 + discount) DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async getNewArrivals(limit: number = 4): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async getOnSale(limit: number = 4): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products WHERE discount > 0 ORDER BY discount DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async getRelated(category: string, productId: string, limit: number = 4): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT $3',
      [category, productId, limit]
    );
    return result.rows;
=======
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
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  }
}
