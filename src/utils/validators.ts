import { body, param, query } from 'express-validator';

// Auth validators
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

// Product validators
export const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
 body('image_url')
  .isURL().withMessage('Image must be a valid URL'),

  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('tags').optional().custom((value) => {
    // Accept both array or comma-separated string (e.g., "tag1,tag2")
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('Tags must be an array or a comma-separated string');
  })
];

export const updateProductValidator = [
  param('id').isUUID().withMessage('Invalid product ID'),
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
 body('image_url')
  .isURL().withMessage('Image must be a valid URL'),
  body('tags').optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('Tags must be an array or a comma-separated string');
  })
];


// Order validators
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
  body('shipping_address.country').notEmpty().withMessage('Country is required'),
  body('payment_method').isIn(['card', 'upi']).withMessage('Payment method must be card or upi')
];

// Payment validators
export const createPaymentValidator = [
  body('orderId').isUUID().withMessage('Order ID must be valid'),
  body('method').isIn(['card', 'upi']).withMessage('Payment method must be card or upi')
];

export const verifyUpiPaymentValidator = [
  body('paymentReference').notEmpty().withMessage('Payment reference is required')
];

export const processCardPaymentValidator = [
  body('paymentId').isUUID().withMessage('Payment ID must be valid'),
  body('cardDetails').isObject().withMessage('Card details are required'),
  body('cardDetails.cardNumber').isString().withMessage('Card number is required'),
  body('cardDetails.cardName').isString().withMessage('Card name is required'),
  body('cardDetails.expiryDate').isString().withMessage('Expiry date is required'),
  body('cardDetails.cvv').isString().withMessage('CVV is required')
];