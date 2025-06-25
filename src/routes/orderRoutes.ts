import express from 'express';
import { 
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus
} from '../controllers/orderController';
import { protect, admin } from '../middlewares/auth';
import { createOrderValidator } from '../utils/validators';

const router = express.Router();

// Protected routes
router.post('/', protect, createOrderValidator, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;