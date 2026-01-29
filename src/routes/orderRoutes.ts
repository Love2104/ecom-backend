import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
<<<<<<< HEAD
=======
  getSupplierOrders,     // ✅ Add this
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
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

<<<<<<< HEAD
=======
// ✅ Supplier's orders
router.get('/supplier-orders', protect, getSupplierOrders); // GET /api/orders/supplier-orders

>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
// ✅ Create new order
router.post('/', protect, createOrderValidator, createOrder); // POST /api/orders

// ✅ Get single order
router.get('/:id', protect, getOrderById); // GET /api/orders/:id

<<<<<<< HEAD
// ✅ Update order status (admin)
router.put('/:id/status', protect, admin, updateOrderStatus); // PUT /api/orders/:id/status
=======
// ✅ Update order status (admin or supplier owner)
router.put('/:id/status', protect, updateOrderStatus); // PUT /api/orders/:id/status
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

export default router;
