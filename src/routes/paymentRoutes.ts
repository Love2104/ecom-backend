import express from 'express';
import { 
  createPaymentIntent,
  verifyUpiPayment,
  processCardPayment,
  getPaymentStatus
} from '../controllers/paymentController';
import { protect } from '../middlewares/auth';
import { 
  createPaymentValidator, 
  verifyUpiPaymentValidator,
  processCardPaymentValidator
} from '../utils/validators';

const router = express.Router();

// Protected routes
router.post('/create-intent', protect, createPaymentValidator, createPaymentIntent);
router.post('/verify-upi', protect, verifyUpiPaymentValidator, verifyUpiPayment);
router.post('/process-card', protect, processCardPaymentValidator, processCardPayment);
router.get('/:id', protect, getPaymentStatus);

export default router;