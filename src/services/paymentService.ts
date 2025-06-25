import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModel, PaymentInput, Payment } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export class PaymentService {
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
    const order = await OrderModel.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId) throw new AppError('Not authorized', 403);

    const existingPayment = await PaymentModel.findByOrderId(orderId);
    if (existingPayment) throw new AppError('Payment already exists', 400);

    const payment = await PaymentModel.create({
      order_id: orderId,
      amount: order.total,
      method,
      payment_details: {}
    });

    if (method === 'upi') {
      const upiData = {
        pa: 'merchant@upi',
        pn: 'ShopEase',
        am: order.total.toString(),
        cu: 'INR',
        tr: payment.payment_reference
      };
      const upiUri = `upi://pay?pa=${upiData.pa}&pn=${upiData.pn}&am=${upiData.am}&cu=${upiData.cu}&tr=${upiData.tr}`;
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

  static async verifyUpiPayment(paymentReference: string, userId: string): Promise<Payment> {
    const payment = await PaymentModel.findByReference(paymentReference);
    if (!payment) throw new AppError('Payment not found', 404);

    const order = await OrderModel.findById(payment.order_id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId) throw new AppError('Unauthorized', 403);

    const updatedPayment = await PaymentModel.updateStatus(payment.id, 'completed', {
      transactionId: uuidv4()
    });

    if (!updatedPayment) throw new AppError('Failed to update payment', 500);

    await OrderModel.updateStatus(order.id, 'processing');
    return updatedPayment;
  }

  static async processCardPayment(paymentId: string, cardDetails: any, userId: string): Promise<Payment> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);

    const order = await OrderModel.findById(payment.order_id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId) throw new AppError('Unauthorized', 403);

    const updatedPayment = await PaymentModel.updateStatus(payment.id, 'completed', {
      transactionId: uuidv4(),
      cardLast4: cardDetails.cardNumber.slice(-4)
    });

    if (!updatedPayment) throw new AppError('Failed to update payment', 500);

    await OrderModel.updateStatus(order.id, 'processing');
    return updatedPayment;
  }

  static async getPaymentStatus(paymentId: string, userId: string, isAdmin: boolean): Promise<Payment> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);

    const order = await OrderModel.findById(payment.order_id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user_id !== userId && !isAdmin) throw new AppError('Unauthorized', 403);

    return payment;
  }
}
