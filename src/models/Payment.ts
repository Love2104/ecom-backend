import { query } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'card' | 'upi';
  status: PaymentStatus;
  payment_reference: string;
  payment_details: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaymentInput {
  order_id: string;
  amount: number;
  method: 'card' | 'upi';
  payment_details?: any;
}

export class PaymentModel {
  // ✅ Create a new payment record
  static async create(paymentData: PaymentInput): Promise<Payment> {
    const paymentReference = `PAY-${uuidv4().slice(0, 8)}`;

    const result = await query(
      `
      INSERT INTO payments (order_id, amount, method, status, payment_reference, payment_details)
      VALUES ($1, $2::numeric, $3, $4, $5, $6::jsonb)
      RETURNING *
      `,
      [
        paymentData.order_id,
        paymentData.amount,
        paymentData.method,
        'pending',
        paymentReference,
        paymentData.payment_details ? JSON.stringify(paymentData.payment_details) : '{}'
      ]
    );

    return result.rows[0];
  }

  // ✅ Find payment by internal ID
  static async findById(id: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // ✅ Find payment by order ID
  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return result.rows[0] || null;
  }

  // ✅ Find by payment reference (for UPI or Razorpay)
  static async findByReference(reference: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE payment_reference = $1', [reference]);
    return result.rows[0] || null;
  }

  // ✅ Find by Razorpay order ID (inside payment_details JSONB)
  static async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    const result = await query(
      `SELECT * FROM payments WHERE payment_details->>'razorpay_order_id' = $1`,
      [razorpayOrderId]
    );
    return result.rows[0] || null;
  }

  // ✅ Update Razorpay order ID (stored inside JSONB)
  static async updateRazorpayOrderId(id: string, razorpayOrderId: string): Promise<Payment | null> {
   const result = await query(
  `
    UPDATE payments
    SET payment_details = COALESCE(payment_details, '{}'::jsonb) || jsonb_build_object('razorpay_order_id', $2::text),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  [id, razorpayOrderId]
);

    return result.rows[0] || null;
  }

  // ✅ Update payment status and merge additional details into JSONB
  static async updateStatus(
    id: string,
    status: PaymentStatus,
    details?: any
  ): Promise<Payment | null> {
    const result = await query(
      `
      UPDATE payments
      SET status = $1,
          payment_details = COALESCE(payment_details, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [status, details ? JSON.stringify(details) : '{}', id]
    );

    return result.rows[0] || null;
  }
}
