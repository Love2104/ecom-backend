import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import { validationResult } from 'express-validator';
import { PaymentModel } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// -------------------- CREATE PAYMENT INTENT --------------------
export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { orderId, method } = req.body;
    const userId = req.user!.id;

    const order = await OrderModel.findById(orderId);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.user_id !== userId) return next(new AppError('Unauthorized', 403));

    const existing = await PaymentModel.findByOrderId(orderId);
    if (existing) return next(new AppError('Payment already exists', 400));

    const payment = await PaymentModel.create({
      order_id: orderId,
      amount: order.total,
      method,
      payment_details: {},
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Razorpay needs amount in paise
      currency: 'INR',
      receipt: payment.payment_reference,
      payment_capture: true,
    });

    await PaymentModel.updateRazorpayOrderId(payment.id, razorpayOrder.id);

    return res.status(201).json({
      success: true,
      payment,
      razorpay: {
        orderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopEase",
        description: `Payment for order #${order.id.slice(-6)}`,
        prefill: {
          name: order.shipping_address.name,
          email: req.user!.email || '',
          contact: order.shipping_address.phone || '',
        },
        notes: {
          payment_reference: payment.payment_reference,
          order_id: order.id,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// -------------------- VERIFY PAYMENT --------------------
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.user!.id;

    const payment = await PaymentModel.findByRazorpayOrderId(razorpay_order_id);
    if (!payment) return next(new AppError('Payment not found', 404));

    const order = await OrderModel.findById(payment.order_id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.user_id !== userId) return next(new AppError('Unauthorized', 403));

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError('Invalid signature. Payment verification failed.', 400));
    }

    const updated = await PaymentModel.updateStatus(payment.id, 'completed', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await OrderModel.updateStatus(order.id, 'processing');

    return res.status(200).json({ success: true, payment: updated });
  } catch (err) {
    next(err);
  }
};

// -------------------- GET PAYMENT STATUS --------------------
export const getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return next(new AppError('Payment not found', 404));

    const order = await OrderModel.findById(payment.order_id);
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return next(new AppError('Unauthorized', 403));
    }

    return res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};
