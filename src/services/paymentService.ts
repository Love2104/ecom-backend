import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModel, PaymentInput, Payment } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export class PaymentService {
  // Create a payment intent
  static async createPaymentIntent(
    orderId: string,
    method: 'card' | 'upi',
    userId: string
  ): Promise<{
    payment: Payment;
    upi?: {
      qrCode: string;
      reference: string;
      upiId: string;
    };
  }> {
    // Get the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if the order belongs to the user
    if (order.user_id !== userId) {
      throw new AppError('Not authorized to access this order', 403);
    }

    // Check if payment already exists for this order
    const existingPayment = await PaymentModel.findByOrderId(orderId);
    if (existingPayment) {
      throw new AppError('Payment already exists for this order', 400);
    }

    // Create payment
    const payment = await PaymentModel.create({
      order_id: orderId,
      amount: order.total,
      method,
      payment_details: {}
    });

    if (method === 'upi') {
      // Generate UPI payment data
      const upiData = {
        pa: 'merchant@upi', // Merchant UPI ID
        pn: 'ShopEase',
        am: order.total.toString(),
        cu: 'INR',
        tr: payment.payment_reference
      };

      // Convert to UPI URI
      const upiUri = `upi://pay?pa=${upiData.pa}&pn=${upiData.pn}&am=${upiData.am}&cu=${upiData.cu}&tr=${upiData.tr}`;

      // Generate QR code
      const qrCode = await QRCode.toDataURL(upiUri);

      return {
        payment,
        upi: {
          qrCode,
          reference: payment.payment_reference,
          upiId: upiData.pa
        }
      };
    }

    return { payment };
  }

  // Verify UPI payment
  static async verifyUpiPayment(
    paymentReference: string,
    userId: string
  ): Promise<Payment> {
    // Get the payment
    const payment = await PaymentModel.findByReference(paymentReference);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if the order belongs to the user
    if (order.user_id !== userId) {
      throw new AppError('Not authorized to access this payment', 403);
    }

    // In a real-world scenario, you would check with the payment gateway
    // Here, we'll simulate a successful payment

    // Update payment status
    const updatedPayment = await PaymentModel.updateStatus(
      payment.id,
      'completed',
      { transactionId: uuidv4() }
    );

    // Update order status
    await OrderModel.updateStatus(order.id, 'processing');

    return updatedPayment;
  }

  // Process card payment
  static async processCardPayment(
    paymentId: string,
    cardDetails: any,
    userId: string
  ): Promise<Payment> {
    // Get the payment
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if the order belongs to the user
    if (order.user_id !== userId) {
      throw new AppError('Not authorized to access this payment', 403);
    }

    // In a real-world scenario, you would process the payment with a payment gateway
    // Here, we'll simulate a successful payment

    // Update payment status
    const updatedPayment = await PaymentModel.updateStatus(
      payment.id,
      'completed',
      { 
        transactionId: uuidv4(),
        cardLast4: cardDetails.cardNumber.slice(-4)
      }
    );

    // Update order status
    await OrderModel.updateStatus(order.id, 'processing');

    return updatedPayment;
  }

  // Get payment status
  static async getPaymentStatus(
    paymentId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<Payment> {
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if the order belongs to the user or if the user is an admin
    if (order.user_id !== userId && !isAdmin) {
      throw new AppError('Not authorized to access this payment', 403);
    }

    return payment;
  }
}