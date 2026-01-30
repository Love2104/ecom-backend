import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { OrderModel } from '../models/Order';
import { PaymentModel } from '../models/Payment';
import { AppError } from '../middlewares/errorHandler';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError('Validation error', 400, errors.array()));

    const { items, shipping_address } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item', 400));
    }

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

    // Check authorization
    const isSupplier = req.user!.role === 'SUPPLIER' && await OrderModel.isSupplierOfOrder(req.params.id, req.user!.id);

    if (order.user_id !== req.user!.id && req.user!.role !== 'SUPERADMIN' && req.user!.role !== 'MANAGER' && !isSupplier) {
      return next(new AppError('Not authorized to access this order', 403));
    }


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
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const isSupplier = req.user!.role === 'SUPPLIER' && await OrderModel.isSupplierOfOrder(req.params.id, req.user!.id);

    if (req.user!.role !== 'SUPERADMIN' && req.user!.role !== 'MANAGER' && !isSupplier) {
      return next(new AppError('Not authorized to update this order', 403));
    }


    const order = await OrderModel.updateStatus(req.params.id, status);
    if (!order) return next(new AppError('Order not found', 404));

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};