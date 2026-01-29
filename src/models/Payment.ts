import { query } from '../config/db';
<<<<<<< HEAD
import { v4 as uuidv4 } from 'uuid';

export type PaymentStatus = 'pending' | 'completed' | 'failed';
=======

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
<<<<<<< HEAD
  method: 'card' | 'upi';
  status: PaymentStatus;
  payment_reference: string;
  payment_details: any;
  created_at?: Date;
  updated_at?: Date;
=======
  status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: Date;
  updated_at: Date;
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
}

export interface PaymentInput {
  order_id: string;
  amount: number;
<<<<<<< HEAD
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
=======
  status?: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export class PaymentModel {
  static async create(paymentData: PaymentInput): Promise<Payment> {
    const result = await query(
      `
      INSERT INTO payments (
        order_id, amount, status, razorpay_order_id
      )
      VALUES ($1, $2, $3, $4)
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
      RETURNING *
      `,
      [
        paymentData.order_id,
        paymentData.amount,
<<<<<<< HEAD
        paymentData.method,
        'pending',
        paymentReference,
        paymentData.payment_details ? JSON.stringify(paymentData.payment_details) : '{}'
=======
        paymentData.status || 'PENDING',
        paymentData.razorpay_order_id || null
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
      ]
    );

    return result.rows[0];
  }

<<<<<<< HEAD
  // ✅ Find payment by internal ID
=======
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  static async findById(id: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

<<<<<<< HEAD
  // ✅ Find payment by order ID
=======
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return result.rows[0] || null;
  }

<<<<<<< HEAD
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

=======
  static async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE razorpay_order_id = $1', [razorpayOrderId]);
    return result.rows[0] || null;
  }

  static async updateStatus(
    id: string,
    status: PaymentStatus,
    razorpayData?: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }
  ): Promise<Payment | null> {

    let updateQuery = 'UPDATE payments SET status = $1';
    const values: any[] = [status];
    let valueIndex = 2;

    if (razorpayData?.razorpay_order_id) {
      updateQuery += `, razorpay_order_id = $${valueIndex++}`;
      values.push(razorpayData.razorpay_order_id);
    }
    if (razorpayData?.razorpay_payment_id) {
      updateQuery += `, razorpay_payment_id = $${valueIndex++}`;
      values.push(razorpayData.razorpay_payment_id);
    }
    if (razorpayData?.razorpay_signature) {
      updateQuery += `, razorpay_signature = $${valueIndex++}`;
      values.push(razorpayData.razorpay_signature);
    }

    updateQuery += `, updated_at = NOW() WHERE id = $${valueIndex} RETURNING *`;
    values.push(id);

    const result = await query(updateQuery, values);
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    return result.rows[0] || null;
  }
}
