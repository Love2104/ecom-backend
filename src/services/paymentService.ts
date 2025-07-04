import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModel, Payment } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';
import razorpay from '../config/razorpay';
import { createHmac } from 'crypto'; // ✅ FIXED

export class PaymentService {
  // ✅ Create Razorpay payment order (real)
  static async createRazorpayPaymentIntent(orderId: string, userId: string): Promise<{
    order: any;
    payment: Payment;
  }> {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId) throw new AppError('Not authorized', 403);

    const existingPayment = await PaymentModel.findByOrderId(orderId);
    if (existingPayment) throw new AppError('Payment already exists', 400);

    // Create payment record in DB
    const payment = await PaymentModel.create({
      order_id: orderId,
      amount: order.total,
      method: 'card', // Default to card for Razorpay
      payment_details: {}
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${uuidv4().substring(0, 8)}`,
      payment_capture: true,
    });

    // Update payment with Razorpay order ID
    await PaymentModel.updateRazorpayOrderId(payment.id, razorpayOrder.id);

    return { order: razorpayOrder, payment };
  }

  // ❌ (optional) UPI QR-based manual fallback (not used in Razorpay flow, but kept for custom)
  static async generateUpiQr(payment: Payment, amount: number): Promise<{
    qrCode: string;
    reference: string;
    upiId: string;
  }> {
    const upiId = process.env.UPI_ID || '7240172161@ybl';
    const merchantName = process.env.UPI_MERCHANT_NAME || 'ShopEase';

    const upiUri = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tr=${payment.payment_reference}`;
    const qrCode = await QRCode.toDataURL(upiUri);

    return {
      qrCode,
      reference: payment.payment_reference,
      upiId
    };
  }

  // ✅ Verify Razorpay payment signature
  static async verifyRazorpayPayment(
    razorpayOrderId: string, 
    razorpayPaymentId: string, 
    signature: string
  ): Promise<boolean> {
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    
    const expectedSignature = createHmac('sha256', secret)
  .update(body)
  .digest('hex');

    
    return expectedSignature === signature;
  }

  // ✅ Update payment after successful Razorpay callback
  static async confirmRazorpayPayment(
    razorpayOrderId: string, 
    razorpayPaymentId: string, 
    signature: string
  ): Promise<Payment> {
    const payment = await PaymentModel.findByRazorpayOrderId(razorpayOrderId);
    if (!payment) throw new AppError('Payment not found', 404);

    const isValid = await this.verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      signature
    );

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    const updated = await PaymentModel.updateStatus(payment.id, 'completed', {
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
    });

    if (!updated) throw new AppError('Failed to confirm payment', 500);

    await OrderModel.updateStatus(payment.order_id, 'processing');
    return updated;
  }

  // 🟢 Get payment status
  static async getPaymentStatus(paymentId: string, userId: string, isAdmin: boolean): Promise<Payment> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);

    const order = await OrderModel.findById(payment.order_id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId && !isAdmin) throw new AppError('Unauthorized', 403);

    return payment;
  }
}