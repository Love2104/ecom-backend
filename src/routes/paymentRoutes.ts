import express from 'express';
import {
  createPaymentIntent,
  verifyPayment,
  getPaymentStatus
} from '../controllers/paymentController';
import { protect } from '../middlewares/auth';
import {
  createPaymentValidator,
  verifyPaymentValidator
} from '../utils/validators';

const router = express.Router();

router.post('/create-intent', protect, createPaymentValidator, createPaymentIntent);
router.post('/verify', protect, verifyPaymentValidator, verifyPayment);
router.get('/:id', protect, getPaymentStatus);

export default router;
