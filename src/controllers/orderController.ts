import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { OrderModel } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { items, shipping_address, payment_method } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item', 400));
    }

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
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
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
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const order = await OrderModel.updateStatus(req.params.id, status);
    if (!order) return next(new AppError('Order not found', 404));

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};