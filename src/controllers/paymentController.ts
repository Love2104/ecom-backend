import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentModel } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';
import { emailService } from '../services/emailService'; // Use centralized email service

// -------------------- RAZORPAY CONFIG --------------------
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Missing Razorpay credentials. Check your .env file.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

// -------------------- CREATE PAYMENT INTENT --------------------
export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError('Validation error', 400, errors.array()));

    const { orderId } = req.body; // Expect orderId
    const userId = req.user!.id;

    const order = await OrderModel.findById(orderId);
    if (!order) return next(new AppError('Order not found', 404));

    // Check authorization
    if (order.user_id !== userId) return next(new AppError('Unauthorized', 403));

    const existing = await PaymentModel.findByOrderId(orderId);
    if (existing && existing.status === 'COMPLETED') return next(new AppError('Payment already completed', 400));

    let payment = existing;
    if (!payment || payment.status === 'FAILED') {
      payment = await PaymentModel.create({
        order_id: orderId,
        amount: order.total,
        status: 'PENDING'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: payment.id,
      payment_capture: true,
    });

    // Update razorpay_order_id
    await PaymentModel.updateStatus(payment.id, 'PENDING', {
      razorpay_order_id: razorpayOrder.id,
      // razorpay_payment_id etc are separate
    });

    return res.status(201).json({
      success: true,
      payment,
      razorpay: {
        orderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopEase",
        description: `Order #${order.id.slice(-6)}`, // Simplified order number
        prefill: {
          name: req.user?.name || '',
          email: req.user?.email || '',
          contact: order.shipping_address.phone || ''
        },
        notes: {
          payment_id: payment.id,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user!.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new AppError("Missing payment verification fields", 400));
    }

    const payment = await PaymentModel.findByRazorpayOrderId(razorpay_order_id);
    if (!payment) return next(new AppError('Payment not found', 404));

    const order = await OrderModel.findById(payment.order_id);
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user_id !== userId) return next(new AppError('Unauthorized', 403));

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark failed?
      // await PaymentModel.updateStatus(payment.id, 'FAILED'); 
      return next(new AppError('Invalid signature', 400));
    }

    // Success
    const updatedPayment = await PaymentModel.updateStatus(payment.id, 'COMPLETED', {
      razorpay_payment_id,
      razorpay_signature,
    });

    await OrderModel.updateStatus(order.id, 'PROCESSING'); // Or PAID/CONFIRMED

    return res.status(200).json({ success: true, payment: updatedPayment });
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

    if (order.user_id !== req.user!.id && req.user!.role !== 'SUPERADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    return res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};
