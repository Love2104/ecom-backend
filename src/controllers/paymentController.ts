import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModel } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

// Create a payment intent
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { orderId, method } = req.body;

    // Get the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if the order belongs to the user
    if (order.user_id !== req.user!.id) {
      return next(new AppError('Not authorized to access this order', 403));
    }

    // Check if payment already exists for this order
    const existingPayment = await PaymentModel.findByOrderId(orderId);
    if (existingPayment) {
      return next(new AppError('Payment already exists for this order', 400));
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

      res.status(201).json({
        success: true,
        payment: {
          id: payment.id,
          reference: payment.payment_reference,
          amount: payment.amount,
          method: payment.method,
          status: payment.status
        },
        upi: {
          qrCode,
          reference: payment.payment_reference,
          upiId: upiData.pa
        }
      });
    } else {
      // For card payments, just return the payment details
      res.status(201).json({
        success: true,
        payment: {
          id: payment.id,
          reference: payment.payment_reference,
          amount: payment.amount,
          method: payment.method,
          status: payment.status
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Verify UPI payment
export const verifyUpiPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { paymentReference } = req.body;

    // Get the payment
    const payment = await PaymentModel.findByReference(paymentReference);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if the order belongs to the user
    if (order.user_id !== req.user!.id) {
      return next(new AppError('Not authorized to access this payment', 403));
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

    res.status(200).json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// Process card payment
export const processCardPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { paymentId, cardDetails } = req.body;

    // Get the payment
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if the order belongs to the user
    if (order.user_id !== req.user!.id) {
      return next(new AppError('Not authorized to access this payment', 403));
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

    res.status(200).json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// Get payment status
export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    
    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Get the order
    const order = await OrderModel.findById(payment.order_id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if the order belongs to the user or if the user is an admin
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return next(new AppError('Not authorized to access this payment', 403));
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};