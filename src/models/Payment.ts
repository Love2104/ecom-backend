import { query } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'card' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  payment_reference: string;
  payment_details?: any;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentInput {
  order_id: string;
  amount: number;
  method: 'card' | 'upi';
  payment_details?: any;
}

export class PaymentModel {
  // Create a new payment
  static async create(paymentData: PaymentInput): Promise<Payment> {
    // Generate a unique payment reference
    const paymentReference = `PAY-${uuidv4().substring(0, 8)}-${Date.now().toString().substring(8)}`;

    const result = await query(
      `INSERT INTO payments (order_id, amount, method, status, payment_reference, payment_details) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        paymentData.order_id,
        paymentData.amount,
        paymentData.method,
        'pending',
        paymentReference,
        paymentData.payment_details || {}
      ]
    );

    return result.rows[0];
  }

  // Get payment by ID
  static async findById(id: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Get payment by order ID
  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return result.rows[0] || null;
  }

  // Get payment by reference
  static async findByReference(reference: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE payment_reference = $1', [reference]);
    return result.rows[0] || null;
  }

  // Update payment status
  static async updateStatus(
    id: string,
    status: 'pending' | 'completed' | 'failed',
    details?: any
  ): Promise<Payment | null> {
    const result = await query(
      `UPDATE payments SET 
       status = $1, 
       payment_details = COALESCE($2, payment_details), 
       updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, details, id]
    );

    return result.rows[0] || null;
  }
}