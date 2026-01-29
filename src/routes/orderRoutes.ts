import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getSupplierOrders,     // ✅ Add this
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

// ✅ Supplier's orders
router.get('/supplier-orders', protect, getSupplierOrders); // GET /api/orders/supplier-orders

// ✅ Create new order
router.post('/', protect, createOrderValidator, createOrder); // POST /api/orders

// ✅ Get single order
router.get('/:id', protect, getOrderById); // GET /api/orders/:id

// ✅ Update order status (admin or supplier owner)
router.put('/:id/status', protect, updateOrderStatus); // PUT /api/orders/:id/status

export default router;
