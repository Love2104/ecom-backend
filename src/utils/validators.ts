import { body, param } from 'express-validator';

// -------------------- AUTH VALIDATORS --------------------
export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

// -------------------- PRODUCT VALIDATORS --------------------
export const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category_id').isUUID().withMessage('Valid Category ID is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
];

export const updateProductValidator = [
  param('id').isUUID().withMessage('Invalid product ID'),
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category_id').optional().isUUID().withMessage('Category ID must be valid')
];

// -------------------- ORDER VALIDATORS --------------------
export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product_id').isUUID().withMessage('Product ID must be valid'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shipping_address').isObject().withMessage('Shipping address is required'),
  body('shipping_address.name').notEmpty().withMessage('Recipient name is required'),
  body('shipping_address.address').notEmpty().withMessage('Address is required'),
  body('shipping_address.city').notEmpty().withMessage('City is required'),
  body('shipping_address.state').notEmpty().withMessage('State is required'),
  body('shipping_address.zip_code').notEmpty().withMessage('ZIP code is required'),
  body('shipping_address.country').notEmpty().withMessage('Country is required')
];

// -------------------- PAYMENT VALIDATORS --------------------
export const createPaymentValidator = [
  body('orderId').isUUID().withMessage('Order ID must be valid')
];

export const verifyUpiPaymentValidator = [
  body('paymentReference').notEmpty().withMessage('Payment reference is required')
];

export const processCardPaymentValidator = [
  body('paymentId').isUUID().withMessage('Payment ID must be valid'),
  body('cardDetails').isObject().withMessage('Card details are required')
];

// Razorpay payment verification validator
export const verifyPaymentValidator = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
];
