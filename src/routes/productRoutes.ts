import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale
} from '../controllers/productController';

import { protect, restrictTo } from '../middlewares/auth';
import {
  createProductValidator,
  updateProductValidator
} from '../utils/validators';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale', getProductsOnSale);
router.get('/:id', getProductById);

// Protected routes (Superadmin & Supplier)
router.post(
  '/',
  protect,
  restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'),
  createProductValidator,
  createProduct
);

router.put(
  '/:id',
  protect,
  restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'),
  updateProductValidator,
  updateProduct
);

router.delete('/:id', protect, restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'), deleteProduct);

export default router;
