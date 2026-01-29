import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { OrderModel } from '../models/Order';
<<<<<<< HEAD
=======
import { PaymentModel } from '../models/Payment';
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
import { AppError } from '../middlewares/errorHandler';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
<<<<<<< HEAD
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { items, shipping_address, payment_method } = req.body;
=======
    if (!errors.isEmpty()) return next(new AppError('Validation error', 400, errors.array()));

    const { items, shipping_address } = req.body;
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item', 400));
    }

<<<<<<< HEAD
    for (const item of items) {
      if (!item.product_id || typeof item.quantity !== 'number' || item.quantity < 1) {
        return next(new AppError('Invalid item format. Each item must have a product_id and quantity >= 1', 400));
      }
    }

    const order = await OrderModel.create({
      user_id: req.user!.id,
      items,
      shipping_address,
      payment_method
=======
    const order = await OrderModel.create({
      user_id: req.user!.id,
      items,
      shipping_address
    });

    // Create initial payment record (Pending)
    // Front-end should then initiate Razorpay flow using this payment/order ID?
    // Or we create Razorpay order here?
    // Prompt says: "Create Razorpay Order (Server)" is a separate step usually, but typically happens with Order creation or immediately after.
    // Let's create a local Payment record.

    await PaymentModel.create({
      order_id: order.id,
      amount: order.total,
      status: 'PENDING'
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
<<<<<<< HEAD
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return next(new AppError('Not authorized to access this order', 403));
    }
=======

    // Check authorization
    const isSupplier = req.user!.role === 'SUPPLIER' && await OrderModel.isSupplierOfOrder(req.params.id, req.user!.id);

    if (order.user_id !== req.user!.id && req.user!.role !== 'SUPERADMIN' && req.user!.role !== 'MANAGER' && !isSupplier) {
      return next(new AppError('Not authorized to access this order', 403));
    }

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderModel.findByUserId(req.user!.id);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
=======
export const getSupplierOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPPLIER' && req.user!.role !== 'SUPERADMIN' && req.user!.role !== 'MANAGER') {
      return next(new AppError('Not authorized as a supplier', 403));
    }
    const orders = await OrderModel.findBySupplierId(req.user!.id);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
export const getAllOrders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderModel.findAll();
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
<<<<<<< HEAD
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
=======
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

<<<<<<< HEAD
=======
    const isSupplier = req.user!.role === 'SUPPLIER' && await OrderModel.isSupplierOfOrder(req.params.id, req.user!.id);

    if (req.user!.role !== 'SUPERADMIN' && req.user!.role !== 'MANAGER' && !isSupplier) {
      return next(new AppError('Not authorized to update this order', 403));
    }

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
    const order = await OrderModel.updateStatus(req.params.id, status);
    if (!order) return next(new AppError('Order not found', 404));

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};