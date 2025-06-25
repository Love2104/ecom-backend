import { query } from '../config/db';

export interface Product {
  id: string;
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
  name: string;
  description: string;
  price: number;
  original_price?: number;
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
  }
}
