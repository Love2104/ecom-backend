import { OrderModel, OrderInput, Order } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export class OrderService {
  // Create a new order
  static async createOrder(orderData: OrderInput): Promise<Order> {
    return await OrderModel.create(orderData);
  }

  // Get order by ID
  static async getOrderById(id: string, userId: string, isAdmin: boolean): Promise<Order> {
    const order = await OrderModel.findById(id);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if the order belongs to the user or if the user is an admin
    if (order.user_id !== userId && !isAdmin) {
      throw new AppError('Not authorized to access this order', 403);
    }

    return order;
  }

  // Get user's orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    return await OrderModel.findByUserId(userId);
  }

  // Update order status
  static async updateOrderStatus(
    id: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<Order> {
    const order = await OrderModel.updateStatus(id, status);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }
}