import { query } from '../config/db';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentInput {
  order_id: string;
  amount: number;
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
      RETURNING *
      `,
      [
        paymentData.order_id,
        paymentData.amount,
        paymentData.status || 'PENDING',
        paymentData.razorpay_order_id || null
      ]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const result = await query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return result.rows[0] || null;
  }

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
    return result.rows[0] || null;
  }
}
