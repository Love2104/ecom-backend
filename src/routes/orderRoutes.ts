import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,           // ✅ Import
  updateOrderStatus
} from '../controllers/orderController';
import { protect, admin } from '../middlewares/auth';
import { createOrderValidator } from '../utils/validators';

const router = express.Router();

// ✅ Admin route to fetch all orders
router.get('/', protect, admin, getAllOrders); // GET /api/orders

// ✅ User's orders
router.get('/my-orders', protect, getUserOrders); // GET /api/orders/my-orders

// ✅ Create new order
router.post('/', protect, createOrderValidator, createOrder); // POST /api/orders

// ✅ Get single order
router.get('/:id', protect, getOrderById); // GET /api/orders/:id

// ✅ Update order status (admin)
router.put('/:id/status', protect, admin, updateOrderStatus); // PUT /api/orders/:id/status

export default router;
