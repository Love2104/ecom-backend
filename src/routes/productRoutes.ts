import express from 'express';
<<<<<<< HEAD
import { 
=======
import {
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
<<<<<<< HEAD
  getProductsOnSale,
  getRelatedProducts
} from '../controllers/productController';

import { protect, admin } from '../middlewares/auth';
import { 
  createProductValidator, 
  updateProductValidator 
=======
  getProductsOnSale
} from '../controllers/productController';

import { protect, restrictTo } from '../middlewares/auth';
import {
  createProductValidator,
  updateProductValidator
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
} from '../utils/validators';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale', getProductsOnSale);
<<<<<<< HEAD
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// Admin routes (image via URL only)
router.post(
  '/',
  protect,
  admin,
=======
router.get('/:id', getProductById);

// Protected routes (Superadmin & Supplier)
router.post(
  '/',
  protect,
  restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'),
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  createProductValidator,
  createProduct
);

router.put(
  '/:id',
  protect,
<<<<<<< HEAD
  admin,
=======
  restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'),
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)
  updateProductValidator,
  updateProduct
);

<<<<<<< HEAD
router.delete('/:id', protect, admin, deleteProduct);
=======
router.delete('/:id', protect, restrictTo('SUPERADMIN', 'SUPPLIER', 'MANAGER'), deleteProduct);
>>>>>>> 77a314b (Add supplier demotion feature with product cleanup and forgot password functionality)

export default router;
