import express from 'express';
import {
  register,
  login,
  managerLogin,
  createManager,
  requestSupplier,
  getCurrentUser,
  verifyOtp,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect, restrictTo } from '../middlewares/auth';
import { registerValidator, loginValidator } from '../utils/validators';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/manager/login', managerLogin);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/request-supplier', protect, requestSupplier);
router.post('/manager/create', protect, restrictTo('SUPERADMIN', 'MANAGER'), createManager);

export default router;