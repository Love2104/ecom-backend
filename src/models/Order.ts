import { query } from '../config/db';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone?: string;
  };
  payment_method: 'card' | 'upi';
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface OrderInput {
  user_id: string;
  items: OrderItemInput[];
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone?: string;
  };
  payment_method: 'card' | 'upi';
}

export class OrderModel {
  static async create(orderData: OrderInput): Promise<Order> {
    await query('BEGIN');
    try {
      let total = 0;
      const orderItems: OrderItem[] = [];
      for (const item of orderData.items) {
        const productResult = await query(
          'SELECT id, name, price FROM products WHERE id = $1',
          [item.product_id]
        );
        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        const product = productResult.rows[0];
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        orderItems.push({
          id: '',
          order_id: '',
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: item.quantity
        });
      }
      const orderResult = await query(
        `INSERT INTO orders (user_id, total, status, shipping_address, payment_method) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [orderData.user_id, total, 'pending', orderData.shipping_address, orderData.payment_method]
      );
      const order = orderResult.rows[0];
      for (const item of orderItems) {
        await query(
          `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.product_name, item.price, item.quantity]
        );
      }
      for (const item of orderData.items) {
        await query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
      await query('COMMIT');
      order.items = orderItems;
      return order;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async findById(id: string): Promise<Order | null> {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) return null;
    const order = orderResult.rows[0];
    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsResult.rows;
    return order;
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    const ordersResult = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsResult.rows;
    }
    return orders;
  }

  static async findAll(): Promise<Order[]> {
    const ordersResult = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsResult.rows;
    }
    return orders;
  }

  static async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<Order | null> {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
