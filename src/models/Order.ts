import { query } from '../config/db';
import { ProductModel } from './Product';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  supplier_id: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  shipping_address: any; // JSONB
  items?: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderInput {
  user_id: string;
  shipping_address: any;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export class OrderModel {
  static async create(orderData: OrderInput): Promise<Order> {
    await query('BEGIN');
    try {
      let total = 0;
      const orderItemsToInsert: any[] = [];

      // 1. Validate products and calculate total
      for (const item of orderData.items) {
        const product = await ProductModel.findById(item.product_id);

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const price = Number(product.price);
        total += price * item.quantity;

        orderItemsToInsert.push({
          product_id: product.id,
          quantity: item.quantity,
          price_at_purchase: price,
          supplier_id: product.supplier_id
        });
      }

      // 2. Insert Order
      const orderResult = await query(
        `INSERT INTO orders (user_id, total, status, shipping_address) 
         VALUES ($1, $2, 'PENDING', $3) 
         RETURNING *`,
        [orderData.user_id, total, JSON.stringify(orderData.shipping_address)]
      );

      const order = orderResult.rows[0];

      // 3. Insert Order Items
      for (const item of orderItemsToInsert) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, supplier_id) 
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.price_at_purchase, item.supplier_id]
        );

        // 4. Update Stock

        await query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await query('COMMIT');
      return await OrderModel.findById(order.id) as Order;

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async findById(id: string): Promise<Order | null> {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) return null;
    const order = orderResult.rows[0];

    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    );
    order.items = itemsResult.rows;

    return order;
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price_at_purchase,
            'supplier_id', oi.supplier_id,
            'product_name', p.name
          )
        ) FILTER (WHERE oi.id IS NOT NULL), 
        '[]'
      ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async findBySupplierId(supplierId: string): Promise<Order[]> {
    const sql = `
      SELECT o.*, u.name as customer_name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price_at_purchase,
            'supplier_id', oi.supplier_id,
            'product_name', p.name
          )
        ) FILTER (WHERE oi.id IS NOT NULL), 
        '[]'
      ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.supplier_id = $1
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `;
    const result = await query(sql, [supplierId]);
    return result.rows;
  }

  static async findAll(): Promise<Order[]> {
    const sql = `
      SELECT o.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price_at_purchase,
            'supplier_id', oi.supplier_id,
            'product_name', p.name
          )
        ) FILTER (WHERE oi.id IS NOT NULL), 
        '[]'
      ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  static async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async isSupplierOfOrder(orderId: string, supplierId: string): Promise<boolean> {
    const result = await query(
      "SELECT 1 FROM order_items WHERE order_id = $1 AND supplier_id = $2 LIMIT 1",
      [orderId, supplierId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

