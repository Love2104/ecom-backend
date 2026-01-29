import express from 'express';
<<<<<<< HEAD
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile 
} from '../controllers/authController';
import { protect } from '../middlewares/auth';
=======
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
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
import { registerValidator, loginValidator } from '../utils/validators';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
<<<<<<< HEAD

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
=======
router.post('/manager/login', managerLogin);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/request-supplier', protect, requestSupplier);
router.post('/manager/create', protect, restrictTo('SUPERADMIN', 'MANAGER'), createManager);
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

export default router;