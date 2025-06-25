import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile 
} from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { registerValidator, loginValidator } from '../utils/validators';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

export default router;